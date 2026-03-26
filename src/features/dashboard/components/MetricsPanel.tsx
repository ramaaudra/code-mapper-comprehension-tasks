import React, { useState } from 'react'

import { Badge } from '@/shared/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/shared/components/ui/dialog'
import { AlertCircle, Puzzle, ShieldCheck } from '@/shared/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'
import { reachabilityCopy } from '@/shared/content/reachabilityCopy'
import { getBasename, getRelativePath } from '@/shared/lib/utils'

import type {
  AnalysisData,
  AnalysisMetrics,
  DetailedMetrics
} from '@/shared/types/analysis'

interface MetricsPanelProps {
  data?: AnalysisData | null
  onSelectFile?: (file: string) => void
}

// Component untuk menampilkan item file dengan value
const FileListItem = ({
  file,
  value,
  label,
  onSelect
}: {
  file: string
  value: number
  label: string
  onSelect?: (file: string) => void
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          onClick={() => onSelect?.(file)}
          className='w-full rounded-md border bg-background px-3 py-2 text-sm transition hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
        >
          <div className='mb-1 flex items-center justify-between gap-2'>
            <span className='flex-1 truncate text-left font-mono font-medium text-foreground'>
              {getBasename(file)}
            </span>
            <Badge
              variant='secondary'
              className='shrink-0 whitespace-nowrap text-xs'
            >
              {value} {label}
            </Badge>
          </div>
          <div className='break-all text-left font-mono text-xs leading-tight text-muted-foreground'>
            {getRelativePath(file)}
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className='max-w-xs whitespace-pre-line text-xs'>{file}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

// Health indicator component
const HealthIndicator = ({
  value,
  total,
  label,
  icon
}: {
  value: number
  total: number
  label: string
  icon: React.ReactNode
}) => {
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'

  return (
    <div className='flex items-center gap-3 rounded-lg bg-muted/30 p-3'>
      <div className='text-muted-foreground'>{icon}</div>
      <div className='flex-1'>
        <div className='mb-1 flex items-center justify-between'>
          <span className='text-sm font-medium'>{label}</span>
          <span className='text-xs text-muted-foreground'>{percentage}%</span>
        </div>
        <div className='text-xs text-muted-foreground'>
          {value} of {total} files
        </div>
      </div>
    </div>
  )
}

export default function MetricsPanel({
  data,
  onSelectFile
}: MetricsPanelProps) {
  const [criticalDialogOpen, setCriticalDialogOpen] = useState(false)
  const [complexDialogOpen, setComplexDialogOpen] = useState(false)
  // Fallback to old metrics format if detailedMetrics not available
  const detailedMetrics: DetailedMetrics | undefined = data?.detailedMetrics
  const basicMetrics: AnalysisMetrics | undefined = data?.metrics

  if (!detailedMetrics && !basicMetrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <ShieldCheck className='h-5 w-5 text-muted-foreground' />
            Code Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='py-8 text-center text-muted-foreground'>
            <ShieldCheck className='mx-auto mb-3 h-12 w-12 opacity-50' />
            <p className='text-sm'>No metrics data available</p>
            <p className='mt-1 text-xs'>Analyze a project to see statistics</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If only basic metrics available, show simple version
  if (!detailedMetrics && basicMetrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Metrics</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>Files</span>
            <span className='text-sm font-medium'>
              {basicMetrics.fileCount.toLocaleString()}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>Dependencies</span>
            <span className='text-sm font-medium'>
              {basicMetrics.edgeCount.toLocaleString()}
            </span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>Avg Degree</span>
            <span className='text-sm font-medium'>
              {basicMetrics.avgDegree}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!detailedMetrics) {
    return null
  }

  const { totalFiles, topImporters, mostDependedOn, codebaseHealth } =
    detailedMetrics

  return (
    <div className='space-y-6'>
      {/* Codebase Health Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <ShieldCheck className='h-5 w-5 text-muted-foreground' />
            Codebase Health
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <HealthIndicator
            value={codebaseHealth.orphanCount}
            total={totalFiles}
            label={reachabilityCopy.collectionTitle}
            icon={<AlertCircle size={16} />}
          />
          <HealthIndicator
            value={codebaseHealth.circularCount}
            total={totalFiles}
            label='Circular Dependencies'
            icon={<AlertCircle size={16} />}
          />
        </CardContent>
      </Card>

      <div className='space-y-4'>
        {/* Most Depended On Files Card */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <ShieldCheck className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium'>Most Depended On</span>
              </div>
              <Dialog
                open={criticalDialogOpen}
                onOpenChange={setCriticalDialogOpen}
              >
                <DialogTrigger asChild>
                  <Badge
                    variant='default'
                    className='cursor-pointer hover:opacity-80'
                  >
                    {mostDependedOn.length}
                  </Badge>
                </DialogTrigger>
                <DialogContent className='max-w-2xl'>
                  <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                      <ShieldCheck className='h-5 w-5 text-red-500' />
                      Most Depended On ({mostDependedOn.length})
                    </DialogTitle>
                  </DialogHeader>
                  <div className='max-h-96 overflow-y-auto p-2'>
                    {mostDependedOn.length === 0 ? (
                      <div className='py-8 text-center text-muted-foreground'>
                        <ShieldCheck className='mx-auto mb-3 h-12 w-12 opacity-50' />
                        <p>No highly depended files identified</p>
                      </div>
                    ) : (
                      <div className='space-y-2'>
                        {mostDependedOn.map((item, index) => (
                          <TooltipProvider key={index}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type='button'
                                  onClick={() => {
                                    onSelectFile?.(item.file)
                                    setCriticalDialogOpen(false)
                                  }}
                                  className='w-full rounded-lg border px-3 py-3 text-left transition hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
                                >
                                  <div className='mb-1 flex items-center justify-between gap-3'>
                                    <span className='flex-1 truncate font-mono text-sm font-medium'>
                                      {getBasename(item.file)}
                                    </span>
                                    <Badge
                                      variant='secondary'
                                      className='shrink-0'
                                    >
                                      {item.indegree} imports
                                    </Badge>
                                  </div>
                                  <div className='break-all font-mono text-xs leading-tight text-muted-foreground'>
                                    {getRelativePath(item.file)}
                                  </div>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className='max-w-sm whitespace-pre-line text-xs'>
                                  {item.file}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {mostDependedOn.slice(0, 3).map((item, index) => (
                <FileListItem
                  key={index}
                  file={item.file}
                  value={item.indegree}
                  label='imports'
                  onSelect={onSelectFile}
                />
              ))}
              {mostDependedOn.length > 3 && (
                <div className='py-2 text-center text-xs text-muted-foreground'>
                  +{mostDependedOn.length - 3} more files
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Importers Card */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Puzzle className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium'>Top Importers</span>
              </div>
              <Dialog
                open={complexDialogOpen}
                onOpenChange={setComplexDialogOpen}
              >
                <DialogTrigger asChild>
                  <Badge
                    variant='default'
                    className='cursor-pointer hover:opacity-80'
                  >
                    {topImporters.length}
                  </Badge>
                </DialogTrigger>
                <DialogContent className='max-w-2xl'>
                  <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                      <Puzzle className='h-5 w-5 text-blue-500' />
                      Top Importers ({topImporters.length})
                    </DialogTitle>
                  </DialogHeader>
                  <div className='max-h-96 overflow-y-auto p-2'>
                    {topImporters.length === 0 ? (
                      <div className='py-8 text-center text-muted-foreground'>
                        <Puzzle className='mx-auto mb-3 h-12 w-12 opacity-50' />
                        <p>No top importers identified</p>
                      </div>
                    ) : (
                      <div className='space-y-2'>
                        {topImporters.map((item, index) => (
                          <TooltipProvider key={index}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type='button'
                                  onClick={() => {
                                    onSelectFile?.(item.file)
                                    setComplexDialogOpen(false)
                                  }}
                                  className='w-full rounded-lg border px-3 py-3 text-left transition hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
                                >
                                  <div className='mb-1 flex items-center justify-between gap-3'>
                                    <span className='flex-1 truncate font-mono text-sm font-medium'>
                                      {getBasename(item.file)}
                                    </span>
                                    <Badge
                                      variant='secondary'
                                      className='shrink-0'
                                    >
                                      {item.outdegree} deps
                                    </Badge>
                                  </div>
                                  <div className='break-all font-mono text-xs leading-tight text-muted-foreground'>
                                    {getRelativePath(item.file)}
                                  </div>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className='max-w-sm whitespace-pre-line text-xs'>
                                  {item.file}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {topImporters.slice(0, 3).map((item, index) => (
                <FileListItem
                  key={index}
                  file={item.file}
                  value={item.outdegree}
                  label='deps'
                  onSelect={onSelectFile}
                />
              ))}
              {topImporters.length > 3 && (
                <div className='py-2 text-center text-xs text-muted-foreground'>
                  +{topImporters.length - 3} more files
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
