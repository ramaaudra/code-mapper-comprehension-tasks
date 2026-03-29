import type { ExplorerViewMode } from '@/shared/types/explorer'

export interface CycleTriageUrlState {
  viewMode: ExplorerViewMode | null
  selectedCycleId: string | null
  focusFilePath: string | null
  showNearbyImports: boolean
}

const VIEW_PARAM = 'view'
const CYCLE_PARAM = 'cycle'
const CYCLE_FILE_PARAM = 'cycleFile'
const NEARBY_PARAM = 'nearby'

export function parseCycleTriageSearch(search: string): CycleTriageUrlState {
  const params = new URLSearchParams(search)
  const viewParam = params.get(VIEW_PARAM)

  if (viewParam !== 'cycle-triage') {
    return {
      viewMode: null,
      selectedCycleId: null,
      focusFilePath: null,
      showNearbyImports: false
    }
  }

  return {
    viewMode: 'cycle-triage',
    selectedCycleId: params.get(CYCLE_PARAM),
    focusFilePath: params.get(CYCLE_FILE_PARAM),
    showNearbyImports: params.get(NEARBY_PARAM) === '1'
  }
}

export function buildCycleTriageSearch(
  search: string,
  state: CycleTriageUrlState
): string {
  const params = new URLSearchParams(search)
  params.delete(VIEW_PARAM)
  params.delete(CYCLE_PARAM)
  params.delete(CYCLE_FILE_PARAM)
  params.delete(NEARBY_PARAM)

  if (state.viewMode === 'cycle-triage') {
    params.set(VIEW_PARAM, state.viewMode)

    if (state.selectedCycleId) {
      params.set(CYCLE_PARAM, state.selectedCycleId)
    }

    if (state.focusFilePath) {
      params.set(CYCLE_FILE_PARAM, state.focusFilePath)
    }

    if (state.showNearbyImports) {
      params.set(NEARBY_PARAM, '1')
    }
  }

  const nextSearch = params.toString()
  return nextSearch ? `?${nextSearch}` : ''
}
