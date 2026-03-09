import { useCallback, useMemo, useState } from 'react'

import { getModulePathFromNodeLabel } from '@/shared/lib/utils'

import type { FolderArchitectureMetrics } from '@/features/architecture/types/architecture'
import type { GraphViewMode } from '@/shared/types/explorer'

interface UseModuleExplorerStateOptions {
  selectedNodeLabel?: string
  setGraphViewMode: (mode: GraphViewMode) => void
  setFocusedModulePath: (modulePath: string | null) => void
  clearFocusedModule?: () => void
}

export function useModuleExplorerState({
  selectedNodeLabel,
  setGraphViewMode,
  setFocusedModulePath,
  clearFocusedModule
}: UseModuleExplorerStateOptions) {
  const [selectedModuleForPanel, setSelectedModuleForPanel] = useState<
    string | null
  >(null)
  const [selectedModuleData, setSelectedModuleData] = useState<
    FolderArchitectureMetrics | undefined
  >(undefined)

  const activeModuleFromSelectedNode = useMemo(
    () => getModulePathFromNodeLabel(selectedNodeLabel),
    [selectedNodeLabel]
  )

  const resetModulePanel = useCallback(() => {
    setSelectedModuleForPanel(null)
    setSelectedModuleData(undefined)
  }, [])

  const clearModuleFocus = useCallback(() => {
    resetModulePanel()

    if (clearFocusedModule) {
      clearFocusedModule()
      return
    }

    setFocusedModulePath(null)
  }, [clearFocusedModule, resetModulePanel, setFocusedModulePath])

  const handleModuleSelect = useCallback(
    (modulePath: string | null, moduleData?: FolderArchitectureMetrics) => {
      setSelectedModuleForPanel(modulePath)
      setSelectedModuleData(moduleData)
      setFocusedModulePath(modulePath)
    },
    [setFocusedModulePath]
  )

  const handleModulePanelClose = useCallback(() => {
    clearModuleFocus()
  }, [clearModuleFocus])

  const handleGraphViewModeChange = useCallback(
    (mode: GraphViewMode) => {
      setGraphViewMode(mode)

      if (mode === 'file') {
        clearModuleFocus()
        return
      }

      setFocusedModulePath(activeModuleFromSelectedNode)

      if (!activeModuleFromSelectedNode) {
        resetModulePanel()
      }
    },
    [
      activeModuleFromSelectedNode,
      clearModuleFocus,
      resetModulePanel,
      setFocusedModulePath,
      setGraphViewMode
    ]
  )

  return {
    activeModuleFromSelectedNode,
    selectedModuleForPanel,
    selectedModuleData,
    resetModulePanel,
    clearModuleFocus,
    handleModuleSelect,
    handleModulePanelClose,
    handleGraphViewModeChange
  }
}
