/* eslint-disable @typescript-eslint/no-explicit-any */
import { MarkerType } from '@xyflow/react'
import type { Edge, Node } from '@xyflow/react'
import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { TreeApi } from 'react-arborist'

import { simulateRemoval } from '@/lib/api'

import type {
  DependencyEdgeData,
  DependencyNodeData
} from '@/components/graph/DependencyGraph'
import { GraphSkeleton } from '@/components/graph/GraphSkeleton'
import { ThemeProvider, useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  ArrowDown,
  ArrowRight,
  FileWarning,
  FileX,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sun
} from '@/components/ui/icons'
import { Input } from '@/components/ui/input'
import { useAnalysisData } from '@/hooks/useAnalysisData'
import type { AnalysisData, DependencyInfo } from '@/types/analysis'
import type { FileRiskProfile } from '@/types/risk'

// Lazy load heavy components
const FileTreeView = lazy(() =>
  import('@/components/graph/FileTreeView').then((m) => ({
    default: m.FileTreeView
  }))
)
const NodeDetailPanel = lazy(
  () => import('@/components/detail/NodeDetailPanel')
)
const ProjectDashboard = lazy(() =>
  import('@/components/dashboard/ProjectDashboard').then((m) => ({
    default: m.ProjectDashboard
  }))
)
// Helper function to get basename without path module
const getBasename = (filePath: string) => {
  return filePath.split('/').pop() || filePath
}

