/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'

import { findDependencyPath } from '@/lib/api'
import { getBasename, getRelativePath } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  FileText,
  Focus,
  Map,
  X
} from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import type { FileRiskProfile } from '@/types/risk'

interface NodeDetailPanelProps {
  node: any
  data: any
  onClose: () => void
  onFocusSubgraph?: (nodeId: string, direction: 'inward' | 'outward') => void
  riskProfile?: FileRiskProfile | null
}

export default function NodeDetailPanel({
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
  const [copiedType, setCopiedType] = useState<'full' | 'relative' | null>(null)

  if (!node || !data) {
    return null
  }

  // Handle both old node object format and new node ID format
  const nodeId = typeof node === 'string' ? node : node.id
  const nodeData = data.nodes.find((n: any) => n.id === nodeId)

  if (!nodeData) {
    return null
  }

  // Calculate indegree and outdegree
  const incomingEdges = data.edges.filter((e: any) => e.target === nodeId)
  const outgoingEdges = data.edges.filter((e: any) => e.source === nodeId)

  const indegree = incomingEdges.length
  const outdegree = outgoingEdges.length

  // Get importers (files that import this file)
  const importers = incomingEdges.map((e: any) => {
    const sourceNode = data.nodes.find((n: any) => n.id === e.source)
    return {
      id: e.source,
      label: sourceNode?.label || e.source,
      basename: sourceNode?.basename || '',
      kind: e.kind,
      strength: e.strength || 1,
      line: e.line || 0
    }
  })

  // Get imports (files that this file imports)
  const imports = outgoingEdges.map((e: any) => {
    const targetNode = data.nodes.find((n: any) => n.id === e.target)
    return {
      id: e.target,
      label: targetNode?.label || e.target,
      basename: targetNode?.basename || '',
      kind: e.kind,
      strength: e.strength || 1,
      line: e.line || 0
    }
  })

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

  const riskBadgeClass = riskProfile
    ? riskProfile.category === 'Kritis'
      ? 'bg-red-500'
      : riskProfile.category === 'Tinggi'
        ? 'bg-orange-500'
        : riskProfile.category === 'Sedang'
          ? 'bg-yellow-500 text-yellow-900'
          : 'bg-green-500'
    : ''

  const handleTracePath = async (targetFile: string) => {
    setIsTracing(true)
    setTraceTarget(getBasename(targetFile))
    try {
      const pathResult = await findDependencyPath({
        startNode: nodeId,
        endNode: targetFile
      })
      setTracedPath(pathResult)
      setIsPathModalOpen(true) // Buka modal setelah path ditemukan
    } catch (error) {
      console.error('Gagal melacak path:', error)
      // Anda bisa menambahkan notifikasi error di sini
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

  return (
    <div className="h-full w-full bg-white dark:bg-slate-900 overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              File Details
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* File Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="truncate">{nodeData.basename}</span>
              <div className="relative shrink-0">
                <TooltipProvider>
                  <Tooltip open={showCopyMenu || copiedType !== null}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowCopyMenu(!showCopyMenu)}
                        className="h-6 w-6"
                        title="Copy path"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="p-1 min-w-[120px]"
                      onPointerDownOutside={() => setShowCopyMenu(false)}
                    >
                      {copiedType ? (
                        <div className="px-2 py-1 text-xs text-green-600">
                          ✓ Copied {copiedType === 'full' ? 'full' : 'relative'}{' '}
                          path!
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => copyPath('full')}
                            className="px-2 py-1 text-xs text-left hover:bg-accent rounded transition-colors"
                          >
                            Copy full path
                          </button>
                          <button
                            onClick={() => copyPath('relative')}
                            className="px-2 py-1 text-xs text-left hover:bg-accent rounded transition-colors"
                          >
                            Copy relative path
                          </button>
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs text-slate-600 dark:text-slate-400 font-mono break-all">
              {getRelativePath(nodeData.label)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500 font-mono break-all border-t pt-2">
              Full: {nodeData.label}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Size:</span>
              <span className="font-medium">
                {formatFileSize(nodeData.size)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Connection Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {indegree}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Incoming
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {outdegree}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Outgoing
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {riskProfile && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Analisis Risiko Refactor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <Badge className={`text-lg px-4 py-1 ${riskBadgeClass}`}>
                  {riskProfile.category}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Skor: {riskProfile.score}
                </p>
              </div>
              <div className="text-sm space-y-2 pt-2 border-t">
                <h4 className="font-semibold">Faktor Pemicu:</h4>
                <div className="flex justify-between">
                  <span>Diimpor oleh (Indegree):</span>{' '}
                  <span className="font-bold">
                    {riskProfile.factors.indegree} files
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Mengimpor (Outdegree):</span>{' '}
                  <span className="font-bold">
                    {riskProfile.factors.outdegree} files
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Terlibat Siklus:</span>{' '}
                  <span className="font-bold">
                    {riskProfile.factors.inCycle ? 'Ya' : 'Tidak'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Focus Subgraph */}
        {onFocusSubgraph && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Focus className="h-4 w-4" />
                Focus Subgraph
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant={focusDirection === 'inward' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFocusDirection('inward')}
                  className="flex-1"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Inward
                </Button>
                <Button
                  variant={focusDirection === 'outward' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFocusDirection('outward')}
                  className="flex-1"
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Outward
                </Button>
              </div>
              <Button
                onClick={() => onFocusSubgraph(nodeId, focusDirection)}
                className="w-full"
                size="sm"
              >
                Focus{' '}
                {focusDirection === 'inward' ? 'Dependencies' : 'Dependents'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Importers */}
        {importers.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                Imported By ({importers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {importers.slice(0, 10).map((imp: any) => (
                <div
                  key={imp.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="truncate flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {imp.basename}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {imp.label} (line: {imp.line})
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Strength badge with tooltip */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant={
                              imp.strength >= 3 ? 'destructive' : 'secondary'
                            }
                          >
                            🔗 {imp.strength}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Coupling strength: {imp.strength} items imported
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleTracePath(imp.id)}
                      disabled={isTracing}
                      title={`Trace path to ${imp.basename}`}
                    >
                      <Map className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Badge
                      variant={imp.kind === 'dynamic' ? 'default' : 'secondary'}
                    >
                      {imp.kind}
                    </Badge>
                  </div>
                </div>
              ))}
              {importers.length > 10 && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  +{importers.length - 10} more...
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Imports */}
        {imports.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                Imports ({imports.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {imports.slice(0, 10).map((imp: any) => (
                <div
                  key={imp.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="truncate flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {imp.basename}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {imp.label} (line: {imp.line})
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Strength badge with tooltip */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant={
                              imp.strength >= 3 ? 'destructive' : 'secondary'
                            }
                          >
                            🔗 {imp.strength}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Coupling strength: {imp.strength} items imported
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleTracePath(imp.id)}
                      disabled={isTracing}
                      title={`Trace path to ${imp.basename}`}
                    >
                      <Map className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Badge
                      variant={imp.kind === 'dynamic' ? 'default' : 'secondary'}
                    >
                      {imp.kind}
                    </Badge>
                  </div>
                </div>
              ))}
              {imports.length > 10 && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  +{imports.length - 10} more...
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal untuk menampilkan hasil path */}
      <Dialog open={isPathModalOpen} onOpenChange={setIsPathModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-blue-600" />
              Dependency Path to "{traceTarget}"
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {isTracing ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">
                  Mencari jalur dependensi...
                </div>
              </div>
            ) : tracedPath && tracedPath.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-3">
                  Jalur terpendek ditemukan ({tracedPath.length} langkah):
                </div>
                <div className="flex flex-col gap-2">
                  {tracedPath.map((file, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-medium shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm bg-muted p-3 rounded-md truncate">
                          <div className="font-semibold text-foreground">
                            {getBasename(file)}
                          </div>
                          <div
                            className="text-xs text-muted-foreground mt-1 truncate"
                            title={file}
                          >
                            {file}
                          </div>
                        </div>
                      </div>
                      {index < tracedPath.length - 1 && (
                        <div className="text-muted-foreground shrink-0">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-muted-foreground text-sm">
                  Tidak ada jalur dependensi langsung yang ditemukan antara file
                  ini dan "{traceTarget}".
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  File mungkin tidak terhubung secara langsung atau terdapat
                  circular dependency.
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
