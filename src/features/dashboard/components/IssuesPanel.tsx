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
import {
  AlertTriangle,
  ArrowRight,
  Ghost,
  WarningCircle
} from '@/shared/components/ui/icons'
import { InfoTooltip } from '@/shared/components/ui/info-tooltip'
import { getBasename, getRelativePath } from '@/shared/lib/utils'

import type { AnalysisData } from '@/shared/types/analysis'

interface IssuesPanelProps {
  data: AnalysisData | null
  onNavigateToFile?: (file: string) => void
}

// Helper function to get severity badge variant
const getSeverityBadgeVariant = (
  severity: 'high' | 'medium' | 'low'
): 'destructive' | 'default' | 'outline' => {
  switch (severity) {
    case 'high':
      return 'destructive'
    case 'medium':
      return 'default'
    case 'low':
      return 'outline'
  }
}

export function IssuesPanel({ data, onNavigateToFile }: IssuesPanelProps) {
  const [circularDialogOpen, setCircularDialogOpen] = useState(false)
  const [orphansDialogOpen, setOrphansDialogOpen] = useState(false)
  if (!data?.issues) {
    return (
      <Card className='h-full'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-sm font-medium'>
            <AlertTriangle className='h-4 w-4' />
            Issues Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            No analysis data available
          </p>
        </CardContent>
      </Card>
    )
  }

  const { circularDependencies, orphans } = data.issues

  // Count by severity
  const severityCounts = circularDependencies.reduce(
    (acc, dep) => {
      acc[dep.severity] = (acc[dep.severity] || 0) + 1
      return acc
    },
    {} as Record<'high' | 'medium' | 'low', number>
  )

  return (
    <div className='space-y-4 overflow-x-hidden'>
      {/* Circular Dependencies */}
      <Card className='overflow-hidden'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <AlertTriangle className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Circular Dependencies</span>
            </div>
            <div className='flex items-center gap-2'>
              {/* Severity badges in header */}
              {(['high', 'medium', 'low'] as const).map((severity) => {
                const count = severityCounts[severity] || 0
                if (count === 0) {
                  return null
                }
                return (
                  <Badge
                    key={severity}
                    variant={getSeverityBadgeVariant(severity)}
                    className='px-1.5 py-0 text-[10px]'
                  >
                    {count} {severity}
                  </Badge>
                )
              })}
              <Dialog
                open={circularDialogOpen}
                onOpenChange={setCircularDialogOpen}
              >
                <DialogTrigger asChild>
                  <Badge
                    variant={
                      circularDependencies.length > 0
                        ? 'destructive'
                        : 'secondary'
                    }
                    className='cursor-pointer hover:opacity-80'
                  >
                    {circularDependencies.length}
                  </Badge>
                </DialogTrigger>
                <DialogContent className='max-h-[80vh] max-w-4xl'>
                  <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                      <AlertTriangle className='h-5 w-5 text-orange-500' />
                      Circular Dependencies ({circularDependencies.length})
                    </DialogTitle>
                  </DialogHeader>
                  <div className='space-y-4 overflow-y-auto p-2'>
                    {circularDependencies.length === 0 ? (
                      <div className='py-8 text-center text-muted-foreground'>
                        <AlertTriangle className='mx-auto h-12 w-12 opacity-50' />
                        <p>✅ No circular dependencies found!</p>
                        <p className='mt-1 text-xs'>
                          Your codebase has a clean dependency structure.
                        </p>
                      </div>
                    ) : (
                      circularDependencies.map((depInfo, index) => (
                        <div
                          key={index}
                          className='space-y-3 rounded-lg bg-muted/20 p-4'
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <span className='text-sm font-semibold'>
                                Cycle #{index + 1}
                              </span>
                              <Badge
                                variant={getSeverityBadgeVariant(
                                  depInfo.severity
                                )}
                                className='px-2 py-1 text-xs'
                              >
                                {depInfo.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              Length: {depInfo.length} • Files:{' '}
                              {depInfo.files.length}
                            </div>
                          </div>

                          <div className='rounded-md bg-muted/50 p-3'>
                            <p className='mb-2 text-xs font-medium text-muted-foreground'>
                              Dependency Flow:
                            </p>
                            <div className='flex flex-wrap items-center gap-2 font-mono text-xs'>
                              {depInfo.cycle.map((file, fileIndex) => (
                                <React.Fragment key={fileIndex}>
                                  <button
                                    type='button'
                                    onClick={() => {
                                      onNavigateToFile?.(file)
                                      setCircularDialogOpen(false)
                                    }}
                                    className='rounded bg-muted/30 px-2 py-1 text-left text-xs transition hover:bg-muted/50 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
                                    title={file}
                                  >
                                    <span className='truncate'>
                                      {getBasename(file)}
                                    </span>
                                  </button>
                                  {fileIndex < depInfo.cycle.length - 1 && (
                                    <ArrowRight className='h-3 w-3 text-muted-foreground' />
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className='mb-2 text-xs font-medium text-muted-foreground'>
                              Files Involved:
                            </p>
                            <div className='flex flex-wrap gap-1'>
                              {depInfo.files.map((file, fileIndex) => (
                                <Badge
                                  key={fileIndex}
                                  variant='outline'
                                  className='cursor-pointer text-xs hover:border-primary/50 hover:text-primary'
                                  onClick={() => {
                                    onNavigateToFile?.(file)
                                    setCircularDialogOpen(false)
                                  }}
                                  title={file}
                                >
                                  {getBasename(file)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <InfoTooltip title='What is Circular Dependency?' side='top'>
                <div className='space-y-2'>
                  <p className='text-xs text-popover-foreground'>
                    A circular dependency occurs when module A depends on B, and
                    B depends on A directly or indirectly.
                  </p>
                  <div className='space-y-1 border-t border-border pt-1 text-xs'>
                    <p className='font-semibold text-popover-foreground'>
                      Why is it problematic?
                    </p>
                    <p className='text-popover-foreground/80'>
                      • Creates tight coupling between modules
                      <br />• Makes code harder to test in isolation
                      <br />• Can cause stack overflow errors
                      <br />• Difficult to extract and reuse code
                    </p>
                  </div>
                  <p className='pt-1 text-xs text-popover-foreground/80'>
                    Break cycles by introducing abstractions or restructuring
                    dependencies.
                  </p>
                </div>
              </InfoTooltip>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className='space-y-4'>
        {/* Orphaned Files */}
        <Card className='overflow-hidden'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Ghost className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium'>Orphaned Files</span>
              </div>
              <div className='flex items-center gap-2'>
                <Dialog
                  open={orphansDialogOpen}
                  onOpenChange={setOrphansDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Badge
                      variant={orphans.length > 0 ? 'outline' : 'secondary'}
                      className='cursor-pointer hover:opacity-80'
                    >
                      {orphans.length}
                    </Badge>
                  </DialogTrigger>
                  <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                      <DialogTitle className='flex items-center gap-2'>
                        <Ghost className='h-5 w-5 text-gray-500' />
                        Orphaned Files ({orphans.length})
                      </DialogTitle>
                    </DialogHeader>
                    <div className='max-h-96 space-y-2 overflow-y-auto p-2'>
                      {orphans.length === 0 ? (
                        <div className='py-8 text-center text-muted-foreground'>
                          <Ghost className='mx-auto h-12 w-12 opacity-50' />
                          <p>✅ No orphaned files found!</p>
                          <p className='mt-1 text-xs'>
                            All files are properly referenced.
                          </p>
                        </div>
                      ) : (
                        orphans.map((file: string, index: number) => (
                          <button
                            key={index}
                            type='button'
                            onClick={() => {
                              onNavigateToFile?.(file)
                              setOrphansDialogOpen(false)
                            }}
                            className='w-full rounded-lg bg-muted/20 px-3 py-3 text-left transition hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
                            title={file}
                          >
                            <span className='mb-1 block truncate text-sm font-medium'>
                              {getBasename(file)}
                            </span>
                            <span className='block break-all font-mono text-xs leading-tight text-foreground/70'>
                              {getRelativePath(file)}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                <InfoTooltip title='What are Orphaned Files?' side='top'>
                  <div className='space-y-2'>
                    <p className='text-xs text-popover-foreground'>
                      Orphaned files are files that are not reachable from any
                      entry point. They are not imported by other files and are
                      not application entry points.
                    </p>
                    <div className='space-y-1 border-t border-border pt-1 text-xs'>
                      <p className='font-semibold text-popover-foreground'>
                        Why should you care?
                      </p>
                      <p className='text-popover-foreground/80'>
                        • Increases bundle size without being used
                        <br />• Confuses developers about codebase structure
                        <br />• May be dead code that was forgotten
                      </p>
                    </div>
                    <div className='space-y-1 border-t border-border pt-1 text-xs'>
                      <div className='flex items-center gap-1'>
                        <WarningCircle
                          className='h-3 w-3 text-yellow-500'
                          weight='fill'
                        />
                        <p className='font-semibold text-popover-foreground'>
                          False Positives (check before deleting!)
                        </p>
                      </div>
                      <p className='text-popover-foreground/80'>
                        • Test files (*.test.ts, *.spec.tsx)
                        <br />• Scripts (build, deploy, migration)
                        <br />• Dynamic imports (import('./module'))
                        <br />• Config files (vite.config.ts, etc.)
                        <br />• Type definition files (*.d.ts)
                      </p>
                    </div>
                    <p className='pt-1 text-xs text-popover-foreground/80'>
                      Review before deleting - make sure it's not a test file or
                      script that is intentionally standalone.
                    </p>
                  </div>
                </InfoTooltip>
              </div>
            </div>
          </CardHeader>
          {orphans.length > 0 && (
            <CardContent>
              <div className='space-y-2'>
                {orphans.slice(0, 4).map((file, index) => (
                  <button
                    key={index}
                    type='button'
                    onClick={() => onNavigateToFile?.(file)}
                    className='w-full rounded-md bg-muted/20 px-3 py-2 text-left text-sm transition hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
                    title={file}
                  >
                    <span className='block truncate font-medium'>
                      {getBasename(file)}
                    </span>
                    <span className='block break-all font-mono text-xs leading-tight text-foreground/70'>
                      {getRelativePath(file)}
                    </span>
                  </button>
                ))}
                {orphans.length > 4 && (
                  <p className='text-center text-xs text-muted-foreground'>
                    +{orphans.length - 4} more files
                  </p>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
