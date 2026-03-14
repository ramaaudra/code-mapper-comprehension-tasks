// Components
export { ArchitecturePage } from './components/ArchitecturePage'
export { ArchitectureStats } from './components/ArchitectureStats'
export { ArchitectureTab } from './components/ArchitectureTab'
export { ArchitectureTable } from './components/ArchitectureTable'
export { CouplingBreakdown } from './components/CouplingBreakdown'
export { CycleBadge } from './components/CycleBadge'
export { FolderMetricsRow } from './components/FolderMetricsRow'
export { FolderMetricsTable } from './components/FolderMetricsTable'
export { InstabilityBadge } from './components/InstabilityBadge'

// Hooks
export {
  useArchitectureFiles,
  useArchitectureFolders,
  useFileArchitectureMetrics,
  useFolderDetail
} from './hooks/useArchitectureMetrics'
export {
  useFileReviewThresholdCalibration,
  useModuleReviewThresholdCalibration
} from './hooks/useReviewThresholdCalibration'

// Types
export type {
  CouplingMetrics,
  FileArchitectureMetrics,
  FolderArchitectureMetrics,
  FolderDetailResponse,
  SortConfig,
  SortDirection,
  SortKey
} from './types/architecture'
