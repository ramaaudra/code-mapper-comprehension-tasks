import { useCallback, useRef, useState } from 'react'

import type { FileTreeViewRef } from '@/features/file-analysis'
import type { AnalysisNode } from '@/shared/types/analysis'
import type { ExplorerViewMode, GraphViewMode } from '@/shared/types/explorer'
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
  highlightedModule: string | null
  setHighlightedModule: Dispatch<SetStateAction<string | null>>
  focusedModulePath: string | null
  setFocusedModulePath: Dispatch<SetStateAction<string | null>>
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
  const treeRef = useRef<FileTreeViewRef | null>(null)
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>(
    initialLayoutDirection
  )
  const [selectedNode, setSelectedNode] = useState<AnalysisNode | null>(null)
  const [viewMode, setViewMode] = useState<ExplorerViewMode>(initialViewMode)
  const [graphViewMode, setGraphViewMode] =
    useState<GraphViewMode>(initialGraphViewMode)
  const [highlightedModule, setHighlightedModule] = useState<string | null>(
    null
  )
  const [focusedModulePath, setFocusedModulePath] = useState<string | null>(
    null
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
    highlightedModule,
    setHighlightedModule,
    focusedModulePath,
    setFocusedModulePath,
    isTreeCollapsed,
    setIsTreeCollapsed,
    toggleTreeView,
    isLayoutTransitioning: false
  }
}
