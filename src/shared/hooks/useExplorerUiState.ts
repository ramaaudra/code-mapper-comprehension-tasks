import { useCallback, useRef, useState } from 'react'

import { parseCycleTriageSearch } from '@/features/cycle-triage/lib/cycle-triage-url'

import type { FileTreeViewRef } from '@/features/file-analysis'
import type { AnalysisNode } from '@/shared/types/analysis'
import type {
  ExplorerViewMode,
  GraphViewMode,
  MetricsGuideMode,
  NonUtilityViewMode
} from '@/shared/types/explorer'
import type { Dispatch, RefObject, SetStateAction } from 'react'

interface UseExplorerUiStateOptions {
  initialLayoutDirection?: 'TB' | 'LR'
  initialViewMode?: ExplorerViewMode
  initialGraphViewMode?: GraphViewMode
  initialTreeCollapsed?: boolean
}

export interface ExplorerUiState {
  treeRef: RefObject<FileTreeViewRef | null>
  layoutDirection: 'TB' | 'LR'
  setLayoutDirection: Dispatch<SetStateAction<'TB' | 'LR'>>
  selectedNode: AnalysisNode | null
  setSelectedNode: Dispatch<SetStateAction<AnalysisNode | null>>
  viewMode: ExplorerViewMode
  setViewMode: Dispatch<SetStateAction<ExplorerViewMode>>
  graphViewMode: GraphViewMode
  setGraphViewMode: Dispatch<SetStateAction<GraphViewMode>>
  utilityReturnViewMode: NonUtilityViewMode
  setUtilityReturnViewMode: Dispatch<SetStateAction<NonUtilityViewMode>>
  metricsGuideMode: MetricsGuideMode
  setMetricsGuideMode: Dispatch<SetStateAction<MetricsGuideMode>>
  highlightedModule: string | null
  setHighlightedModule: Dispatch<SetStateAction<string | null>>
  focusedModulePath: string | null
  setFocusedModulePath: Dispatch<SetStateAction<string | null>>
  selectedCycleId: string | null
  setSelectedCycleId: Dispatch<SetStateAction<string | null>>
  showCycleNearbyImports: boolean
  setShowCycleNearbyImports: Dispatch<SetStateAction<boolean>>
  isTreeCollapsed: boolean
  setIsTreeCollapsed: Dispatch<SetStateAction<boolean>>
  toggleTreeView: () => void
  isLayoutTransitioning: boolean
}

export function useExplorerUiState({
  initialLayoutDirection = 'LR',
  initialViewMode = 'overview',
  initialGraphViewMode = 'file',
  initialTreeCollapsed = false
}: UseExplorerUiStateOptions = {}): ExplorerUiState {
  const initialCycleTriageState =
    typeof window === 'undefined'
      ? {
          viewMode: null,
          selectedCycleId: null,
          showNearbyImports: false
        }
      : parseCycleTriageSearch(window.location.search)
  const treeRef = useRef<FileTreeViewRef | null>(null)
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>(
    initialLayoutDirection
  )
  const [selectedNode, setSelectedNode] = useState<AnalysisNode | null>(null)
  const [viewMode, setViewMode] = useState<ExplorerViewMode>(
    initialCycleTriageState.viewMode ?? initialViewMode
  )
  const [graphViewMode, setGraphViewMode] =
    useState<GraphViewMode>(initialGraphViewMode)
  const [utilityReturnViewMode, setUtilityReturnViewMode] =
    useState<NonUtilityViewMode>(initialViewMode as NonUtilityViewMode)
  const [metricsGuideMode, setMetricsGuideMode] =
    useState<MetricsGuideMode>('quick')
  const [highlightedModule, setHighlightedModule] = useState<string | null>(
    null
  )
  const [focusedModulePath, setFocusedModulePath] = useState<string | null>(
    null
  )
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(
    initialCycleTriageState.selectedCycleId
  )
  const [showCycleNearbyImports, setShowCycleNearbyImports] = useState(
    initialCycleTriageState.showNearbyImports
  )
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(initialTreeCollapsed)

  const toggleTreeView = useCallback(() => {
    setIsTreeCollapsed((current) => !current)
  }, [])

  return {
    treeRef,
    layoutDirection,
    setLayoutDirection,
    selectedNode,
    setSelectedNode,
    viewMode,
    setViewMode,
    graphViewMode,
    setGraphViewMode,
    utilityReturnViewMode,
    setUtilityReturnViewMode,
    metricsGuideMode,
    setMetricsGuideMode,
    highlightedModule,
    setHighlightedModule,
    focusedModulePath,
    setFocusedModulePath,
    selectedCycleId,
    setSelectedCycleId,
    showCycleNearbyImports,
    setShowCycleNearbyImports,
    isTreeCollapsed,
    setIsTreeCollapsed,
    toggleTreeView,
    isLayoutTransitioning: false
  }
}
