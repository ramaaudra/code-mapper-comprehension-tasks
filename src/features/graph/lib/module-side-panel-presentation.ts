import { graphCopy } from '../content/graphCopy'

export interface ModuleFileCycleBadgeCopy {
  label: string
  description: string
}

export function getModulePropagationDescription(
  hasCycle: boolean,
  fallbackDescription: string
): string {
  if (hasCycle) {
    return graphCopy.modulePanel.overview.cyclePropagationDescription
  }

  return fallbackDescription
}

export function getModuleFileCycleBadgeCopy(
  hasCycle: boolean
): ModuleFileCycleBadgeCopy | null {
  if (!hasCycle) {
    return null
  }

  return {
    label: graphCopy.modulePanel.files.cycleMemberLabel,
    description: graphCopy.modulePanel.files.cycleMemberDescription
  }
}
