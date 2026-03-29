import { useQuery } from '@tanstack/react-query'
import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react'

import {
  useFileReviewThresholdCalibration,
  useFileArchitectureMetrics
} from '@/features/architecture'
import { DetailPanelHeader } from '@/shared/components/ui/detail-panel-header'
import { DetailPanelTabs } from '@/shared/components/ui/detail-panel-tabs'
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  Target
} from '@/shared/components/ui/icons'
import { Tabs, TabsContent } from '@/shared/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'
import { DataContext } from '@/shared/context/DataContext'
import { architectureApi } from '@/shared/lib/api/architecture'
import { findDependencyPath } from '@/shared/lib/api/pathfinding'
import {
  createDecisionAssessment,
  getBasename,
  getFileEvolutionMetrics,
  getFileIcon,
  isEvolutionaryMetricsAvailable,
  getRelativePath
} from '@/shared/lib/utils'
import {
  calculateBlastRadius,
  getBlastRadiusLevel
} from '@/shared/lib/utils/risk'

import { nodeDetailCopy } from '../content/nodeDetailCopy'
import { resolveNodeDetailCycleTriageSummary } from '../lib/cycle-triage-link'
import {
  resolveBlastRadiusRole,
  resolveNodeDetailOverviewState,
  resolveNodeDetailSourceState,
  resolveSourceTabBadge,
  shouldShowTracePathAction
} from '../lib/panel-state'
import { NodeDetailOverviewSection } from './NodeDetailOverviewSection'
import { NodeDetailPathTraceDialog } from './NodeDetailPathTraceDialog'
import { NodeDetailRelationsSection } from './NodeDetailRelationsSection'
import { NodeDetailSourceSection } from './NodeDetailSourceSection'

import type { DecisionStatusTone } from '@/shared/lib/utils'
import type {
  AnalysisData,
  AnalysisEdge,
  AnalysisNode,
  DependencyReference
} from '@/shared/types/analysis'
import type { CycleTriageNavigationRequest } from '@/shared/types/explorer'
import type { ReactNode } from 'react'

const DECISION_CARD_TONE_ICON = {
  danger: <AlertTriangle className='h-4 w-4 text-status-critical-foreground' />,
  warning: <AlertTriangle className='h-4 w-4 text-status-warning-foreground' />,
  info: <Target className='h-4 w-4 text-primary' weight='fill' />,
  success: <CheckCircle className='h-4 w-4 text-status-success-foreground' />,
  default: <CheckCircle className='h-4 w-4 text-status-success-foreground' />
} satisfies Record<DecisionStatusTone, ReactNode>

interface NodeDetailPanelProps {
  node: AnalysisNode | string | null
  data: AnalysisData | null
  onClose: () => void
  onFocusSubgraph?: (nodeId: string, direction: 'inward' | 'outward') => void
  onShowCycleTriage?: (request: CycleTriageNavigationRequest) => void
}

