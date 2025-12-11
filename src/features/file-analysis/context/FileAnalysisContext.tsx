/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'

import { useAnalysisData } from '@/shared/hooks/useAnalysisData'
import { getValueFromMap, normalizePath } from '@/shared/lib/utils'
import type { FileRiskProfile } from '@/shared/types/risk'

interface FileAnalysisContextValue {
  // Selection state
  selectedFileId: string | null
  hoveredFile: string | null
  setSelectedFileId: (id: string | null) => void
  setHoveredFile: (id: string | null) => void

  // Search state
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Computed data from analysis (memoized)
  filesInCycle: Set<string>
  orphanFilesSet: Set<string>
  highImpactFilesMap: Map<string, number>
  riskProfileMap: Map<string, FileRiskProfile>

  // Simulation results state
  brokenFilesSet: Set<string>
  newOrphansSet: Set<string>
  setSimulationResult: (
    result: {
      brokenFiles: string[]
      newOrphans: string[]
    } | null
  ) => void

  // Utility functions
  getRiskProfileForFile: (fileId: string | null) => FileRiskProfile | null

  // Simulation loading state
  isSimulating: boolean
  setIsSimulating: (value: boolean) => void
}

const FileAnalysisContext = createContext<FileAnalysisContextValue | null>(null)

export function useFileAnalysisContext() {
  const context = useContext(FileAnalysisContext)
  if (!context) {
    throw new Error(
      'useFileAnalysisContext must be used within FileAnalysisProvider'
    )
  }
  return context
}

interface FileAnalysisProviderProps {
  children: React.ReactNode
}

export function FileAnalysisProvider({ children }: FileAnalysisProviderProps) {
  // Selection state
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [hoveredFile, setHoveredFile] = useState<string | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Simulation results state
  const [simulationResult, setSimulationResult] = useState<{
    brokenFiles: string[]
    newOrphans: string[]
  } | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  // Get analysis data from React Query
  const { analysisData, riskAnalysis } = useAnalysisData()

  // Computed: files in circular dependencies
  const filesInCycle = useMemo(() => {
    if (!analysisData?.issues?.circularDependencies) {
      return new Set<string>()
    }
    const allFilesInCycles = analysisData.issues.circularDependencies.flatMap(
      (dep) => dep.files
    )
    return new Set(allFilesInCycles)
  }, [analysisData?.issues?.circularDependencies])

  // Computed: orphan files
  const orphanFilesSet = useMemo(() => {
    if (!analysisData?.issues?.orphans) {
      return new Set<string>()
    }
    return new Set(analysisData.issues.orphans)
  }, [analysisData?.issues?.orphans])

  // Computed: high impact files
  const highImpactFilesMap = useMemo(() => {
    if (!analysisData?.issues?.highImpact) {
      return new Map<string, number>()
    }
    return new Map(
      analysisData.issues.highImpact.map((item) => [item.file, item.indegree])
    )
  }, [analysisData?.issues?.highImpact])

  // Computed: risk profile map with path normalization
  const riskProfileMap = useMemo(() => {
    const map = new Map<string, FileRiskProfile>()

    // Build node path lookup for label mapping
    const nodePathLookup = new Map<string, string>()
    if (analysisData?.nodes) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      analysisData.nodes.forEach((node: any) => {
        if (!node?.id) {
          return
        }
        const normalizedId = normalizePath(node.id)
        const relativeLabel =
          typeof node.label === 'string' ? normalizePath(node.label) : ''
        nodePathLookup.set(normalizedId, relativeLabel)
      })
    }

    // Map risk profiles
    riskAnalysis.forEach((profile) => {
      const normalizedFile = normalizePath(profile.file)
      map.set(normalizedFile, profile)

      // Also map by relative label
      const relativeLabel = nodePathLookup.get(normalizedFile)
      if (relativeLabel) {
        map.set(relativeLabel, profile)
      }
    })

    return map
  }, [analysisData, riskAnalysis])

  // Computed: simulation result sets
  const brokenFilesSet = useMemo(
    () => new Set(simulationResult?.brokenFiles || []),
    [simulationResult]
  )

  const newOrphansSet = useMemo(
    () => new Set(simulationResult?.newOrphans || []),
    [simulationResult]
  )

  // Utility: get risk profile for a file
  const getRiskProfileForFile = useCallback(
    (fileId: string | null): FileRiskProfile | null => {
      if (!fileId) {
        return null
      }
      return getValueFromMap(riskProfileMap, fileId) ?? null
    },
    [riskProfileMap]
  )

  const value = useMemo<FileAnalysisContextValue>(
    () => ({
      selectedFileId,
      hoveredFile,
      setSelectedFileId,
      setHoveredFile,
      searchQuery,
      setSearchQuery,
      filesInCycle,
      orphanFilesSet,
      highImpactFilesMap,
      riskProfileMap,
      brokenFilesSet,
      newOrphansSet,
      setSimulationResult,
      getRiskProfileForFile,
      isSimulating,
      setIsSimulating
    }),
    [
      selectedFileId,
      hoveredFile,
      searchQuery,
      filesInCycle,
      orphanFilesSet,
      highImpactFilesMap,
      riskProfileMap,
      brokenFilesSet,
      newOrphansSet,
      isSimulating,
      getRiskProfileForFile
    ]
  )

  return (
    <FileAnalysisContext.Provider value={value}>
      {children}
    </FileAnalysisContext.Provider>
  )
}
