export type ExplorerRuntimeMode = 'live' | 'report'

export type ExplorerViewMode =
  | 'overview'
  | 'graph'
  | 'architecture'
  | 'metrics-guide'
  | 'setup-guide'

export type GraphViewMode = 'file' | 'module'

export type NonGuideViewMode = Exclude<ExplorerViewMode, 'metrics-guide'>
