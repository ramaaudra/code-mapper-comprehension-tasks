import { shellCopy } from '../../content/shellCopy.ts'

import type { ExplorerRuntimeMode } from '../../types/explorer.ts'

interface ResolveTopBarActionGroupsOptions {
  hasData: boolean
  runtimeMode: ExplorerRuntimeMode
  loadError: string | null
}

interface ResolveTopBarIconLabelsOptions {
  isTreeCollapsed: boolean
  isLoading: boolean
  hasChanges: boolean
  totalChanges: number
}

export function resolveTopBarActionGroups({
  hasData,
  runtimeMode,
  loadError
}: ResolveTopBarActionGroupsOptions) {
  const showHelpGroup = hasData
  const showExportGroup = hasData && runtimeMode === 'live'
  const showOperationsGroup =
    Boolean(loadError && runtimeMode === 'live') ||
    (hasData && runtimeMode === 'live')

  return {
    showHelpGroup,
    showExportGroup,
    showOperationsGroup
  }
}

export function resolveTopBarIconLabels({
  isTreeCollapsed,
  isLoading,
  hasChanges,
  totalChanges
}: ResolveTopBarIconLabelsOptions) {
  return {
    sidebarToggle: isTreeCollapsed
      ? shellCopy.sidebar.show
      : shellCopy.sidebar.hide,
    refresh: isLoading
      ? shellCopy.actions.loading
      : hasChanges
        ? shellCopy.actions.reloadChanged(totalChanges)
        : shellCopy.actions.reload
  }
}
