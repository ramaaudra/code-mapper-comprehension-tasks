import { useQuery } from '@tanstack/react-query'
import { memo, useEffect, useMemo, useRef, useState } from 'react'

import {
  ArchitectureStats,
  useFileArchitectureMetrics
} from '@/features/architecture'
import { Button } from '@/shared/components/ui/button'
import { DetailPanelDisclosure } from '@/shared/components/ui/detail-panel-disclosure'
import { DetailPanelHeader } from '@/shared/components/ui/detail-panel-header'
import { DetailPanelSectionHeading } from '@/shared/components/ui/detail-panel-section-heading'
import { DetailPanelState } from '@/shared/components/ui/detail-panel-state'
import { DetailPanelTabs } from '@/shared/components/ui/detail-panel-tabs'
import { DiagnosisCard } from '@/shared/components/ui/diagnosis-card'
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
  Ghost,
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
import { architectureApi } from '@/shared/lib/api/architecture'
import { findDependencyPath } from '@/shared/lib/api/pathfinding'
import { METRIC_LABELS, METRIC_TOOLTIPS } from '@/shared/lib/metric-copy'
import {
  createDecisionAssessment,
  getBasename,
  getChangePressureTone,
  getExternalRelianceTone,
  getFileEvolutionMetrics,
  getFileIcon,
  getImpactScopeTone,
  getRelativePath,
  getStructuralPositionTone,
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

import { SourceCodeViewer } from './SourceCodeViewer'

import type { ReportData } from '@/features/report/types'
import type {
  DecisionStatusTone,
  ImpactScopeThresholds
} from '@/shared/lib/utils'
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

const FILE_IMPACT_SCOPE_THRESHOLDS: ImpactScopeThresholds = {
  broad: 15,
  moderate: 5
}

interface NodeDetailPanelProps {
  node: AnalysisNode | string | null
  data: AnalysisData | null
  onClose: () => void
  onFocusSubgraph?: (nodeId: string, direction: 'inward' | 'outward') => void
}

interface CodeMapperWindow extends Window {
  __CODE_MAPPER_DATA__?: ReportData
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

    // Cleanup timeout on unmount to prevent memory leaks
    useEffect(() => {
      return () => {
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current)
        }
      }
    }, [])

    // Check if in report mode (static HTML) - disable API calls to prevent CORS errors
    const isReportMode =
      typeof window !== 'undefined' &&
      !!(window as CodeMapperWindow).__CODE_MAPPER_DATA__

    // Handle both old node object format and new node ID format
    const nodeId = typeof node === 'string' ? node : node?.id
    const nodeData = data?.nodes?.find((n) => n.id === nodeId)
    const resolvedNodeId = nodeId ?? ''
    const fileEvolution = getFileEvolutionMetrics(
      nodeId ?? null,
      data?.evolutionaryMetrics.files ?? {}
    )

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
      const level = getBlastRadiusLevel(blastRadiusScore, archMetrics.hasCycle)

      return {
        riskScore: blastRadiusScore,
        level: level,
        isInCycle: archMetrics.hasCycle
      }
    }, [archMetrics])

    // Check if this file is an orphan (not imported by any file and not an entry point)
    const isOrphan = useMemo(() => {
      if (!data?.issues?.orphans || !nodeId) {
        return false
      }
      return data.issues.orphans.includes(nodeId)
    }, [data?.issues?.orphans, nodeId])

    const decisionAssessment = useMemo(() => {
      if (!archMetrics || !fileEvolution) {
        return null
      }

      return createDecisionAssessment({
        kind: 'file',
        isOrphan,
        hasCycle: archMetrics.hasCycle,
        ca: archMetrics.ca,
        ce: archMetrics.ce,
        instability: archMetrics.instability,
        relativeChurn30d: fileEvolution.churn30d.relativeChurn,
        impactScopeThresholds: FILE_IMPACT_SCOPE_THRESHOLDS
      })
    }, [archMetrics, fileEvolution, isOrphan])

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
              title={`No ${type} found`}
              description={`This file currently has no ${type} in the analysis result.`}
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
                    <button
                      onClick={() => handleTracePath(item.id)}
                      disabled={isTracing}
                      className='rounded-md border border-transparent p-1.5 text-muted-foreground hover:border-border hover:bg-background hover:text-foreground'
                      title='Trace path'
                      aria-label={`Trace path to ${item.basename}`}
                    >
                      <MapIcon className='h-3.5 w-3.5' />
                    </button>
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
      if (isLoadingContent) {
        return (
          <DetailPanelState
            title='Loading source code'
            description='Fetching file content and preparing the source viewer.'
          />
        )
      }

      if (contentError) {
        return (
          <DetailPanelState
            title='Failed to load source code'
            description={
              (contentError as Error)?.message || 'An unknown error occurred.'
            }
            tone='danger'
          />
        )
      }

      if (!fileContent) {
        return (
          <DetailPanelState
            title='No source content available'
            description='The analysis result does not include readable source content for this file.'
          />
        )
      }

      const MAX_LINES = 1000
      const hasMoreLines = fileContent.lines > MAX_LINES

      return (
        <div className='flex h-full flex-col'>
          {/* File info header */}
          <div className='flex items-center justify-between border-b bg-muted/50 px-4 py-2 text-xs text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <span
                className='max-w-[200px] truncate font-mono'
                title={fileContent.path}
              >
                {getRelativePath(fileContent.path)}
              </span>
            </div>
            <div className='flex items-center gap-3'>
              <span>{formatFileSize(fileContent.size)}</span>
              <span>{fileContent.lines.toLocaleString()} lines</span>
            </div>
          </div>

          {/* Warning for large files */}
          {hasMoreLines && (
            <div className='flex items-center gap-2 border-b border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-xs text-yellow-600'>
              <AlertTriangle className='h-3.5 w-3.5' />
              <span>
                Large file detected. Showing first {MAX_LINES} of{' '}
                {fileContent.lines.toLocaleString()} lines.
              </span>
            </div>
          )}

          {/* Code content with syntax highlighting */}
          <div className='min-h-0 flex-1'>
            <SourceCodeViewer
              code={fileContent.content}
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
              { value: 'overview', label: 'Overview' },
              {
                value: 'dependencies',
                label: 'Imports',
                badge: outgoingEdges.length
              },
              {
                value: 'dependents',
                label: 'Used By',
                badge: incomingEdges.length
              },
              {
                value: 'source',
                label: 'Source',
                badge:
                  fileContent?.lines?.toLocaleString() ??
                  (nodeData?.size
                    ? Math.ceil(nodeData.size / 40).toLocaleString()
                    : '0')
              }
            ]}
          />

          <TabsContent
            value='overview'
            className='m-0 flex-1 space-y-6 overflow-y-auto p-4'
          >
            {/* Risk Assessment: The Verdict */}
            {decisionAssessment ? (
              <div className='space-y-3'>
                <DiagnosisCard
                  icon={DECISION_CARD_TONE_ICON[decisionAssessment.tone]}
                  headline={decisionAssessment.headline}
                  taxonomyLabel={decisionAssessment.title}
                  reviewPriority={decisionAssessment.reviewPriority}
                  summary={decisionAssessment.summary}
                  basisSummary={decisionAssessment.basisSummary}
                  actionLead={
                    decisionAssessment.actions[0] ??
                    'Review this area carefully.'
                  }
                  actionList={
                    decisionAssessment.actions.length > 1 ? (
                      <InsightBulletList
                        items={decisionAssessment.actions.slice(1)}
                      />
                    ) : undefined
                  }
                  driversLead={decisionAssessment.topDrivers[0] ?? ''}
                  driversList={
                    decisionAssessment.topDrivers.length > 1 ? (
                      <InsightBulletList
                        items={decisionAssessment.topDrivers.slice(1)}
                      />
                    ) : undefined
                  }
                  tone={decisionAssessment.tone}
                />

                <div className='grid grid-cols-2 gap-3'>
                  <MetricValueCard
                    value={decisionAssessment.impactScope}
                    label='Impact Scope'
                    tone={getImpactScopeTone(decisionAssessment.impactScope)}
                    helper={
                      archMetrics ? (
                        <span className='text-[11px] text-muted-foreground'>
                          Dependents (Ca): {archMetrics.ca}
                        </span>
                      ) : null
                    }
                  />
                  <MetricValueCard
                    value={decisionAssessment.changePressure}
                    label='Change Pressure'
                    tone={getChangePressureTone(
                      decisionAssessment.changePressure
                    )}
                    helper={
                      fileEvolution ? (
                        <span className='text-[11px] text-muted-foreground'>
                          Relative Churn (30d):{' '}
                          {formatRelativeChurn(
                            fileEvolution.churn30d.relativeChurn
                          )}
                        </span>
                      ) : null
                    }
                  />
                  <MetricValueCard
                    value={decisionAssessment.externalReliance}
                    label='External Reliance'
                    tone={getExternalRelianceTone(
                      decisionAssessment.externalReliance
                    )}
                    helper={
                      archMetrics ? (
                        <span className='text-[11px] text-muted-foreground'>
                          Dependencies (Ce): {archMetrics.ce}
                        </span>
                      ) : null
                    }
                  />
                  <MetricValueCard
                    value={decisionAssessment.structuralPosition}
                    label='Structural Position'
                    tone={getStructuralPositionTone(
                      decisionAssessment.structuralPosition
                    )}
                    helper={
                      archMetrics ? (
                        <span className='text-[11px] text-muted-foreground'>
                          Instability (I): {archMetrics.instability.toFixed(2)}
                        </span>
                      ) : null
                    }
                  />
                </div>
              </div>
            ) : isOrphan ? (
              // Orphan File Status (replaces normal risk assessment)
              <div className='space-y-3'>
                <DetailPanelSectionHeading title='File Status' />
                <MetricInsightCard
                  icon={
                    <Ghost
                      className='h-4 w-4 text-muted-foreground'
                      weight='fill'
                    />
                  }
                  title='Orphaned File (Unused)'
                  description='This file has 0 dependents and is not an entry point in the current analysis. It is likely unused and worth reviewing for cleanup.'
                  footer='Tip: Verify whether this is a test file, a script, or a dynamic import before deleting it. False positives may occur.'
                  tone='default'
                  className='border-muted bg-muted/10'
                />
              </div>
            ) : (
              blastRadiusAssessment && (
                <div className='space-y-3'>
                  <DetailPanelSectionHeading title='Blast Radius' />
                  {blastRadiusAssessment.isInCycle ? (
                    // Cycle Override: Critical Warning
                    <MetricInsightCard
                      icon={<AlertTriangle className='h-4 w-4 text-red-500' />}
                      title='Critical Circular Dependency'
                      description='This file is part of a circular dependency chain. Changes can increase initialization, runtime, and maintenance risks.'
                      tone='danger'
                      className='border-red-500/50 bg-red-500/5'
                    />
                  ) : (
                    // Normal Risk Assessment
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
                              Blast Radius:{' '}
                              {blastRadiusAssessment.riskScore.toFixed(1)}
                            </p>
                            <p className='text-xs text-popover-foreground/80'>
                              Blast Radius estimates how many nearby files may
                              require verification after this file changes.
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
                                These blast-radius bands are product heuristics
                                for estimating local verification scope.
                              </p>
                            </div>
                            <div className='border-t border-border pt-1 text-xs'>
                              <p className='text-popover-foreground/80'>
                                A higher score suggests a broader local impact
                                and a larger verification surface after a
                                change.
                              </p>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {/* God Object Warning: Ce > threshold */}
                  {archMetrics &&
                    archMetrics.ce > ARCHITECTURE_THRESHOLDS.GOD_OBJECT_CE && (
                      <MetricInsightCard
                        icon={
                          <Cube
                            className='h-4 w-4 text-yellow-500'
                            weight='fill'
                          />
                        }
                        title='God Object Detected'
                        description={`This file depends on ${archMetrics.ce} other files. Consider splitting responsibilities into smaller units.`}
                        tone='warning'
                        className='mt-3 border-yellow-500/50 bg-yellow-500/10'
                      />
                    )}

                  {/* Bottleneck Warning: Ca > threshold */}
                  {archMetrics &&
                    archMetrics.ca > ARCHITECTURE_THRESHOLDS.BOTTLENECK_CA && (
                      <MetricInsightCard
                        icon={
                          <Target
                            className='h-4 w-4 text-orange-500'
                            weight='fill'
                          />
                        }
                        title='Core Bottleneck'
                        description={`${archMetrics.ca} files depend on this. Changes here are more likely to affect many other files.`}
                        tone='warning'
                        className='mt-3 border-orange-500/50 bg-orange-500/10'
                      />
                    )}
                </div>
              )
            )}

            {decisionAssessment ? (
              (archMetrics || fileEvolution) && (
                <DetailPanelDisclosure
                  title='Why this recommendation'
                  summary='Inspect the structural and change-history evidence behind this verdict.'
                >
                  {archMetrics && (
                    <div className='space-y-3'>
                      <DetailPanelSectionHeading title='Architecture Metrics' />
                      <ArchitectureStats
                        ca={archMetrics.ca}
                        ce={archMetrics.ce}
                        instability={archMetrics.instability}
                        hasCycle={archMetrics.hasCycle}
                      />
                    </div>
                  )}

                  {fileEvolution && (
                    <div className='space-y-3'>
                      <DetailPanelSectionHeading title='Evolutionary Metrics' />
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
                  )}
                </DetailPanelDisclosure>
              )
            ) : (
              <>
                {archMetrics && (
                  <div className='space-y-3'>
                    <DetailPanelSectionHeading title='Architecture Metrics' />
                    <ArchitectureStats
                      ca={archMetrics.ca}
                      ce={archMetrics.ce}
                      instability={archMetrics.instability}
                      hasCycle={archMetrics.hasCycle}
                    />
                  </div>
                )}

                {fileEvolution && (
                  <div className='space-y-3'>
                    <DetailPanelSectionHeading title='Evolutionary Metrics' />
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
                )}
              </>
            )}

            {/* Actions */}
            {onFocusSubgraph &&
              (decisionAssessment ? (
                <DetailPanelDisclosure
                  title='Graph tools'
                  summary='Focus inward or outward relationships without leaving this panel.'
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
                        <ArrowLeft className='mr-2 h-3 w-3' /> Inward
                      </Button>
                      <Button
                        variant={
                          focusDirection === 'outward' ? 'secondary' : 'outline'
                        }
                        size='sm'
                        onClick={() => setFocusDirection('outward')}
                        className='w-full justify-start'
                      >
                        Outward <ArrowRight className='ml-2 h-3 w-3' />
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
                      Focus{' '}
                      {focusDirection === 'inward'
                        ? 'Dependencies'
                        : 'Dependents'}{' '}
                      Subgraph
                    </Button>
                  </div>
                </DetailPanelDisclosure>
              ) : (
                <div className='space-y-3'>
                  <DetailPanelSectionHeading title='Graph Actions' />
                  <div className='grid grid-cols-2 gap-2'>
                    <Button
                      variant={
                        focusDirection === 'inward' ? 'secondary' : 'outline'
                      }
                      size='sm'
                      onClick={() => setFocusDirection('inward')}
                      className='w-full justify-start'
                    >
                      <ArrowLeft className='mr-2 h-3 w-3' /> Inward
                    </Button>
                    <Button
                      variant={
                        focusDirection === 'outward' ? 'secondary' : 'outline'
                      }
                      size='sm'
                      onClick={() => setFocusDirection('outward')}
                      className='w-full justify-start'
                    >
                      Outward <ArrowRight className='ml-2 h-3 w-3' />
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
                    Focus{' '}
                    {focusDirection === 'inward'
                      ? 'Dependencies'
                      : 'Dependents'}{' '}
                    Subgraph
                  </Button>
                </div>
              ))}
          </TabsContent>

          <TabsContent value='dependencies' className='m-0 flex-1'>
            {renderDependencyList(imports, 'imports')}
          </TabsContent>

          <TabsContent value='dependents' className='m-0 flex-1'>
            {renderDependencyList(importers, 'importers')}
          </TabsContent>

          <TabsContent value='source' className='m-0 flex-1 overflow-hidden'>
            {isReportMode ? (
              <DetailPanelState
                title='Source viewer unavailable in static report mode'
                description='Open the live application to inspect source content interactively.'
              />
            ) : (
              renderSourceContent()
            )}
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
                      <div key={index} className='flex items-center gap-3'>
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
                  title='No dependency path found'
                  description='No direct dependency path could be traced between the selected files.'
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
