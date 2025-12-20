/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useMemo, useState } from 'react'

import {
  ArchitectureStats,
  useFileArchitectureMetrics
} from '@/features/architecture'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  FileText,
  Focus,
  Map,
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
import { getBasename, getRelativePath } from '@/shared/lib/utils'
import { getRiskColor } from '@/shared/lib/utils/risk'
import type { FileRiskProfile } from '@/shared/types/risk'

interface NodeDetailPanelProps {
  node: any
  data: any
  onClose: () => void
  onFocusSubgraph?: (nodeId: string, direction: 'inward' | 'outward') => void
  riskProfile?: FileRiskProfile | null
}

const NodeDetailPanel = memo(
  function NodeDetailPanel({
    node,
    data,
    onClose,
    onFocusSubgraph,
    riskProfile
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

    const indegree = incomingEdges.length
    const outdegree = outgoingEdges.length

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
        console.error('Gagal melacak path:', error)
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
            {items.map((item: any) => (
              <div
                key={item.id}
                className="group flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
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
                    className="text-xs text-muted-foreground truncate"
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
                  >
                    <Map className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )
    }

    return (
      <div className="h-full w-full bg-background flex flex-col">
        {/* Header */}
        <div className="flex-none p-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 overflow-hidden">
              <div className="mt-1 p-1.5 bg-muted rounded-md shrink-0">
                <FileText className="h-5 w-5 text-muted-foreground" />
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
                    className="text-xs text-muted-foreground truncate max-w-[240px]"
                    title={nodeData.id}
                  >
                    {getRelativePath(nodeData.id)}
                  </p>
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
                            ✓ Copied!
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => copyPath('full')}
                              className="px-2 py-1 text-xs text-left hover:bg-accent rounded"
                            >
                              Copy full path
                            </button>
                            <button
                              onClick={() => copyPath('relative')}
                              className="px-2 py-1 text-xs text-left hover:bg-accent rounded"
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
                Deps{' '}
                <span className="ml-1.5 text-xs text-muted-foreground bg-muted px-1.5 rounded-full">
                  {outgoingEdges.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="dependents"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2 pt-1.5"
              >
                Users{' '}
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
            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg border border-border/50 text-center">
                <div className="text-2xl font-semibold text-foreground">
                  {formatFileSize(nodeData.size).split(' ')[0]}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">
                  {formatFileSize(nodeData.size).split(' ')[1]}
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border/50 text-center">
                <div className="text-2xl font-semibold text-foreground">
                  {indegree}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">
                  Users
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border/50 text-center">
                <div className="text-2xl font-semibold text-foreground">
                  {outdegree}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">
                  Deps
                </div>
              </div>
            </div>

            {/* Risk Analysis */}
            {riskProfile && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">
                  Refactor Risk
                </h3>
                <div className="p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant="outline"
                      className={`${getRiskColor(riskProfile.category)} bg-transparent`}
                    >
                      {riskProfile.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Score: {riskProfile.score}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">In Cycle</span>
                      <span
                        className={
                          riskProfile.factors.inCycle
                            ? 'text-destructive font-medium'
                            : 'text-foreground'
                        }
                      >
                        {riskProfile.factors.inCycle ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Architecture Metrics */}
            {archMetrics && (
              <ArchitectureStats
                ca={archMetrics.ca}
                ce={archMetrics.ce}
                instability={archMetrics.instability}
                hasCycle={archMetrics.hasCycle}
              />
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

    const riskEqual =
      prevProps.riskProfile?.score === nextProps.riskProfile?.score

    // Only re-render if node or risk actually changed
    return nodeIdEqual && riskEqual
  }
)

export default NodeDetailPanel
