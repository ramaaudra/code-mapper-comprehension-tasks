import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  createCycleReviewStorageKey,
  getAdjacentCycleId,
  getCycleReviewProgress,
  getCycleReviewStatus,
  markCycleAsReviewing,
  parseCycleReviewState,
  serializeCycleReviewState,
  setCycleReviewStatus
} from '../lib/cycle-triage-review-state'

import type {
  CycleReviewDirection,
  CycleReviewState,
  CycleReviewStatus
} from '../lib/cycle-triage-review-state'
import type { CycleTriageItem } from '../types/cycle-triage'

interface UseCycleTriageReviewStateOptions {
  items: CycleTriageItem[]
  selectedCycleId: string | null
  onSelectedCycleIdChange?: (cycleId: string | null) => void
}

function readPersistedReviewState(
  storageKey: string,
  cycleIds: string[]
): CycleReviewState {
  if (typeof window === 'undefined' || !cycleIds.length) {
    return {}
  }

  return parseCycleReviewState(
    window.localStorage.getItem(storageKey),
    cycleIds
  )
}

export function useCycleTriageReviewState({
  items,
  selectedCycleId,
  onSelectedCycleIdChange
}: UseCycleTriageReviewStateOptions) {
  const cycleIds = useMemo(() => items.map((item) => item.id), [items])
  const storageKey = useMemo(
    () => createCycleReviewStorageKey(cycleIds),
    [cycleIds]
  )
  const persistedReviewState = useMemo(
    () => readPersistedReviewState(storageKey, cycleIds),
    [cycleIds, storageKey]
  )
  const skipNextPersistRef = useRef(false)
  const [reviewState, setReviewState] =
    useState<CycleReviewState>(persistedReviewState)

  useEffect(() => {
    skipNextPersistRef.current = true
    setReviewState(persistedReviewState)
  }, [persistedReviewState])

  useEffect(() => {
    if (typeof window === 'undefined' || !cycleIds.length) {
      return
    }

    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false
      return
    }

    window.localStorage.setItem(
      storageKey,
      serializeCycleReviewState(reviewState)
    )
  }, [cycleIds.length, reviewState, storageKey])

  useEffect(() => {
    if (!selectedCycleId) {
      return
    }

    setReviewState((current) => markCycleAsReviewing(current, selectedCycleId))
  }, [selectedCycleId])

  const selectCycle = useCallback(
    (cycleId: string | null) => {
      if (cycleId) {
        setReviewState((current) => markCycleAsReviewing(current, cycleId))
      }

      onSelectedCycleIdChange?.(cycleId)
    },
    [onSelectedCycleIdChange]
  )

  const moveSelection = useCallback(
    (direction: CycleReviewDirection) => {
      const nextCycleId = getAdjacentCycleId(
        cycleIds,
        selectedCycleId,
        direction
      )

      if (nextCycleId && nextCycleId !== selectedCycleId) {
        selectCycle(nextCycleId)
      }
    },
    [cycleIds, selectCycle, selectedCycleId]
  )

  const setSelectedCycleReviewStatus = useCallback(
    (status: 'reviewed' | 'unreviewed') => {
      if (!selectedCycleId) {
        return
      }

      setReviewState((current) =>
        setCycleReviewStatus(current, selectedCycleId, status)
      )
    },
    [selectedCycleId]
  )

  const reviewStatusById = useMemo<Record<string, CycleReviewStatus>>(() => {
    return Object.fromEntries(
      cycleIds.map((cycleId) => [
        cycleId,
        getCycleReviewStatus(reviewState, cycleId)
      ])
    )
  }, [cycleIds, reviewState])

  const selectedCycleReviewStatus = getCycleReviewStatus(
    reviewState,
    selectedCycleId
  )
  const progress = useMemo(
    () => getCycleReviewProgress(reviewState, cycleIds),
    [cycleIds, reviewState]
  )

  return {
    reviewStatusById,
    selectedCycleReviewStatus,
    progress,
    selectCycle,
    selectNextCycle: () => moveSelection('next'),
    selectPreviousCycle: () => moveSelection('previous'),
    markSelectedCycleReviewed: () => setSelectedCycleReviewStatus('reviewed'),
    markSelectedCycleUnreviewed: () =>
      setSelectedCycleReviewStatus('unreviewed')
  }
}
