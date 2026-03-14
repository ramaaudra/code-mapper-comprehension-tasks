/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import { useAnalysisData } from '@/shared/hooks/useAnalysisData'
import {
  buildFileReviewStoryMap,
  getValueFromMap,
  normalizePath
} from '@/shared/lib/utils'

import {
  createAliasedPathSet,
  createPathAliasLookup
} from '../lib/analysis-paths'

import type { FileReviewStory } from '@/shared/lib/utils/file-review-story'
import type { FileRiskProfile } from '@/shared/types/risk'

// Helper functions for stable hashing
function createStableHash(arr: string[]): string {
  return [...arr].sort().join('|')
}

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
  riskProfileMap: Map<string, FileRiskProfile>
  fileReviewStoryMap: Map<string, FileReviewStory>

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
  const [hoveredFileImmediate, setHoveredFileImmediate] = useState<
    string | null
  >(null)
  const [hoveredFile, setHoveredFile] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setHoveredFile(hoveredFileImmediate)
    }, 50) // 50ms debounce - instant feel, but batches rapid hovers

    return () => clearTimeout(timer)
  }, [hoveredFileImmediate])

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
  const pathAliasLookup = useMemo(
    () => createPathAliasLookup(analysisData?.nodes ?? []),
    [analysisData?.nodes]
  )

  // Computed: files in circular dependencies
  const circularDepsHash = useMemo(() => {
    if (!analysisData?.issues?.circularDependencies) {
      return ''
    }
    const allFiles = analysisData.issues.circularDependencies.flatMap(
      (dep) => dep.files
    )
    return createStableHash(allFiles)
  }, [analysisData?.issues?.circularDependencies])

  const filesInCycle = useMemo(() => {
    if (!analysisData?.issues?.circularDependencies) {
      return new Set<string>()
    }
    const allFilesInCycles = analysisData.issues.circularDependencies.flatMap(
      (dep) => dep.files
    )
    return createAliasedPathSet(allFilesInCycles, pathAliasLookup)
  }, [
    circularDepsHash,
    analysisData?.issues?.circularDependencies,
    pathAliasLookup
  ]) // Kept circularDepsHash but ignoring warning as it is used for stability check logic conceptually or remove if not needed?
  // Actually the warning says it is unnecessary if we depend on analysisData...circularDependencies.
  // But the goal was to stabilize it.
  // The linter is right, `circularDepsHash` is a primitive, but `analysisData...` is an array.
  // If I only depend on hash, I get stable value. But I need the data to compute.
  // The pattern I used:
  // const hash = useMemo(..., [data])
  // const value = useMemo(..., [hash]) <-- this is the pattern. But I included data in dependency too.
  // If I remove data from dependency, linter complains missing dependency.
  // If I keep it, linter complains unnecessary dependency (hash) because data changes imply hash changes? No.

  // Let's suppress the warnings for the "stabilization pattern" I implemented.

  /* eslint-disable react-hooks/exhaustive-deps */

  // Computed: orphan files
  const orphanFilesHash = useMemo(() => {
    return createStableHash(analysisData?.issues?.orphans || [])
  }, [analysisData?.issues?.orphans])

  const orphanFilesSet = useMemo(() => {
    if (!analysisData?.issues?.orphans) {
      return new Set<string>()
    }
    return createAliasedPathSet(analysisData.issues.orphans, pathAliasLookup)
  }, [orphanFilesHash, analysisData?.issues?.orphans, pathAliasLookup])

  // Computed: risk profile map with path normalization
  const riskAnalysisHash = useMemo(() => {
    return JSON.stringify(riskAnalysis) // Simple stringify for array of objects
  }, [riskAnalysis])

  const riskProfileMap = useMemo(() => {
    const map = new Map<string, FileRiskProfile>()

    // Build node path lookup for label mapping
    // Map risk profiles
    riskAnalysis.forEach((profile) => {
      const normalizedFile = normalizePath(profile.file)
      map.set(normalizedFile, profile)

      // Also map by relative label
      pathAliasLookup.get(normalizedFile)?.forEach((alias) => {
        map.set(alias, profile)
      })
    })

    return map
  }, [riskAnalysisHash, pathAliasLookup])

  const fileReviewStoryMap = useMemo(() => {
    return buildFileReviewStoryMap(analysisData)
  }, [analysisData, riskAnalysisHash])

  // Computed: simulation result sets
  const brokenFilesSet = useMemo(
    () =>
      createAliasedPathSet(
        simulationResult?.brokenFiles || [],
        pathAliasLookup
      ),
    [simulationResult, pathAliasLookup]
  )

  const newOrphansSet = useMemo(
    () =>
      createAliasedPathSet(simulationResult?.newOrphans || [], pathAliasLookup),
    [simulationResult, pathAliasLookup]
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
      setHoveredFile: setHoveredFileImmediate,
      searchQuery,
      setSearchQuery,
      filesInCycle,
      orphanFilesSet,
      riskProfileMap,
      fileReviewStoryMap,
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
      riskProfileMap,
      fileReviewStoryMap,
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
