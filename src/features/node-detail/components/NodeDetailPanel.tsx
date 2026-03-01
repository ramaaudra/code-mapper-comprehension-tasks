/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useMemo, useState } from 'react'

import {
  ArchitectureStats,
  useFileArchitectureMetrics
} from '@/features/architecture'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Copy,
  Cube,
  Focus,
  Ghost,
  Lightbulb,
  Map,
  Target,
  X
} from '@/shared/components/ui/icons'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/shared/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'
import { findDependencyPath } from '@/shared/lib/api/pathfinding'
import { getBasename, getFileIcon, getRelativePath } from '@/shared/lib/utils'
import {
  calculateCostOfChange,
  getCostOfChangeLevel,
  getRiskLabel,
  getRiskTextClass
} from '@/shared/lib/utils/risk'
import type { RiskLevel } from '@/shared/types/risk'

interface NodeDetailPanelProps {
  node: any
  data: any
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

    // Handle both old node object format and new node ID format
    const nodeId = typeof node === 'string' ? node : node.id
    const nodeData = data?.nodes?.find((n: any) => n.id === nodeId)

    // Architecture metrics
    const { data: archMetrics } = useFileArchitectureMetrics(nodeId)

    // Calculate Cost of Change (Blast Radius): Ca + (Ce × 0.5)
    const riskAssessment = useMemo(() => {
      if (!archMetrics) {
        return null
      }

      const cocScore = calculateCostOfChange(archMetrics.ca, archMetrics.ce)
      const level = getCostOfChangeLevel(cocScore, archMetrics.hasCycle)

      return {
        riskScore: cocScore,
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

    // Calculate indegree and outdegree
    const incomingEdges = useMemo(() => {
      if (!data?.edges || !nodeId) {
        return []
      }
      return data.edges.filter((e: any) => e.target === nodeId)
    }, [data?.edges, nodeId])

    const outgoingEdges = useMemo(() => {
      if (!data?.edges || !nodeId) {
        return []
      }
      return data.edges.filter((e: any) => e.source === nodeId)
    }, [data?.edges, nodeId])

    // Get importers (files that import this file)
    const importers = useMemo(
      () =>
        incomingEdges.map((e: any) => {
          const sourceNode = data?.nodes?.find((n: any) => n.id === e.source)
          return {
            id: e.source,
            label: sourceNode?.label || e.source,
            basename: sourceNode?.basename || '',
            kind: e.kind,
            strength: e.strength || 1,
            line: e.line || 0
          }
        }),
      [incomingEdges, data?.nodes]
    )

    // Get imports (files that this file imports)
    const imports = useMemo(
      () =>
        outgoingEdges.map((e: any) => {
          const targetNode = data?.nodes?.find((n: any) => n.id === e.target)
          return {
            id: e.target,
            label: targetNode?.label || e.target,
            basename: targetNode?.basename || '',
            kind: e.kind,
            strength: e.strength || 1,
            line: e.line || 0
          }
        }),
      [outgoingEdges, data?.nodes]
    )

    if (!node || !data || !nodeData) {
      return null
    }

    const copyPath = (type: 'full' | 'relative') => {
      const pathToCopy =
        type === 'full' ? nodeData.id : getRelativePath(nodeData.id)
      navigator.clipboard.writeText(pathToCopy)
      setCopiedType(type)
      setTimeout(() => {
        setCopiedType(null)
        setShowCopyMenu(false)
      }, 2000)
    }

    const handleTracePath = async (targetFile: string) => {
      setIsTracing(true)
      setTraceTarget(getBasename(targetFile))
      try {
        const pathResult = await findDependencyPath({
          startNode: nodeId,
          endNode: targetFile
        })
        setTracedPath(pathResult)
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
      items: any[],
      type: 'imports' | 'importers'
    ) => {
      if (items.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
            <p>No {type} found.</p>
          </div>
        )
      }

      return (
        <ScrollArea className="h-[calc(100vh-200px)] lg:h-[calc(100vh-220px)] w-full">
          <div className="p-4 space-y-1">
            {items.map((item: any) => {
              const ItemFileIcon = getFileIcon(item.basename)
              return (
                <div
                  key={item.id}
                  className="group flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <ItemFileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {item.basename}
                      </span>
                      {item.strength > 1 && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          x{item.strength}
                        </span>
                      )}
                    </div>
                    <div
                      className="text-xs text-muted-foreground truncate pl-6"
                      title={item.label}
                    >
                      {item.label}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleTracePath(item.id)}
                      disabled={isTracing}
                      className="p-1.5 rounded-md hover:bg-background border border-transparent hover:border-border text-muted-foreground hover:text-foreground"
                      title="Trace path"
                      aria-label={`Trace path to ${item.basename}`}
                    >
                      <Map className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      )
    }

    const FileIcon = getFileIcon(nodeData.basename)

    return (
      <div className="h-full w-full bg-background flex flex-col">
        {/* Header */}
        <div className="flex-none p-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 overflow-hidden">
              <div className="mt-1 p-1.5 bg-muted rounded-md shrink-0">
                <FileIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <h2
                  className="text-lg font-semibold truncate"
                  title={nodeData.basename}
                >
                  {nodeData.basename}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p
                    className="text-xs text-muted-foreground truncate max-w-[180px]"
                    title={nodeData.id}
                  >
                    {getRelativePath(nodeData.id)}
                  </p>
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded whitespace-nowrap">
                    {formatFileSize(nodeData.size)}
                  </span>
                  <TooltipProvider>
                    <Tooltip open={showCopyMenu || copiedType !== null}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setShowCopyMenu(!showCopyMenu)}
                          className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                        >
                          <Copy className="h-3 w-3" />
                          <span className="sr-only">Copy path</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="p-1 min-w-[120px]"
                        onPointerDownOutside={() => setShowCopyMenu(false)}
                      >
                        {copiedType ? (
                          <div className="px-2 py-1 text-xs text-green-600">
                            Copied!
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => copyPath('full')}
                              className="px-2 py-1 text-xs text-left hover:bg-accent rounded"
                              aria-label="Copy full path"
                            >
                              Copy full path
                            </button>
                            <button
                              onClick={() => copyPath('relative')}
                              className="px-2 py-1 text-xs text-left hover:bg-accent rounded"
                              aria-label="Copy relative path"
                            >
                              Copy relative path
                            </button>
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 -mr-2 -mt-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <Tabs
          defaultValue="overview"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-4 pt-2">
            <TabsList className="w-full justify-start h-9 bg-transparent p-0 border-b rounded-none">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2 pt-1.5"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="dependencies"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2 pt-1.5"
              >
                Imports{' '}
                <span className="ml-1.5 text-xs text-muted-foreground bg-muted px-1.5 rounded-full">
                  {outgoingEdges.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="dependents"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2 pt-1.5"
              >
                Used By{' '}
                <span className="ml-1.5 text-xs text-muted-foreground bg-muted px-1.5 rounded-full">
                  {incomingEdges.length}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="overview"
            className="flex-1 overflow-y-auto m-0 p-4 space-y-6"
          >
            {/* Risk Assessment: The Verdict */}
            {isOrphan ? (
              // Orphan File Status (replaces normal risk assessment)
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">
                  File Status
                </h3>
                <div className="p-4 rounded-lg border border-muted bg-muted/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Ghost
                      className="h-4 w-4 text-muted-foreground"
                      weight="fill"
                    />
                    <span className="font-semibold text-muted-foreground">
                      Orphaned File (Unused)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This file has 0 dependents and is not an entry point. Safe
                    to delete to reduce bundle size.
                  </p>
                  <div className="flex items-start gap-1.5 mt-2">
                    <Lightbulb
                      className="h-3 w-3 text-muted-foreground/60 mt-0.5 shrink-0"
                      weight="fill"
                    />
                    <p className="text-xs text-muted-foreground/60 italic">
                      Tip: Check if this is a test file, script, or dynamic
                      import before deleting. False positives may occur.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              riskAssessment && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-foreground">
                    Cost of Change
                  </h3>
                  {riskAssessment.isInCycle ? (
                    // Cycle Override: Critical Warning
                    <div className="p-4 rounded-lg border-2 border-red-500 bg-red-500/5">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="font-semibold text-red-500">
                          CRITICAL: Circular Dependency
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This file is part of a circular dependency chain.
                        Changes may cause infinite loops or compilation errors.
                      </p>
                    </div>
                  ) : (
                    // Normal Risk Assessment
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`p-4 rounded-lg border ${getRiskBorderClass(riskAssessment.level)} ${getRiskBgClass(riskAssessment.level)} cursor-help`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {riskAssessment.level === 'low' ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <AlertTriangle
                                    className={`h-4 w-4 ${getRiskTextClass(riskAssessment.level)}`}
                                  />
                                )}
                                <span
                                  className={`font-semibold ${getRiskTextClass(riskAssessment.level)}`}
                                >
                                  {getRiskLabel(riskAssessment.level)} Risk
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Score: {riskAssessment.riskScore.toFixed(1)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {getRiskDescription(riskAssessment.level)}
                            </p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-xs bg-popover border-border"
                        >
                          <div className="space-y-2">
                            <p className="font-semibold text-popover-foreground">
                              Risk Score: {riskAssessment.riskScore.toFixed(1)}
                            </p>
                            <p className="text-xs text-popover-foreground/80">
                              Measures <strong>blast radius</strong>: how many
                              files might break if you edit this file
                            </p>
                            {archMetrics && (
                              <div className="text-xs space-y-1 pt-1 border-t border-border">
                                <p className="text-popover-foreground/80">
                                  • <strong>Dependents (Ca):</strong>{' '}
                                  {archMetrics.ca}
                                </p>
                                <p className="text-popover-foreground/80">
                                  • <strong>Dependencies (Ce):</strong>{' '}
                                  {archMetrics.ce}
                                </p>
                                <p className="text-popover-foreground/80 pt-1">
                                  Calculation: {archMetrics.ca} + (
                                  {archMetrics.ce} × 0.5) ={' '}
                                  {riskAssessment.riskScore.toFixed(1)}
                                </p>
                              </div>
                            )}
                            <div className="text-xs pt-1 border-t border-border">
                              <p className="text-popover-foreground/80">
                                Higher score = more files affected when
                                modifying
                              </p>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {/* God Object Warning: Ce > 15 */}
                  {archMetrics && archMetrics.ce > 15 && (
                    <div className="mt-3 p-3 rounded-lg border border-yellow-500/50 bg-yellow-500/10">
                      <div className="flex items-center gap-2">
                        <Cube
                          className="h-4 w-4 text-yellow-500"
                          weight="fill"
                        />
                        <span className="text-sm font-medium text-yellow-500">
                          God Object Detected
                        </span>
                      </div>
                      <p className="text-xs text-yellow-400/80 mt-1">
                        This file depends on {archMetrics.ce} other files.
                        Consider breaking it down.
                      </p>
                    </div>
                  )}

                  {/* Bottleneck Warning: Ca > 20 */}
                  {archMetrics && archMetrics.ca > 20 && (
                    <div className="mt-3 p-3 rounded-lg border border-orange-500/50 bg-orange-500/10">
                      <div className="flex items-center gap-2">
                        <Target
                          className="h-4 w-4 text-orange-500"
                          weight="fill"
                        />
                        <span className="text-sm font-medium text-orange-500">
                          Core Bottleneck
                        </span>
                      </div>
                      <p className="text-xs text-orange-400/80 mt-1">
                        {archMetrics.ca} files depend on this. Changes will
                        break dozens of other components.
                      </p>
                    </div>
                  )}
                </div>
              )
            )}

            {/* Architecture Metrics: The Evidence */}
            {archMetrics && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">
                  Architecture Metrics
                </h3>
                <ArchitectureStats
                  ca={archMetrics.ca}
                  ce={archMetrics.ce}
                  instability={archMetrics.instability}
                  hasCycle={archMetrics.hasCycle}
                />
              </div>
            )}

            {/* Actions */}
            {onFocusSubgraph && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">
                  Graph Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={
                      focusDirection === 'inward' ? 'secondary' : 'outline'
                    }
                    size="sm"
                    onClick={() => setFocusDirection('inward')}
                    className="w-full justify-start"
                  >
                    <ArrowLeft className="h-3 w-3 mr-2" /> Inward
                  </Button>
                  <Button
                    variant={
                      focusDirection === 'outward' ? 'secondary' : 'outline'
                    }
                    size="sm"
                    onClick={() => setFocusDirection('outward')}
                    className="w-full justify-start"
                  >
                    Outward <ArrowRight className="h-3 w-3 ml-2" />
                  </Button>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onFocusSubgraph(nodeId, focusDirection)}
                  className="w-full"
                >
                  <Focus className="h-3 w-3 mr-2" />
                  Focus{' '}
                  {focusDirection === 'inward'
                    ? 'Dependencies'
                    : 'Dependents'}{' '}
                  Subgraph
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="dependencies" className="flex-1 m-0">
            {renderDependencyList(imports, 'imports')}
          </TabsContent>

          <TabsContent value="dependents" className="flex-1 m-0">
            {renderDependencyList(importers, 'importers')}
          </TabsContent>
        </Tabs>

        {/* Path Trace Modal */}
        <Dialog open={isPathModalOpen} onOpenChange={setIsPathModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Map className="h-5 w-5 text-muted-foreground" />
                Dependency Path to "{traceTarget}"
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {isTracing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">
                    Tracing path...
                  </div>
                </div>
              ) : tracedPath && tracedPath.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-3">
                    Shortest path found ({tracedPath.length} steps):
                  </div>
                  <div className="flex flex-col gap-2">
                    {tracedPath.map((file, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-medium shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-sm bg-muted/50 p-2 rounded-md truncate">
                            {getBasename(file)}
                          </div>
                        </div>
                        {index < tracedPath.length - 1 && (
                          <div className="text-muted-foreground shrink-0">
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-muted-foreground text-sm">
                    No direct dependency path found.
                  </div>
                </div>
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

// Helper functions for risk styling
function getRiskBorderClass(level: string): string {
  const borders: Record<string, string> = {
    critical: 'border-red-500',
    high: 'border-orange-500',
    medium: 'border-yellow-500',
    low: 'border-green-500'
  }
  return borders[level] || 'border-gray-300'
}

function getRiskBgClass(level: string): string {
  const bgs: Record<string, string> = {
    critical: 'bg-red-500/5',
    high: 'bg-orange-500/5',
    medium: 'bg-yellow-500/5',
    low: 'bg-green-500/5'
  }
  return bgs[level] || 'bg-gray-500/5'
}

function getRiskDescription(level: RiskLevel): string {
  const descriptions: Record<RiskLevel, string> = {
    critical: 'CRITICAL - highly unstable core module OR part of a cycle.',
    high: 'High impact - careful testing required after modification.',
    medium: 'Exercise caution - affects a handful of dependents.',
    low: 'Safe to modify - minimal collateral damage.'
  }
  return descriptions[level]
}

export default NodeDetailPanel
