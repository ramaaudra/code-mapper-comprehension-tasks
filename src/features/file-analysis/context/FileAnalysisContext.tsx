/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import { useAnalysisData } from '@/shared/hooks/useAnalysisData'
import { usePreparedAnalysis } from '@/shared/hooks/usePreparedAnalysis'
import { createAliasedPathSet } from '@/shared/lib/analysis-paths'
import { getValueFromMap } from '@/shared/lib/utils'

import type { PreparedAnalysisSnapshot } from '@/shared/lib/analysis-preparation'
import type { FileRiskProfile } from '@/shared/types/risk'

interface FileAnalysisPreparedContextValue extends PreparedAnalysisSnapshot {
  getRiskProfileForFile: (fileId: string | null) => FileRiskProfile | null
}

interface FileAnalysisInteractionContextValue {
  selectedFileId: string | null
  hoveredFile: string | null
  setSelectedFileId: (id: string | null) => void
  setHoveredFile: (id: string | null) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  brokenFilesSet: Set<string>
  newOrphansSet: Set<string>
  setSimulationResult: (
    result: {
      brokenFiles: string[]
      newOrphans: string[]
    } | null
  ) => void
  isSimulating: boolean
  setIsSimulating: (value: boolean) => void
}

const FileAnalysisPreparedContext =
  createContext<FileAnalysisPreparedContextValue | null>(null)
const FileAnalysisInteractionContext =
  createContext<FileAnalysisInteractionContextValue | null>(null)

function useRequiredContext<T>(
  context: T | null,
  hookName: string,
  providerName: string
): T {
  if (!context) {
    throw new Error(`${hookName} must be used within ${providerName}`)
  }

  return context
}

export function useFileAnalysisPrepared() {
  return useRequiredContext(
    useContext(FileAnalysisPreparedContext),
    'useFileAnalysisPrepared',
    'FileAnalysisProvider'
  )
}

export function useFileAnalysisInteraction() {
  return useRequiredContext(
    useContext(FileAnalysisInteractionContext),
    'useFileAnalysisInteraction',
    'FileAnalysisProvider'
  )
}

export function useFileAnalysisContext() {
  const prepared = useFileAnalysisPrepared()
  const interaction = useFileAnalysisInteraction()

  return useMemo(
    () => ({
      ...prepared,
      ...interaction
    }),
    [prepared, interaction]
  )
}

interface FileAnalysisProviderProps {
  children: React.ReactNode
}

export function FileAnalysisProvider({ children }: FileAnalysisProviderProps) {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [hoveredFileImmediate, setHoveredFileImmediate] = useState<
    string | null
  >(null)
  const [hoveredFile, setHoveredFile] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [simulationResult, setSimulationResult] = useState<{
    brokenFiles: string[]
    newOrphans: string[]
  } | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const { analysisData } = useAnalysisData()
  const preparedAnalysis = usePreparedAnalysis(analysisData)

  useEffect(() => {
    const timer = setTimeout(() => {
      setHoveredFile(hoveredFileImmediate)
    }, 50)

    return () => clearTimeout(timer)
  }, [hoveredFileImmediate])

  const brokenFilesSet = useMemo(
    () =>
      createAliasedPathSet(
        simulationResult?.brokenFiles ?? [],
        preparedAnalysis.pathAliasLookup
      ),
    [preparedAnalysis.pathAliasLookup, simulationResult?.brokenFiles]
  )

  const newOrphansSet = useMemo(
    () =>
      createAliasedPathSet(
        simulationResult?.newOrphans ?? [],
        preparedAnalysis.pathAliasLookup
      ),
    [preparedAnalysis.pathAliasLookup, simulationResult?.newOrphans]
  )

  const getRiskProfileForFile = useCallback(
    (fileId: string | null): FileRiskProfile | null => {
      if (!fileId) {
        return null
      }

      return getValueFromMap(preparedAnalysis.riskProfileMap, fileId) ?? null
    },
    [preparedAnalysis.riskProfileMap]
  )

  const preparedValue = useMemo<FileAnalysisPreparedContextValue>(
    () => ({
      ...preparedAnalysis,
      getRiskProfileForFile
    }),
    [preparedAnalysis, getRiskProfileForFile]
  )

  const interactionValue = useMemo<FileAnalysisInteractionContextValue>(
    () => ({
      selectedFileId,
      hoveredFile,
      setSelectedFileId,
      setHoveredFile: setHoveredFileImmediate,
      searchQuery,
      setSearchQuery,
      brokenFilesSet,
      newOrphansSet,
      setSimulationResult,
      isSimulating,
      setIsSimulating
    }),
    [
      selectedFileId,
      hoveredFile,
      searchQuery,
      brokenFilesSet,
      newOrphansSet,
      isSimulating
    ]
  )

  return (
    <FileAnalysisPreparedContext.Provider value={preparedValue}>
      <FileAnalysisInteractionContext.Provider value={interactionValue}>
        {children}
      </FileAnalysisInteractionContext.Provider>
    </FileAnalysisPreparedContext.Provider>
  )
}