function AppContent() {
  const [query, setQuery] = useState('')
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('LR') // Default ke Left-Right
  const { theme, setTheme } = useTheme()
  const treeRef = useRef<TreeApi<any> | null>(null)

  const {
    analysisData,
    riskAnalysis,
    analysisLoadedAt,
    isLoading,
    loadError,
    loadAnalysis: fetchAnalysis
  } = useAnalysisData()

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<any | null>(null)
  const [hoveredFile, setHoveredFile] = useState<string | null>(null)
  const [graphElements, setGraphElements] = useState<{
    nodes: Node<DependencyNodeData>[]
    edges: Edge<DependencyEdgeData>[]
    focusNodeId: string | null
  }>({ nodes: [], edges: [], focusNodeId: null })
  const [viewMode, setViewMode] = useState<'overview' | 'file'>('overview')
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false)

  // Simulation state
  const [simulationResult, setSimulationResult] = useState<{
    brokenFiles: string[]
    newOrphans: string[]
  } | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const normalizePath = useCallback(
    (value: string) => value.replace(/\\/g, '/'),
    []
  )

  const nodePathLookup = useMemo(() => {
    if (!analysisData?.nodes) {
      return new Map<string, string>()
    }
    const map = new Map<string, string>()

    analysisData.nodes.forEach((node: any) => {
      if (!node?.id) {
        return
      }
      const normalizedId = normalizePath(node.id)
      const relativeLabel =
        typeof node.label === 'string' ? normalizePath(node.label) : ''
      map.set(normalizedId, relativeLabel)
    })

    return map
  }, [analysisData, normalizePath])

  const riskProfileMap = useMemo(() => {
    const map = new Map<string, FileRiskProfile>()

    riskAnalysis.forEach((profile) => {
      const normalizedFile = normalizePath(profile.file)
      map.set(normalizedFile, profile)

      const relativeLabel = nodePathLookup.get(normalizedFile)
      if (relativeLabel) {
        map.set(relativeLabel, profile)
      }
    })

    return map
  }, [normalizePath, nodePathLookup, riskAnalysis])

  const getRiskProfileForFile = useCallback(
    (fileId: string | null) => {
      if (!fileId) {
        return null
      }
      const normalizedId = normalizePath(fileId)

      if (riskProfileMap.has(normalizedId)) {
        return riskProfileMap.get(normalizedId) || null
      }

      for (const [key, profile] of riskProfileMap.entries()) {
        if (key === normalizedId || key.endsWith(`/${normalizedId}`)) {
          return profile
        }
      }

      return null
    },
    [normalizePath, riskProfileMap]
  )

  // MEMOIZED SETS: Untuk pengecekan cepat file status
  const filesInCycle = useMemo(() => {
    if (!analysisData?.issues?.circularDependencies) {
      return new Set<string>()
    }
    const allFilesInCycles = analysisData.issues.circularDependencies.flatMap(
      (dep) => dep.files
    )
    return new Set(allFilesInCycles)
  }, [analysisData?.issues?.circularDependencies])

  const highImpactFilesMap = useMemo(() => {
    if (!analysisData?.issues?.highImpact) {
      return new Map<string, number>()
    }
    return new Map(
      analysisData.issues.highImpact.map((item) => [item.file, item.indegree])
    )
  }, [analysisData?.issues?.highImpact])

  const orphanFilesSet = useMemo(() => {
    if (!analysisData?.issues?.orphans) {
      return new Set<string>()
    }
    return new Set(analysisData.issues.orphans)
  }, [analysisData?.issues?.orphans])

  // Memoized sets for simulation results
  const brokenFilesSet = useMemo(
    () => new Set(simulationResult?.brokenFiles || []),
    [simulationResult]
  )
  const newOrphansSet = useMemo(
    () => new Set(simulationResult?.newOrphans || []),
    [simulationResult]
  )

  const matchesFile = useCallback(
    (candidate: string, target: string) => {
      const normalizedCandidate = normalizePath(candidate)
      const normalizedTarget = normalizePath(target)
      return (
        normalizedCandidate === normalizedTarget ||
        normalizedCandidate.endsWith(`/${normalizedTarget}`)
      )
    },
    [normalizePath]
  )

  const hasMatchInSet = useCallback(
    (set: Set<string>, target: string) => {
      for (const candidate of set) {
        if (matchesFile(candidate, target)) {
          return true
        }
      }
      return false
    },
    [matchesFile]
  )

  const getValueFromMap = useCallback(
    (map: Map<string, number>, target: string) => {
      for (const [key, value] of map.entries()) {
        if (matchesFile(key, target)) {
          return value
        }
      }
      return undefined
    },
    [matchesFile]
  )

  const collectBadges = useCallback(
    (fullPath: string) => {
      const badges: DependencyNodeData['badges'] = []

      if (hasMatchInSet(filesInCycle, fullPath)) {
        badges.push({ label: 'Cycle', tone: 'danger' })
      }

      const highImpact = getValueFromMap(highImpactFilesMap, fullPath)
      if (typeof highImpact === 'number') {
        badges.push({ label: `High Impact ${highImpact}`, tone: 'warning' })
      }

      if (hasMatchInSet(orphanFilesSet, fullPath)) {
        badges.push({ label: 'Orphan', tone: 'warning' })
      }

      if (hasMatchInSet(brokenFilesSet, fullPath)) {
        badges.push({ label: 'Sim Result: Broken', tone: 'danger' })
      }

      if (hasMatchInSet(newOrphansSet, fullPath)) {
        badges.push({ label: 'Sim Result: Orphan', tone: 'info' })
      }

      const riskProfile = getRiskProfileForFile(fullPath)
      if (riskProfile) {
        const tone =
          riskProfile.category === 'Kritis'
            ? 'danger'
            : riskProfile.category === 'Tinggi'
              ? 'warning'
              : riskProfile.category === 'Sedang'
                ? 'info'
                : 'success'
        badges.push({ label: `Risiko ${riskProfile.category}`, tone })
      }

      return badges
    },
    [
      brokenFilesSet,
      filesInCycle,
      getRiskProfileForFile,
      hasMatchInSet,
      highImpactFilesMap,
      newOrphansSet,
      orphanFilesSet,
      getValueFromMap
    ]
  )

  const generateGraphForFile = useCallback(
    (fileId: string | null, sourceData?: AnalysisData | null) => {
      const currentData = sourceData ?? analysisData

      if (!fileId || !currentData) {
        setGraphElements({ nodes: [], edges: [], focusNodeId: null })
        return null
      }

      const dependencyMap = currentData.dependencyMap || {}
      const candidates = Object.keys(dependencyMap)
      const matchedEntry = candidates.find((candidate) =>
        matchesFile(candidate, fileId)
      )
      const actualFileId = matchedEntry ?? fileId
      const normalizedActual = normalizePath(actualFileId)

      const outgoing = dependencyMap[actualFileId] ?? []
      const incomingEntries = Object.entries(dependencyMap).filter(([, deps]) =>
        (deps as DependencyInfo[]).some((dep) =>
          matchesFile(dep.target, normalizedActual)
        )
      )

      const nodesMap = new Map<string, Node<DependencyNodeData>>()
      const edges: Edge<DependencyEdgeData>[] = []

      const ensureNode = (
        fullPath: string,
        direction: DependencyNodeData['direction'],
        subtitle?: string
      ) => {
        const normalizedFullPath = normalizePath(fullPath)
        const existing = nodesMap.get(normalizedFullPath)
        if (existing) {
          return existing
        }

        const node: Node<DependencyNodeData> = {
          id: normalizedFullPath,
          type: 'dependency',
          position: { x: 0, y: 0 },
          data: {
            label: getBasename(normalizedFullPath),
            fullPath: normalizedFullPath,
            direction,
            subtitle,
            badges: collectBadges(normalizedFullPath)
          }
        }

        nodesMap.set(normalizedFullPath, node)
        return node
      }

      ensureNode(normalizedActual, 'selected', 'Active file')

      outgoing.forEach((dep) => {
        const targetPath = normalizePath(dep.target)
        ensureNode(targetPath, 'outgoing', 'Required module')
        const strokeWidth = Math.min(1 + Math.log2(dep.strength + 1), 5)
        const strokeColor = dep.strength >= 3 ? '#ef4444' : '#d97706'
        edges.push({
          id: `out-${normalizedActual}->${targetPath}`,
          source: normalizedActual,
          target: targetPath,
          data: { strength: dep.strength, direction: 'outgoing' },
          style: { strokeWidth, stroke: strokeColor },
          animated: dep.strength >= 3,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: strokeColor,
            width: 18,
            height: 18
          },
          label: dep.strength > 1 ? `${dep.strength} refs` : '1 ref',
          labelBgPadding: [6, 2],
          labelBgBorderRadius: 4,
          labelBgStyle: {
            fill: 'rgba(248, 250, 252, 0.95)',
            stroke: 'rgba(15, 23, 42, 0.4)',
            color: '#0f172a'
          },
          labelStyle: {
            fontWeight: 600,
            letterSpacing: '0.01em'
          }
        })
      })

      incomingEntries.forEach(([importer, deps]) => {
        const importerPath = normalizePath(importer)
        ensureNode(importerPath, 'incoming', 'Imports this file')
        const connection = (deps as DependencyInfo[]).find((dep) =>
          matchesFile(dep.target, normalizedActual)
        )
        const strength = connection?.strength ?? 1
        const strokeWidth = Math.min(1 + Math.log2(strength + 1), 5)
        const strokeColor = strength >= 3 ? '#ef4444' : '#2563eb'
        edges.push({
          id: `in-${importerPath}->${normalizedActual}`,
          source: importerPath,
          target: normalizedActual,
          data: { strength, direction: 'incoming' },
          style: { strokeWidth, stroke: strokeColor },
          animated: strength >= 3,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: strokeColor,
            width: 18,
            height: 18
          },
          label: strength > 1 ? `${strength} refs` : '1 ref',
          labelBgPadding: [6, 2],
          labelBgBorderRadius: 4,
          labelBgStyle: {
            fill: 'rgba(248, 250, 252, 0.95)',
            stroke: 'rgba(15, 23, 42, 0.4)',
            color: '#0f172a'
          },
          labelStyle: {
            fontWeight: 600,
            letterSpacing: '0.01em'
          }
        })
      })

      const graphNodes = Array.from(nodesMap.values()).sort((a, b) => {
        const order: Record<DependencyNodeData['direction'], number> = {
          selected: 0,
          incoming: 1,
          outgoing: 2,
          placeholder: 3
        }
        return order[a.data.direction] - order[b.data.direction]
      })

      setGraphElements({
        nodes: graphNodes,
        edges,
        focusNodeId: normalizedActual
      })

      return normalizedActual
    },
    [analysisData, collectBadges, matchesFile, normalizePath]
  )

  const handleFileSelect = useCallback(
    (fileId: string | null) => {
      if (!fileId || !analysisData) {
        setSelectedFileId(null)
        setSelectedNode(null)
        setViewMode('overview')
        setGraphElements({ nodes: [], edges: [], focusNodeId: null })
        return
      }

      setViewMode('file')
      const resolvedFileId = generateGraphForFile(fileId) || fileId
      setSelectedFileId(resolvedFileId)

      const nodeData =
        analysisData.nodes?.find((n: any) =>
          matchesFile(n.id, resolvedFileId)
        ) || analysisData.nodes?.find((n: any) => matchesFile(n.id, fileId))

      setSelectedNode(nodeData || null)
    },
    [analysisData, generateGraphForFile, matchesFile]
  )

  const navigateToFile = useCallback(
    (fileId: string) => {
      if (!analysisData) {
        return
      }

      const dependencyMap = analysisData.dependencyMap ?? {}
      const allFiles = Object.keys(dependencyMap)

      const matchedFile =
        allFiles.find((candidate) => matchesFile(candidate, fileId)) || fileId

      handleFileSelect(matchedFile)

      if (treeRef.current) {
        try {
          treeRef.current.select(matchedFile, { focus: true })
        } catch (error) {
          console.warn('Failed to focus file in tree:', error)
        }
      }
    },
    [analysisData, handleFileSelect, matchesFile]
  )

  const handleShowOverview = useCallback(() => {
    setViewMode('overview')
    setSelectedFileId(null)
    setSelectedNode(null)
    setGraphElements({ nodes: [], edges: [], focusNodeId: null })
  }, [setGraphElements, setSelectedFileId, setSelectedNode, setViewMode])

  // Regenerate dependency view when analysis data refreshes
  useEffect(() => {
    if (selectedFileId) {
      generateGraphForFile(selectedFileId, analysisData)
    }
  }, [analysisData, generateGraphForFile, selectedFileId])

  const refreshAnalysis = useCallback(async () => {
    const result = await fetchAnalysis()

    setSelectedFileId(null)
    setSelectedNode(null)
    setHoveredFile(null)
    setGraphElements({ nodes: [], edges: [], focusNodeId: null })
    setViewMode('overview')
    setSimulationResult(null)

    if (result?.issues?.circularDependencies?.length) {
      console.info(
        '🔄 Circular Dependencies Found:',
        result.issues.circularDependencies
      )
      console.info('📋 Summary:', result.issues.summary)
    }

    return result
  }, [
    fetchAnalysis,
    setGraphElements,
    setHoveredFile,
    setSelectedFileId,
    setSelectedNode,
    setSimulationResult,
    setViewMode
  ])

  const handleSimulateDelete = async (fileId: string) => {
    console.info('🚀 Frontend: Starting simulation for file:', fileId)
    setIsSimulating(true)
    try {
      const result = await simulateRemoval({
        fileToRemove: fileId
      })
      console.info('✅ Frontend: Simulation result received:', result)
      setSimulationResult(result)
    } catch (error) {
      console.error('😭 Simulasi gagal:', error)
    } finally {
      setIsSimulating(false)
    }
  }

  const closeSimulation = () => setSimulationResult(null)

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const toggleTreeView = () => {
    setIsTreeCollapsed((prev) => !prev)
  }

  useEffect(() => {
    refreshAnalysis()
  }, [refreshAnalysis])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      {/* Simple Top Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Title */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTreeView}
              className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={
                isTreeCollapsed
                  ? 'Tampilkan tree view'
                  : 'Sembunyikan tree view'
              }
            >
              {isTreeCollapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </Button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Code Mapper
            </h1>
          </div>

          {/* Center: Status & Refresh */}
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : loadError ? 'bg-red-500' : 'bg-emerald-500'}`}
                aria-hidden="true"
              />
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                {isLoading && 'Loading analysis data...'}
                {!isLoading && loadError && (
                  <span className="text-red-500 dark:text-red-400 font-medium">
                    Failed to load data
                  </span>
                )}
                {!isLoading &&
                  !loadError &&
                  analysisData &&
                  'Analysis data ready'}
                {!isLoading &&
                  !loadError &&
                  !analysisData &&
                  'Analysis data not available'}
              </div>
            </div>
            <Button
              onClick={refreshAnalysis}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="px-4"
            >
              {isLoading ? 'Loading...' : 'Reload'}
            </Button>
          </div>

          {/* Right: Search, Layout Controls, and Theme */}
          <div className="flex items-center gap-3">
            {analysisData && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search files..."
                  className="pl-10 w-48 border-slate-300 dark:border-slate-600 focus:border-green-500 dark:focus:border-green-400"
                />
              </div>
            )}

            {/* Layout Direction Controls */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-md p-1">
              <Button
                variant={layoutDirection === 'LR' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayoutDirection('LR')}
                disabled={!analysisData}
                className={`px-3 py-1 text-xs ${layoutDirection === 'LR' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''} ${!analysisData ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Left-Right Layout"
              >
                <ArrowRight className="h-3 w-3 mr-1" />
                LR
              </Button>
              <Button
                variant={layoutDirection === 'TB' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayoutDirection('TB')}
                disabled={!analysisData}
                className={`px-3 py-1 text-xs ${layoutDirection === 'TB' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''} ${!analysisData ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Top-Bottom Layout"
              >
                <ArrowDown className="h-3 w-3 mr-1" />
                TB
              </Button>
            </div>
            {analysisData && (
              <Button
                variant={viewMode === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={handleShowOverview}
                className="px-3 py-1 text-xs"
              >
                Project Overview
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {analysisData && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-6">
              <span>
                <strong className="text-slate-900 dark:text-slate-100">
                  {Object.keys(analysisData.dependencyMap).length}
                </strong>{' '}
                files
              </span>
              {selectedNode && (
                <span className="text-green-600 dark:text-green-400">
                  <strong>Selected:</strong>{' '}
                  {getBasename(selectedNode.id || selectedFileId || '')}
                </span>
              )}
            </div>
            <div className="text-xs">
              {analysisLoadedAt && (
                <>
                  Diperbarui:{' '}
                  <strong>
                    {new Date(analysisLoadedAt).toLocaleTimeString()}
                  </strong>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Layout Utama - Tree, Dashboard, dan Panel Detail */}
      <div className="flex h-[calc(100vh-140px)] overflow-hidden w-full">
        <div
          className={`transition-all duration-200 ease-out overflow-hidden shrink-0 ${
            isTreeCollapsed
              ? 'w-0 min-w-0'
              : 'w-80 border-r border-slate-200 dark:border-slate-800'
          }`}
        >
          {!isTreeCollapsed && analysisData && (
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
                </div>
              }
            >
              <FileTreeView
                ref={treeRef}
                data={analysisData.fileTree}
                onFileSelect={handleFileSelect}
                filesInCycle={filesInCycle}
                highImpactFilesMap={highImpactFilesMap}
                orphanFilesSet={orphanFilesSet}
                searchTerm={query}
                hoveredFile={hoveredFile}
                setHoveredFile={setHoveredFile}
                onSimulateDelete={handleSimulateDelete}
                brokenFilesSet={brokenFilesSet}
                newOrphansSet={newOrphansSet}
                isSimulating={isSimulating}
                riskProfileMap={riskProfileMap}
              />
            </Suspense>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          {analysisData ? (
            <Suspense fallback={<GraphSkeleton />}>
              <ProjectDashboard
                analysisData={analysisData}
                dependencyGraph={graphElements}
                hoveredFile={hoveredFile}
                layoutDirection={layoutDirection}
                viewMode={viewMode}
                onNavigateToFile={navigateToFile}
              />
            </Suspense>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
                  <div className="w-12 h-12 bg-white rounded-full opacity-90"></div>
                </div>
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Menunggu data analisis
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Jalankan perintah{' '}
                  <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">
                    code-mapper analyze &lt;path-proyek&gt;
                  </code>{' '}
                  di terminal Anda untuk menghasilkan data baru, kemudian
                  biarkan server CLI tetap berjalan.
                </p>
                {loadError && (
                  <p className="mt-3 text-sm text-red-500 dark:text-red-400">
                    Gagal memuat data: {loadError}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {analysisData && viewMode === 'file' && selectedNode && (
          <div className="w-96 border-l border-slate-200 dark:border-slate-800 overflow-hidden">
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center bg-white dark:bg-slate-900">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
                </div>
              }
            >
              <NodeDetailPanel
                node={selectedNode}
                data={analysisData}
                onClose={() => handleFileSelect(null)}
                riskProfile={getRiskProfileForFile(selectedFileId)}
              />
            </Suspense>
          </div>
        )}
      </div>

      {/* Modal untuk menampilkan hasil simulasi */}
      <Dialog
        open={!!simulationResult}
        onOpenChange={(isOpen) => !isOpen && closeSimulation()}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Hasil Simulasi Penghapusan</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <FileWarning className="h-5 w-5 text-red-500" />
                File yang Akan Rusak (
                {simulationResult?.brokenFiles.length || 0})
              </h3>
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {simulationResult?.brokenFiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    Tidak ada file yang akan rusak
                  </p>
                ) : (
                  simulationResult?.brokenFiles.map((file) => (
                    <div
                      key={file}
                      className="text-sm p-2 bg-muted rounded font-mono"
                    >
                      {getBasename(file)}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <FileX className="h-5 w-5 text-yellow-500" />
                Orphan Baru ({simulationResult?.newOrphans.length || 0})
              </h3>
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {simulationResult?.newOrphans.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    Tidak ada file yang akan menjadi orphan
                  </p>
                ) : (
                  simulationResult?.newOrphans.map((file) => (
                    <div
                      key={file}
                      className="text-sm p-2 bg-muted rounded font-mono"
                    >
                      {getBasename(file)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function SimpleApp() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="code-mapper-theme">
      <AppContent />
    </ThemeProvider>
  )
}
