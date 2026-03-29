export type ExplorerRuntimeMode = 'live' | 'report'

export type PrimaryExplorerViewMode = 'overview' | 'graph' | 'architecture'

export type UtilityExplorerViewMode =
  | 'metrics-guide'
  | 'setup-guide'
  | 'cycle-triage'

export type ExplorerViewMode = PrimaryExplorerViewMode | UtilityExplorerViewMode

export type GraphViewMode = 'file' | 'module'

export type NonUtilityViewMode = PrimaryExplorerViewMode

export type ExplorerContextChipTone = 'default' | 'warning'

export interface ExplorerContextChip {
  label: string
  tone?: ExplorerContextChipTone
}

export interface CycleTriageNavigationRequest {
  cycleId?: string | null
  focusFilePath?: string | null
}
