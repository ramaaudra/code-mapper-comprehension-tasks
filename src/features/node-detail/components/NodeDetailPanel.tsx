import { useQuery } from '@tanstack/react-query'
import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react'

import {
  ArchitectureStats,
  useFileReviewThresholdCalibration,
  useFileArchitectureMetrics
} from '@/features/architecture'
import { Button } from '@/shared/components/ui/button'
import { DecisionStorySection } from '@/shared/components/ui/decision-story-section'
import { DetailPanelDisclosure } from '@/shared/components/ui/detail-panel-disclosure'
import { DetailPanelHeader } from '@/shared/components/ui/detail-panel-header'
import { DetailPanelSectionHeading } from '@/shared/components/ui/detail-panel-section-heading'
import { DetailPanelState } from '@/shared/components/ui/detail-panel-state'
import { DetailPanelTabs } from '@/shared/components/ui/detail-panel-tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { HotspotStatusLabel } from '@/shared/components/ui/hotspot-status-label'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Copy,
  Cube,
  Focus,
  Map as MapIcon,
  Target
} from '@/shared/components/ui/icons'
import { InsightBulletList } from '@/shared/components/ui/insight-bullet-list'
import { MetricInsightCard } from '@/shared/components/ui/metric-insight-card'
import { MetricValueCard } from '@/shared/components/ui/metric-value-card'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
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
import { METRIC_LABELS, METRIC_TOOLTIPS } from '@/shared/lib/metric-copy'
import { getReviewSignalDefinition } from '@/shared/lib/metric-thresholds'
import {
  createDecisionAssessment,
  formatChangePressureHelper,
  formatExternalRelianceHelper,
  getBasename,
  getFileEvolutionMetrics,
  getFileIcon,
  isEvolutionaryMetricsAvailable,
  formatImpactScopeHelper,
  formatStructuralPositionHelper,
  getAssessmentMethodItems,
  getRelativePath,
  formatRelativeChurn,
  truncateMiddle
} from '@/shared/lib/utils'
import {
  ARCHITECTURE_THRESHOLDS,
  calculateBlastRadius,
  getBlastRadiusDescription,
  getBlastRadiusLabel,
  getBlastRadiusLevel,
  getRiskBgOpacityClass,
  getRiskBorderClass,
  getRiskTextClass
} from '@/shared/lib/utils/risk'

import { nodeDetailCopy } from '../content/nodeDetailCopy'
import {
  resolveBlastRadiusRole,
  resolveNodeDetailOverviewState,
  resolveNodeDetailSourceState,
  resolveSourceTabBadge,
  shouldShowTracePathAction
} from '../lib/panel-state'
import { SourceCodeViewer } from './SourceCodeViewer'

import type { DecisionStatusTone } from '@/shared/lib/utils'
import type {
  AnalysisData,
  AnalysisEdge,
  AnalysisNode,
  DependencyReference
} from '@/shared/types/analysis'

const DECISION_CARD_TONE_ICON = {
  danger: <AlertTriangle className='h-4 w-4 text-red-500' />,
  warning: <AlertTriangle className='h-4 w-4 text-orange-500' />,
  info: <Target className='h-4 w-4 text-sky-500' weight='fill' />,
  success: <CheckCircle className='h-4 w-4 text-green-500' />,
  default: <CheckCircle className='h-4 w-4 text-green-500' />
} satisfies Record<DecisionStatusTone, React.ReactNode>

const blastRadiusSignal = getReviewSignalDefinition('blastRadius')

interface NodeDetailPanelProps {
  node: AnalysisNode | string | null
  data: AnalysisData | null
  onClose: () => void
  onFocusSubgraph?: (nodeId: string, direction: 'inward' | 'outward') => void
}

