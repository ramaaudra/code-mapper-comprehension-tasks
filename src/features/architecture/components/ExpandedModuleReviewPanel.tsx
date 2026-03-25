import { useState } from 'react'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { ArrowRight, WarningCircle } from '@/shared/components/ui/icons'

import { architectureCopy } from '../content/architectureCopy'
import {
  buildModuleReviewGroups,
  type PrioritizedModuleReviewFile
} from '../lib/module-review-priority'
import { ModuleReviewSummary } from './ModuleReviewSummary'

import type {
  FileArchitectureMetrics,
  FolderArchitectureMetrics
} from '../types/architecture'

interface ExpandedModuleReviewPanelProps {
  folder: FolderArchitectureMetrics
  files: FileArchitectureMetrics[]
  onNavigateToFile?: (filePath: string) => void
  evolutionaryMetricsAvailable?: boolean
}

interface ReviewGroupSectionProps {
  title: string
  description: string
  files: PrioritizedModuleReviewFile[]
  onNavigateToFile?: (filePath: string) => void
}

function ReviewGroupSection({
  title,
  description,
  files,
  onNavigateToFile
}: ReviewGroupSectionProps) {
  if (files.length === 0) {
    return null
  }

  return (
    <section className='space-y-3'>
      <div className='space-y-1'>
        <h4 className='text-sm font-semibold text-foreground'>{title}</h4>
        <p className='text-xs leading-relaxed text-muted-foreground'>
          {description}
        </p>
      </div>

      <div className='space-y-3'>
        {files.map((item) => {
          return (
            <article
              key={item.file.filePath}
              className='rounded-xl border border-border/60 bg-background/70 p-4'
            >
              <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                <div className='min-w-0 space-y-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <h5 className='font-mono text-sm text-foreground'>
                      {item.basename}
                    </h5>
                    <Badge
                      variant='outline'
                      className='bg-background/60 text-[11px] font-medium'
                    >
                      {item.structuralRoleLabel}
                    </Badge>
                    {item.file.hasCycle ? (
                      <Badge
                        variant='outline'
                        className='border-destructive/30 bg-destructive/5 text-[11px] font-medium text-destructive'
                      >
                        Cycle member
                      </Badge>
                    ) : null}
                  </div>
                  <p className='break-all text-xs text-muted-foreground'>
                    {item.relativePath}
                  </p>
                </div>

                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={() => {
                    onNavigateToFile?.(item.file.filePath)
                  }}
                  disabled={!onNavigateToFile}
                >
                  {architectureCopy.table.expanded.inspectFileAction}
                  <ArrowRight className='ml-1 h-4 w-4' />
                </Button>
              </div>

              <p className='mt-3 text-sm leading-relaxed text-foreground/90'>
                {item.reviewReason}
              </p>

              <div className='mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground'>
                <Badge
                  variant='outline'
                  className='bg-background/60 font-medium'
                >
                  Used by {item.file.ca}
                </Badge>
                <Badge
                  variant='outline'
                  className='bg-background/60 font-medium'
                >
                  Imports {item.file.ce}
                </Badge>
                {item.secondarySignal ? (
                  <Badge
                    variant='outline'
                    className='bg-background/60 font-medium'
                  >
                    {item.secondarySignal}
                  </Badge>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function ExpandedModuleReviewPanel({
  folder,
  files,
  onNavigateToFile,
  evolutionaryMetricsAvailable = true
}: ExpandedModuleReviewPanelProps) {
  const [showRemaining, setShowRemaining] = useState(false)
  const reviewGroups = buildModuleReviewGroups(files)

  return (
    <div className='space-y-4 bg-muted/30 px-4 py-4 sm:px-6'>
      <ModuleReviewSummary
        folder={folder}
        evolutionaryMetricsAvailable={evolutionaryMetricsAvailable}
      />

      {folder.hasCycle ? (
        <div className='flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive'>
          <WarningCircle size={16} weight='fill' className='mt-0.5 shrink-0' />
          <div className='space-y-1'>
            <p className='text-sm font-semibold'>
              {architectureCopy.table.expanded.cycleWarningTitle}
            </p>
            <p className='text-xs leading-relaxed'>
              {architectureCopy.table.expanded.cycleWarningDescription}
            </p>
          </div>
        </div>
      ) : null}

      <ReviewGroupSection
        title={architectureCopy.table.expanded.startHereTitle}
        description={architectureCopy.table.expanded.startHereDescription}
        files={reviewGroups.startHere}
        onNavigateToFile={onNavigateToFile}
      />

      <ReviewGroupSection
        title={architectureCopy.table.expanded.nextFilesTitle}
        description={architectureCopy.table.expanded.nextFilesDescription}
        files={reviewGroups.nextToVerify}
        onNavigateToFile={onNavigateToFile}
      />

      {reviewGroups.remaining.length > 0 ? (
        <div className='space-y-3'>
          <Button
            type='button'
            variant='ghost'
            className='h-auto px-0 py-0 text-sm font-medium'
            onClick={() => {
              setShowRemaining((prev) => !prev)
            }}
          >
            {showRemaining
              ? architectureCopy.table.expanded.hideRemainingAction
              : `${architectureCopy.table.expanded.showRemainingAction} ${reviewGroups.remaining.length} files`}
          </Button>

          {showRemaining ? (
            <ReviewGroupSection
              title={architectureCopy.table.expanded.remainingTitle}
              description='These files look quieter after the higher-signal files above.'
              files={reviewGroups.remaining}
              onNavigateToFile={onNavigateToFile}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
