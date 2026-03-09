import { useCallback } from 'react'

import { getValueFromMap, hasMatchInSet, matchesFile } from '@/shared/lib/utils'

import type { FileRiskProfile } from '@/shared/types/risk'

interface FileStatusOptions {
  filesInCycle: Set<string>
  highImpactFilesMap: Map<string, number>
  orphanFilesSet: Set<string>
  riskProfileMap: Map<string, FileRiskProfile>
  brokenFilesSet: Set<string>
  newOrphansSet: Set<string>
}

export interface FileStatus {
  isInCycle: boolean
  highImpactCount: number | undefined
  isOrphan: boolean
  isBroken: boolean
  isNewOrphan: boolean
  riskProfile: FileRiskProfile | undefined
}

export function useFileStatus({
  filesInCycle,
  highImpactFilesMap,
  orphanFilesSet,
  riskProfileMap,
  brokenFilesSet,
  newOrphansSet
}: FileStatusOptions) {
  const getFileStatus = useCallback(
    (fileId: string): FileStatus => {
      return {
        isInCycle: hasMatchInSet(filesInCycle, fileId),
        highImpactCount: getValueFromMap(highImpactFilesMap, fileId),
        isOrphan: hasMatchInSet(orphanFilesSet, fileId),
        isBroken: hasMatchInSet(brokenFilesSet, fileId),
        isNewOrphan: hasMatchInSet(newOrphansSet, fileId),
        riskProfile: getValueFromMap(riskProfileMap, fileId)
      }
    },
    [
      filesInCycle,
      highImpactFilesMap,
      orphanFilesSet,
      riskProfileMap,
      brokenFilesSet,
      newOrphansSet
    ]
  )

  const getRiskProfileForFile = useCallback(
    (fileId: string | null): FileRiskProfile | null => {
      if (!fileId) {
        return null
      }
      return getValueFromMap(riskProfileMap, fileId) ?? null
    },
    [riskProfileMap]
  )

  const checkFileMatch = useCallback(
    (candidate: string, target: string): boolean => {
      return matchesFile(candidate, target)
    },
    []
  )

  return {
    getFileStatus,
    getRiskProfileForFile,
    checkFileMatch
  }
}