const NodeDetailPanel = memo(function NodeDetailPanel({
  node,
  data,
  onClose,
  onFocusSubgraph,
  onShowCycleTriage
}: NodeDetailPanelProps) {
  const [focusDirection, setFocusDirection] = useState<'inward' | 'outward'>(
    'outward'
  )
  const [isPathModalOpen, setIsPathModalOpen] = useState(false)
  const [tracedPath, setTracedPath] = useState<string[] | null>(null)
  const [isTracing, setIsTracing] = useState(false)
  const [traceTarget, setTraceTarget] = useState('')
  const [showCopyMenu, setShowCopyMenu] = useState(false)
  const [copiedType, setCopiedType] = useState<'full' | 'relative' | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dataContext = useContext(DataContext)

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  const isReportMode =
    !!dataContext?.analysisData && !!dataContext?.architectureData

  // Handle both old node object format and new node ID format
  const nodeId = typeof node === 'string' ? node : node?.id
  const nodeData = data?.nodes?.find((n) => n.id === nodeId)
  const resolvedNodeId = nodeId ?? ''
  const fileEvolution = getFileEvolutionMetrics(
    nodeId ?? null,
    data?.evolutionaryMetrics.files ?? {}
  )
  const changeHistoryAvailable = isEvolutionaryMetricsAvailable(
    data?.evolutionaryMetrics.summary
  )
  const fileThresholdCalibration = useFileReviewThresholdCalibration(data)

  // Architecture metrics
  const { data: archMetrics } = useFileArchitectureMetrics(nodeId ?? null)

  // File content query - only fetch when Source tab is active and not in report mode
  const fileContentQuery = useQuery({
    queryKey: ['fileContent', nodeId],
    queryFn: () => architectureApi.getFileContent(nodeId ?? ''),
    enabled: activeTab === 'source' && !!nodeId && !isReportMode,
    staleTime: 5 * 60 * 1000
  })

  const {
    data: fileContent,
    isLoading: isLoadingContent,
    error: contentError
  } = fileContentQuery

  // Calculate Blast Radius: Ca + (Ce × 0.5)
  const blastRadiusAssessment = useMemo(() => {
    if (!archMetrics) {
      return null
    }

    const blastRadiusScore = calculateBlastRadius(
      archMetrics.ca,
      archMetrics.ce
    )
    const level = getBlastRadiusLevel(
      blastRadiusScore,
      archMetrics.hasCycle,
      fileThresholdCalibration
    )

    return {
      riskScore: blastRadiusScore,
      level: level,
      isInCycle: archMetrics.hasCycle
    }
  }, [archMetrics, fileThresholdCalibration])

  // Entry-point reachability signal from backend orphan detection
  const isOrphan = useMemo(() => {
    if (!data?.issues?.orphans || !nodeId) {
      return false
    }
    return data.issues.orphans.includes(nodeId)
  }, [data?.issues?.orphans, nodeId])

  const decisionAssessment = useMemo(() => {
    if (!archMetrics) {
      return null
    }

    return createDecisionAssessment({
      kind: 'file',
      isOrphan,
      hasCycle: archMetrics.hasCycle,
      ca: archMetrics.ca,
      ce: archMetrics.ce,
      instability: archMetrics.instability,
      relativeChurn30d: fileEvolution?.churn30d.relativeChurn ?? 0,
      changeHistoryAvailable,
      thresholdCalibration: fileThresholdCalibration,
      entryDetectionContext: data?.entryDetectionContext
    })
  }, [
    archMetrics,
    changeHistoryAvailable,
    data?.entryDetectionContext,
    fileEvolution,
    fileThresholdCalibration,
    isOrphan
  ])
  const relatedCycleSummary = useMemo(
    () =>
      resolveNodeDetailCycleTriageSummary({
        filePath: nodeId ?? null,
        cycles: data?.issues?.circularDependencies ?? []
      }),
    [data?.issues?.circularDependencies, nodeId]
  )

  const overviewState = useMemo(
    () =>
      resolveNodeDetailOverviewState({
        hasDecisionAssessment: !!decisionAssessment,
        hasArchitectureMetrics: !!archMetrics,
        hasEvolutionMetrics: !!fileEvolution
      }),
    [archMetrics, decisionAssessment, fileEvolution]
  )

  const blastRadiusRole = useMemo(
    () =>
      resolveBlastRadiusRole({
        hasArchitectureMetrics: !!archMetrics
      }),
    [archMetrics]
  )
  const sourceTabBadge = useMemo(
    () =>
      resolveSourceTabBadge({
        isReportMode,
        fileContentLines: fileContent?.lines ?? null,
        fallbackEstimatedLines: nodeData?.size
          ? Math.ceil(nodeData.size / 40)
          : 0
      }),
    [fileContent?.lines, isReportMode, nodeData?.size]
  )
  const sourceState = useMemo(
    () =>
      resolveNodeDetailSourceState({
        isReportMode,
        isLoadingContent,
        hasContentError: !!contentError,
        hasFileContent: !!fileContent
      }),
    [contentError, fileContent, isLoadingContent, isReportMode]
  )
  const showTracePathAction = useMemo(
    () => shouldShowTracePathAction(isReportMode),
    [isReportMode]
  )

  // Calculate indegree and outdegree
  const incomingEdges = useMemo(() => {
    if (!data?.edges || !nodeId) {
      return []
    }
    return data.edges.filter((e) => e.target === nodeId)
  }, [data?.edges, nodeId])

  const outgoingEdges = useMemo(() => {
    if (!data?.edges || !nodeId) {
      return []
    }
    return data.edges.filter((e) => e.source === nodeId)
  }, [data?.edges, nodeId])

  // Create node map for O(1) lookup - fixes N+1 pattern
  const nodeMap = useMemo(() => {
    const map = new Map<string, AnalysisNode>()
    data?.nodes?.forEach((n) => map.set(n.id, n))
    return map
  }, [data?.nodes])

  // Get importers (files that import this file)
  const importers = useMemo<DependencyReference[]>(
    () =>
      incomingEdges.map((e: AnalysisEdge) => {
        const sourceNode = nodeMap.get(e.source)
        return {
          id: e.source,
          label: sourceNode?.label || e.source,
          basename: sourceNode?.basename || '',
          kind: e.kind,
          strength: e.strength || 1,
          line: e.line || 0
        }
      }),
    [incomingEdges, nodeMap]
  )

  // Get imports (files that this file imports)
  const imports = useMemo<DependencyReference[]>(
    () =>
      outgoingEdges.map((e: AnalysisEdge) => {
        const targetNode = nodeMap.get(e.target)
        return {
          id: e.target,
          label: targetNode?.label || e.target,
          basename: targetNode?.basename || '',
          kind: e.kind,
          strength: e.strength || 1,
          line: e.line || 0
        }
      }),
    [outgoingEdges, nodeMap]
  )

  if (!node || !data || !nodeData) {
    return null
  }

  const copyPath = (type: 'full' | 'relative') => {
    const pathToCopy =
      type === 'full' ? nodeData.id : getRelativePath(nodeData.id)
    navigator.clipboard.writeText(pathToCopy)
    setCopiedType(type)
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current)
    }
    copyTimeoutRef.current = setTimeout(() => {
      setCopiedType(null)
      setShowCopyMenu(false)
    }, 2000)
  }

  const handleTracePath = async (targetFile: string) => {
    setIsTracing(true)
    setTraceTarget(getBasename(targetFile))
    try {
      const pathResult = await findDependencyPath({
        startNode: resolvedNodeId,
        endNode: targetFile
      })
      setTracedPath(pathResult ?? [])
      setIsPathModalOpen(true)
    } catch (error) {
      console.error('Failed to trace path:', error)
    } finally {
      setIsTracing(false)
    }
  }

  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`
    }
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`
    }
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  const displayBasename = nodeData.basename ?? getBasename(nodeData.id)
  const displaySize = nodeData.size ?? 0
  const FileIcon = getFileIcon(displayBasename)

  return (
    <div className='flex h-full w-full flex-col bg-background'>
      {/* Header */}
      <DetailPanelHeader
        icon={<FileIcon className='h-5 w-5 text-muted-foreground' />}
        title={displayBasename}
        subtitle={getRelativePath(nodeData.id)}
        meta={
          <span className='whitespace-nowrap rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground'>
            {formatFileSize(displaySize)}
          </span>
        }
        trailing={
          <TooltipProvider>
            <Tooltip open={showCopyMenu || copiedType !== null}>
              <TooltipTrigger asChild>
                <button
                  type='button'
                  onClick={() => setShowCopyMenu(!showCopyMenu)}
                  className='p-0.5 text-muted-foreground transition-colors hover:text-foreground'
                >
                  <Copy className='h-3 w-3' />
                  <span className='sr-only'>Copy path</span>
                </button>
              </TooltipTrigger>
              <TooltipContent
                side='bottom'
                className='min-w-[120px] p-1'
                onPointerDownOutside={() => setShowCopyMenu(false)}
              >
                {copiedType ? (
                  <div className='px-2 py-1 text-xs text-status-success-foreground'>
                    Copied!
                  </div>
                ) : (
                  <div className='flex flex-col gap-1'>
                    <button
                      type='button'
                      onClick={() => copyPath('full')}
                      className='rounded px-2 py-1 text-left text-xs hover:bg-accent'
                      aria-label='Copy full path'
                    >
                      Copy full path
                    </button>
                    <button
                      type='button'
                      onClick={() => copyPath('relative')}
                      className='rounded px-2 py-1 text-left text-xs hover:bg-accent'
                      aria-label='Copy relative path'
                    >
                      Copy relative path
                    </button>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        }
        onClose={onClose}
      />

      {/* Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='flex flex-1 flex-col overflow-hidden'
      >
        <DetailPanelTabs
          items={[
            { value: 'overview', label: nodeDetailCopy.tabs.overview },
            {
              value: 'dependencies',
              label: nodeDetailCopy.tabs.imports,
              badge: outgoingEdges.length
            },
            {
              value: 'dependents',
              label: nodeDetailCopy.tabs.dependents,
              badge: incomingEdges.length
            },
            {
              value: 'source',
              label: nodeDetailCopy.tabs.source,
              badge: sourceTabBadge
            }
          ]}
        />

        <TabsContent
          value='overview'
          className='m-0 flex-1 space-y-6 overflow-y-auto p-4'
        >
          <NodeDetailOverviewSection
            overviewState={overviewState}
            decisionAssessment={decisionAssessment}
            isPossiblyUnreachable={isOrphan}
            changeHistoryAvailable={changeHistoryAvailable}
            fileEvolution={fileEvolution}
            archMetrics={archMetrics}
            blastRadiusAssessment={blastRadiusAssessment}
            blastRadiusRole={blastRadiusRole}
            onFocusSubgraph={onFocusSubgraph}
            focusDirection={focusDirection}
            onFocusDirectionChange={setFocusDirection}
            resolvedNodeId={resolvedNodeId}
            decisionIcon={
              decisionAssessment
                ? DECISION_CARD_TONE_ICON[decisionAssessment.tone]
                : null
            }
            entryDetectionContext={data?.entryDetectionContext}
            relatedCycleSummary={relatedCycleSummary}
            onShowCycleTriage={onShowCycleTriage}
          />
        </TabsContent>

        <TabsContent value='dependencies' className='m-0 flex-1'>
          <NodeDetailRelationsSection
            items={imports}
            type='imports'
            showTracePathAction={showTracePathAction}
            isTracing={isTracing}
            onTracePath={handleTracePath}
          />
        </TabsContent>

        <TabsContent value='dependents' className='m-0 flex-1'>
          <NodeDetailRelationsSection
            items={importers}
            type='importers'
            showTracePathAction={showTracePathAction}
            isTracing={isTracing}
            onTracePath={handleTracePath}
          />
        </TabsContent>

        <TabsContent value='source' className='m-0 flex-1 overflow-hidden'>
          <NodeDetailSourceSection
            sourceState={sourceState}
            contentError={contentError as Error | null}
            fileContent={fileContent}
            nodePath={nodeData.id}
            displayBasename={displayBasename}
          />
        </TabsContent>
      </Tabs>

      <NodeDetailPathTraceDialog
        open={isPathModalOpen}
        onOpenChange={setIsPathModalOpen}
        isTracing={isTracing}
        traceTarget={traceTarget}
        tracedPath={tracedPath}
      />
    </div>
  )
})

export default NodeDetailPanel
