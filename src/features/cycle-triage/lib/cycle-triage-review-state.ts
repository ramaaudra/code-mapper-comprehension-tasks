export type CycleReviewStatus = 'unreviewed' | 'reviewing' | 'reviewed'
export type CycleReviewDirection = 'next' | 'previous'
export type PersistedCycleReviewStatus = Exclude<
  CycleReviewStatus,
  'unreviewed'
>
export type CycleReviewState = Partial<
  Record<string, PersistedCycleReviewStatus>
>

const REVIEW_STORAGE_PREFIX = 'code-mapper:cycle-triage:review'

function createStableHash(value: string): string {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }

  return hash.toString(36)
}

function normalizeCycleIds(cycleIds: string[]): string[] {
  return [...cycleIds].sort()
}

function isPersistedReviewStatus(
  value: unknown
): value is PersistedCycleReviewStatus {
  return value === 'reviewing' || value === 'reviewed'
}

export function createCycleReviewStorageKey(cycleIds: string[]): string {
  const normalizedIds = normalizeCycleIds(cycleIds)
  const fingerprint = normalizedIds.join('|')

  return `${REVIEW_STORAGE_PREFIX}:${normalizedIds.length}:${createStableHash(fingerprint)}`
}

export function parseCycleReviewState(
  rawValue: string | null,
  cycleIds: string[]
): CycleReviewState {
  if (!rawValue) {
    return {}
  }

  let parsedValue: unknown

  try {
    parsedValue = JSON.parse(rawValue)
  } catch {
    return {}
  }

  if (!parsedValue || typeof parsedValue !== 'object') {
    return {}
  }

  const validCycleIds = new Set(cycleIds)
  const nextState: CycleReviewState = {}

  for (const [cycleId, status] of Object.entries(parsedValue)) {
    if (!validCycleIds.has(cycleId) || !isPersistedReviewStatus(status)) {
      continue
    }

    nextState[cycleId] = status
  }

  return nextState
}

export function serializeCycleReviewState(state: CycleReviewState): string {
  return JSON.stringify(state)
}

export function getCycleReviewStatus(
  state: CycleReviewState,
  cycleId: string | null | undefined
): CycleReviewStatus {
  if (!cycleId) {
    return 'unreviewed'
  }

  return state[cycleId] ?? 'unreviewed'
}

export function setCycleReviewStatus(
  state: CycleReviewState,
  cycleId: string | null | undefined,
  status: CycleReviewStatus
): CycleReviewState {
  if (!cycleId) {
    return state
  }

  if (status === 'reviewing') {
    return markCycleAsReviewing(state, cycleId)
  }

  const nextState = { ...state }

  if (status === 'unreviewed') {
    delete nextState[cycleId]
    return nextState
  }

  nextState[cycleId] = status
  return nextState
}

export function markCycleAsReviewing(
  state: CycleReviewState,
  cycleId: string | null | undefined
): CycleReviewState {
  const nextState = { ...state }

  for (const [trackedCycleId, status] of Object.entries(nextState)) {
    if (status === 'reviewing') {
      delete nextState[trackedCycleId]
    }
  }

  if (!cycleId || nextState[cycleId] === 'reviewed') {
    return nextState
  }

  nextState[cycleId] = 'reviewing'
  return nextState
}

export function getCycleReviewProgress(
  state: CycleReviewState,
  cycleIds: string[]
) {
  let reviewedCount = 0
  let reviewingCount = 0

  for (const cycleId of cycleIds) {
    const status = getCycleReviewStatus(state, cycleId)

    if (status === 'reviewed') {
      reviewedCount += 1
      continue
    }

    if (status === 'reviewing') {
      reviewingCount += 1
    }
  }

  return {
    totalCount: cycleIds.length,
    reviewedCount,
    reviewingCount,
    unreviewedCount: Math.max(
      cycleIds.length - reviewedCount - reviewingCount,
      0
    )
  }
}

export function getAdjacentCycleId(
  cycleIds: string[],
  selectedCycleId: string | null,
  direction: CycleReviewDirection
): string | null {
  if (!cycleIds.length) {
    return null
  }

  if (!selectedCycleId) {
    return direction === 'next'
      ? (cycleIds[0] ?? null)
      : (cycleIds[cycleIds.length - 1] ?? null)
  }

  const selectedIndex = cycleIds.indexOf(selectedCycleId)

  if (selectedIndex === -1) {
    return direction === 'next'
      ? (cycleIds[0] ?? null)
      : (cycleIds[cycleIds.length - 1] ?? null)
  }

  if (direction === 'next') {
    return cycleIds[Math.min(selectedIndex + 1, cycleIds.length - 1)] ?? null
  }

  return cycleIds[Math.max(selectedIndex - 1, 0)] ?? null
}