const NodeDetailPanel = memo(
  function NodeDetailPanel({
    node,
    data,
    onClose,
    onFocusSubgraph
  }: NodeDetailPanelProps) {
    const [focusDirection, setFocusDirection] = useState<'inward' | 'outward'>(
      'outward'
    )
    const [isPathModalOpen, setIsPathModalOpen] = useState(false)
    const [tracedPath, setTracedPath] = useState<string[] | null>(null)
    const [isTracing, setIsTracing] = useState(false)
    const [traceTarget, setTraceTarget] = useState('')
    const [showCopyMenu, setShowCopyMenu] = useState(false)
    const [copiedType, setCopiedType] = useState<'full' | 'relative' | null>(
      null
    )
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

    // Check if this file is an orphan (not imported by any file and not an entry point)
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
        thresholdCalibration: fileThresholdCalibration
      })
    }, [
      archMetrics,
      changeHistoryAvailable,
      fileEvolution,
      fileThresholdCalibration,
      isOrphan
    ])

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

    const renderDependencyList = (
      items: DependencyReference[],
      type: 'imports' | 'importers'
    ) => {
      if (items.length === 0) {
        return (
          <div className='p-4'>
            <DetailPanelState
              title={nodeDetailCopy.dependencyList.emptyTitle(type)}
              description={nodeDetailCopy.dependencyList.emptyDescription(type)}
              compact={true}
            />
          </div>
        )
      }

      return (
        <ScrollArea className='h-[calc(100vh-200px)] w-full lg:h-[calc(100vh-220px)]'>
          <div className='space-y-1 p-4'>
            {items.map((item) => {
              const ItemFileIcon = getFileIcon(item.basename)
              return (
                <div
                  key={item.id}
                  className='group flex items-center justify-between rounded-md p-2 transition-colors hover:bg-muted/50'
                >
                  <div className='min-w-0 flex-1 pr-2'>
                    <div className='flex items-center gap-2'>
                      <ItemFileIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
                      <span className='truncate text-sm font-medium'>
                        {item.basename}
                      </span>
                      {item.strength > 1 && (
                        <span className='rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground'>
                          x{item.strength}
                        </span>
                      )}
                    </div>
                    <div
                      className='truncate pl-6 text-xs text-muted-foreground'
                      title={item.label}
                    >
                      {truncateMiddle(item.label, 52)}
                    </div>
                  </div>
                  <div className='flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                    {shouldShowTracePathAction(isReportMode) ? (
                      <button
                        onClick={() => handleTracePath(item.id)}
                        disabled={isTracing}
                        className='rounded-md border border-transparent p-1.5 text-muted-foreground hover:border-border hover:bg-background hover:text-foreground'
                        title={nodeDetailCopy.dependencyList.tracePath}
                        aria-label={`Trace path to ${item.basename}`}
                      >
                        <MapIcon className='h-3.5 w-3.5' />
                      </button>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      )
    }

    const detectLanguage = (filename: string): string => {
      if (filename.endsWith('.tsx')) {
        return 'tsx'
      }
      if (filename.endsWith('.ts')) {
        return 'typescript'
      }
      if (filename.endsWith('.jsx')) {
        return 'jsx'
      }
      if (filename.endsWith('.js')) {
        return 'javascript'
      }
      if (filename.endsWith('.json')) {
        return 'json'
      }
      if (filename.endsWith('.css')) {
        return 'css'
      }
      return 'text'
    }

    const renderSourceContent = () => {
      const sourceState = resolveNodeDetailSourceState({
        isReportMode,
        isLoadingContent,
        hasContentError: !!contentError,
        hasFileContent: !!fileContent
      })

      if (sourceState === 'report') {
        return (
          <DetailPanelState
            title={nodeDetailCopy.source.reportModeTitle}
            description={nodeDetailCopy.source.reportModeDescription}
          />
        )
      }

      if (sourceState === 'loading') {
        return (
          <DetailPanelState
            title={nodeDetailCopy.source.loadingTitle}
            description={nodeDetailCopy.source.loadingDescription}
          />
        )
      }

      if (sourceState === 'error') {
        return (
          <DetailPanelState
            title={nodeDetailCopy.source.errorTitle}
            description={
              (contentError as Error)?.message || 'An unknown error occurred.'
            }
            tone='danger'
          />
        )
      }

      if (sourceState === 'empty') {
        return (
          <DetailPanelState
            title={nodeDetailCopy.source.noContentTitle}
            description={nodeDetailCopy.source.noContentDescription}
          />
        )
      }

      if (!fileContent) {
        return (
          <DetailPanelState
            title={nodeDetailCopy.source.noContentTitle}
            description={nodeDetailCopy.source.noContentDescription}
          />
        )
      }

      const MAX_LINES = 1000
      const readyFileContent = fileContent
      const hasMoreLines = readyFileContent.lines > MAX_LINES

      return (
        <div className='flex h-full flex-col'>
          {/* File info header */}
          <div className='flex items-center justify-between border-b bg-muted/50 px-4 py-2 text-xs text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <span
                className='max-w-[200px] truncate font-mono'
                title={readyFileContent.path}
              >
                {getRelativePath(readyFileContent.path)}
              </span>
            </div>
            <div className='flex items-center gap-3'>
              <span>{formatFileSize(readyFileContent.size)}</span>
              <span>{readyFileContent.lines.toLocaleString()} lines</span>
            </div>
          </div>

          {/* Warning for large files */}
          {hasMoreLines && (
            <div className='flex items-center gap-2 border-b border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-xs text-yellow-600'>
              <AlertTriangle className='h-3.5 w-3.5' />
              <span>
                Large file detected. Showing first {MAX_LINES} of{' '}
                {readyFileContent.lines.toLocaleString()} lines.
              </span>
            </div>
          )}

          {/* Code content with syntax highlighting */}
          <div className='min-h-0 flex-1'>
            <SourceCodeViewer
              code={readyFileContent.content}
              language={detectLanguage(nodeData.basename ?? nodeData.id)}
              theme='auto'
              showLineNumbers={true}
              maxLines={MAX_LINES}
              className='h-full rounded-none border-0'
            />
          </div>
        </div>
      )
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
            <span className='whitespace-nowrap rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground'>
              {formatFileSize(displaySize)}
            </span>
          }
          trailing={
            <TooltipProvider>
              <Tooltip open={showCopyMenu || copiedType !== null}>
                <TooltipTrigger asChild>
                  <button
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
                    <div className='px-2 py-1 text-xs text-green-600'>
                      Copied!
                    </div>
                  ) : (
                    <div className='flex flex-col gap-1'>
                      <button
                        onClick={() => copyPath('full')}
                        className='rounded px-2 py-1 text-left text-xs hover:bg-accent'
                        aria-label='Copy full path'
                      >
                        Copy full path
                      </button>
                      <button
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
            {overviewState.showDiagnosis && decisionAssessment ? (
              <DecisionStorySection
                assessment={decisionAssessment}
                icon={DECISION_CARD_TONE_ICON[decisionAssessment.tone]}
                changeActivityValue={
                  changeHistoryAvailable ? undefined : 'Unavailable'
                }
                changeActivityTone={
                  changeHistoryAvailable ? undefined : 'default'
                }
                evidenceHelpers={{
                  impactScope: archMetrics ? (
                    <span className='text-[11px] text-muted-foreground'>
                      {formatImpactScopeHelper(archMetrics.ca)}
                    </span>
                  ) : null,
                  changeActivity:
                    changeHistoryAvailable && fileEvolution ? (
                      <span className='text-[11px] text-muted-foreground'>
                        {formatChangePressureHelper(
                          fileEvolution.churn30d.relativeChurn
                        )}
                      </span>
                    ) : !changeHistoryAvailable ? (
                      <span className='text-[11px] text-muted-foreground'>
                        Git history is unavailable for recent change signals.
                      </span>
                    ) : null,
                  dependencies: archMetrics ? (
                    <span className='text-[11px] text-muted-foreground'>
                      {formatExternalRelianceHelper(archMetrics.ce)}
                    </span>
                  ) : null,
                  architectureRole: archMetrics ? (
                    <span className='text-[11px] text-muted-foreground'>
                      {formatStructuralPositionHelper(archMetrics.instability)}
                    </span>
                  ) : null
                }}
              />
            ) : null}

            {overviewState.showDiagnosisUnavailableState ? (
              <DetailPanelState
                title={nodeDetailCopy.diagnosisUnavailable.title}
                description={nodeDetailCopy.diagnosisUnavailable.description}
              />
            ) : null}

            {overviewState.showBlastRadius &&
            blastRadiusAssessment &&
            blastRadiusRole === 'supporting' ? (
              <div className='space-y-3'>
                <DetailPanelSectionHeading
                  title={nodeDetailCopy.blastRadius.sectionTitle}
                />
                {blastRadiusAssessment.isInCycle ? (
                  <MetricInsightCard
                    icon={<AlertTriangle className='h-4 w-4 text-red-500' />}
                    title={nodeDetailCopy.blastRadius.criticalTitle}
                    description={nodeDetailCopy.blastRadius.criticalDescription}
                    tone='danger'
                    className='border-red-500/50 bg-red-500/5'
                  />
                ) : (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className='cursor-help'>
                          <MetricInsightCard
                            icon={
                              blastRadiusAssessment.level === 'low' ? (
                                <CheckCircle className='h-4 w-4 text-green-500' />
                              ) : (
                                <AlertTriangle
                                  className={`h-4 w-4 ${getRiskTextClass(blastRadiusAssessment.level)}`}
                                />
                              )
                            }
                            title={getBlastRadiusLabel(
                              blastRadiusAssessment.level
                            )}
                            value={`Score: ${blastRadiusAssessment.riskScore.toFixed(1)}`}
                            description={getBlastRadiusDescription(
                              blastRadiusAssessment.level
                            )}
                            tone={
                              blastRadiusAssessment.level === 'low'
                                ? 'success'
                                : blastRadiusAssessment.level === 'medium'
                                  ? 'warning'
                                  : 'danger'
                            }
                            className={`${getRiskBorderClass(blastRadiusAssessment.level)} ${getRiskBgOpacityClass(blastRadiusAssessment.level, 5)}`}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side='top'
                        className='max-w-xs border-border bg-popover'
                      >
                        <div className='space-y-2'>
                          <p className='font-semibold text-popover-foreground'>
                            {nodeDetailCopy.blastRadius.tooltipTitle}:{' '}
                            {blastRadiusAssessment.riskScore.toFixed(1)}
                          </p>
                          <p className='text-xs text-popover-foreground/80'>
                            {nodeDetailCopy.blastRadius.tooltipDescription}
                          </p>
                          {archMetrics && (
                            <div className='space-y-1 border-t border-border pt-1 text-xs'>
                              <p className='text-popover-foreground/80'>
                                • <strong>Dependents (Ca):</strong>{' '}
                                {archMetrics.ca}
                              </p>
                              <p className='text-popover-foreground/80'>
                                • <strong>Dependencies (Ce):</strong>{' '}
                                {archMetrics.ce}
                              </p>
                              <p className='pt-1 text-popover-foreground/80'>
                                Calculation: {archMetrics.ca} + (
                                {archMetrics.ce} × 0.5) ={' '}
                                {blastRadiusAssessment.riskScore.toFixed(1)}
                              </p>
                            </div>
                          )}
                          <div className='border-t border-border pt-1 text-xs'>
                            <p className='text-popover-foreground/80'>
                              {blastRadiusSignal.scientificStatusNote}
                            </p>
                          </div>
                          <div className='border-t border-border pt-1 text-xs'>
                            <p className='text-popover-foreground/80'>
                              {nodeDetailCopy.blastRadius.tooltipInterpretation}
                            </p>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {archMetrics &&
                  archMetrics.ce > ARCHITECTURE_THRESHOLDS.GOD_OBJECT_CE && (
                    <MetricInsightCard
                      icon={
                        <Cube
                          className='h-4 w-4 text-yellow-500'
                          weight='fill'
                        />
                      }
                      title={nodeDetailCopy.blastRadius.godObjectTitle}
                      description={nodeDetailCopy.blastRadius.godObjectDescription(
                        archMetrics.ce
                      )}
                      tone='warning'
                      className='mt-3 border-yellow-500/50 bg-yellow-500/10'
                    />
                  )}

                {archMetrics &&
                  archMetrics.ca > ARCHITECTURE_THRESHOLDS.BOTTLENECK_CA && (
                    <MetricInsightCard
                      icon={
                        <Target
                          className='h-4 w-4 text-orange-500'
                          weight='fill'
                        />
                      }
                      title={nodeDetailCopy.blastRadius.bottleneckTitle}
                      description={nodeDetailCopy.blastRadius.bottleneckDescription(
                        archMetrics.ca
                      )}
                      tone='warning'
                      className='mt-3 border-orange-500/50 bg-orange-500/10'
                    />
                  )}
              </div>
            ) : null}

            {overviewState.showWhyDisclosure ? (
              <DetailPanelDisclosure
                title={nodeDetailCopy.disclosure.whyTitle}
                summary={nodeDetailCopy.disclosure.whySummary}
              >
                <div className='space-y-3'>
                  <DetailPanelSectionHeading
                    title={nodeDetailCopy.disclosure.howAssessedTitle}
                  />
                  <InsightBulletList items={getAssessmentMethodItems()} />
                </div>

                {overviewState.showArchitectureMetrics && archMetrics ? (
                  <div className='space-y-3'>
                    <DetailPanelSectionHeading
                      title={nodeDetailCopy.disclosure.architectureMetricsTitle}
                    />
                    <ArchitectureStats
                      ca={archMetrics.ca}
                      ce={archMetrics.ce}
                      instability={archMetrics.instability}
                      hasCycle={archMetrics.hasCycle}
                    />
                  </div>
                ) : null}

                {overviewState.showEvolutionMetrics &&
                !changeHistoryAvailable ? (
                  <DetailPanelState
                    title='Evolutionary metrics unavailable'
                    description='Git history is unavailable for change activity and hotspot metrics in this file.'
                  />
                ) : null}

                {overviewState.showEvolutionMetrics &&
                fileEvolution &&
                changeHistoryAvailable ? (
                  <div className='space-y-3'>
                    <DetailPanelSectionHeading
                      title={nodeDetailCopy.disclosure.evolutionaryMetricsTitle}
                    />
                    <div className='grid grid-cols-2 gap-3'>
                      <MetricValueCard
                        value={formatRelativeChurn(
                          fileEvolution.churn30d.relativeChurn
                        )}
                        label={METRIC_LABELS.relativeChurn30d}
                        tooltip={METRIC_TOOLTIPS.relativeChurn30d}
                      />
                      <MetricValueCard
                        value={formatRelativeChurn(
                          fileEvolution.churn90d.relativeChurn
                        )}
                        label={METRIC_LABELS.relativeChurn90d}
                        tooltip={METRIC_TOOLTIPS.relativeChurn90d}
                      />
                      <MetricValueCard
                        value={fileEvolution.churn30d.commitCount}
                        label={METRIC_LABELS.commits30d}
                        tooltip={METRIC_TOOLTIPS.commits30d}
                      />
                      <MetricValueCard
                        value={fileEvolution.hotspotScore.toFixed(2)}
                        label={METRIC_LABELS.evolutionaryHotspotScore}
                        tooltip={METRIC_TOOLTIPS.evolutionaryHotspotScore}
                        helper={
                          <HotspotStatusLabel
                            status={fileEvolution.hotspotStatus}
                            className='text-[11px] text-muted-foreground'
                          />
                        }
                      />
                    </div>
                  </div>
                ) : null}
              </DetailPanelDisclosure>
            ) : null}

            {/* Actions */}
            {onFocusSubgraph ? (
              <DetailPanelDisclosure
                title={nodeDetailCopy.graphTools.title}
                summary={nodeDetailCopy.graphTools.summary}
              >
                <div className='space-y-3'>
                  <div className='grid grid-cols-2 gap-2'>
                    <Button
                      variant={
                        focusDirection === 'inward' ? 'secondary' : 'outline'
                      }
                      size='sm'
                      onClick={() => setFocusDirection('inward')}
                      className='w-full justify-start'
                    >
                      <ArrowLeft className='mr-2 h-3 w-3' />{' '}
                      {nodeDetailCopy.graphTools.inward}
                    </Button>
                    <Button
                      variant={
                        focusDirection === 'outward' ? 'secondary' : 'outline'
                      }
                      size='sm'
                      onClick={() => setFocusDirection('outward')}
                      className='w-full justify-start'
                    >
                      {nodeDetailCopy.graphTools.outward}{' '}
                      <ArrowRight className='ml-2 h-3 w-3' />
                    </Button>
                  </div>
                  <Button
                    variant='default'
                    size='sm'
                    onClick={() =>
                      onFocusSubgraph(resolvedNodeId, focusDirection)
                    }
                    className='w-full'
                  >
                    <Focus className='mr-2 h-3 w-3' />
                    {nodeDetailCopy.graphTools.focusPrefix}{' '}
                    {focusDirection === 'inward'
                      ? nodeDetailCopy.graphTools.focusDependencies
                      : nodeDetailCopy.graphTools.focusDependents}{' '}
                    {nodeDetailCopy.graphTools.focusSuffix}
                  </Button>
                </div>
              </DetailPanelDisclosure>
            ) : null}
          </TabsContent>

          <TabsContent value='dependencies' className='m-0 flex-1'>
            {renderDependencyList(imports, 'imports')}
          </TabsContent>

          <TabsContent value='dependents' className='m-0 flex-1'>
            {renderDependencyList(importers, 'importers')}
          </TabsContent>

          <TabsContent value='source' className='m-0 flex-1 overflow-hidden'>
            {renderSourceContent()}
          </TabsContent>
        </Tabs>

        {/* Path Trace Modal */}
        <Dialog open={isPathModalOpen} onOpenChange={setIsPathModalOpen}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <MapIcon className='h-5 w-5 text-muted-foreground' />
                Dependency Path to "{traceTarget}"
              </DialogTitle>
            </DialogHeader>
            <div className='mt-4'>
              {isTracing ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='text-sm text-muted-foreground'>
                    Tracing path...
                  </div>
                </div>
              ) : tracedPath && tracedPath.length > 0 ? (
                <div className='space-y-4'>
                  <div className='mb-3 text-sm text-muted-foreground'>
                    Shortest path found ({tracedPath.length} steps):
                  </div>
                  <div className='flex flex-col gap-2'>
                    {tracedPath.map((file, index) => (
                      <div key={file} className='flex items-center gap-3'>
                        <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground'>
                          {index + 1}
                        </div>
                        <div className='min-w-0 flex-1'>
                          <div className='truncate rounded-md bg-muted/50 p-2 font-mono text-sm'>
                            {getBasename(file)}
                          </div>
                        </div>
                        {index < tracedPath.length - 1 && (
                          <div className='shrink-0 text-muted-foreground'>
                            <ArrowRight className='h-3 w-3' />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <DetailPanelState
                  title={nodeDetailCopy.pathTrace.noPathTitle}
                  description={nodeDetailCopy.pathTrace.noPathDescription}
                  compact={true}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison for stability
    const nodeIdEqual =
      (typeof prevProps.node === 'string'
        ? prevProps.node
        : prevProps.node?.id) ===
      (typeof nextProps.node === 'string' ? nextProps.node : nextProps.node?.id)

    // Only re-render if node actually changed
    return nodeIdEqual
  }
)

export default NodeDetailPanel
