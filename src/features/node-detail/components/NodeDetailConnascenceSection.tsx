import { Button } from '@/shared/components/ui/button'
import { DetailPanelSectionHeading } from '@/shared/components/ui/detail-panel-section-heading'
import { ArrowRight, Focus } from '@/shared/components/ui/icons'
import { InfoTooltip } from '@/shared/components/ui/info-tooltip'

import { nodeDetailCopy } from '../content/nodeDetailCopy'
import { buildNodeDetailConnascenceItems } from '../lib/connascence-presentation'

import type { ConnascenceSignal } from '@/shared/types/analysis'

interface NodeDetailConnascenceSectionProps {
  signals: ConnascenceSignal[]
  onNavigateToFile?: (filePath: string) => void
  onOpenDependents?: () => void
  onFocusDependents?: () => void
}

export function NodeDetailConnascenceSection({
  signals,
  onNavigateToFile,
  onOpenDependents,
  onFocusDependents
}: NodeDetailConnascenceSectionProps) {
  const items = buildNodeDetailConnascenceItems(signals)

  if (items.length === 0) {
    return null
  }

  return (
    <section className='space-y-3'>
      <DetailPanelSectionHeading
        title={nodeDetailCopy.connascence.title}
        level='section'
        meta={
          <InfoTooltip
            title={nodeDetailCopy.connascence.tooltipTitle}
            triggerLabel={nodeDetailCopy.connascence.tooltipTitle}
          >
            <p className='text-xs leading-relaxed text-popover-foreground'>
              {nodeDetailCopy.connascence.tooltipDescription}
            </p>
          </InfoTooltip>
        }
      />
      <p className='text-xs leading-relaxed text-muted-foreground'>
        {nodeDetailCopy.connascence.description}
      </p>
      <div className='space-y-3'>
        {items.map((item) => (
          <article
            key={item.signalKey}
            className='rounded-xl border border-border/60 bg-background/60 p-4'
          >
            <div className='space-y-1'>
              <h4 className='text-[15px] font-semibold tracking-tight text-foreground'>
                {item.headline}
              </h4>
              <p className='text-[11px] leading-5 text-muted-foreground/85'>
                {item.scopeLabel} {'\u2022'} {item.reviewTargetsLabel}
              </p>
            </div>

            {item.declarationPreview ? (
              <div className='mt-4 rounded-lg border border-border/50 bg-muted/10 px-3 py-3'>
                <p className='text-[11px] font-medium text-muted-foreground'>
                  {nodeDetailCopy.connascence.declarationPreviewLabel}
                </p>
                <p className='mt-1.5 break-words font-mono text-[12px] leading-5 text-foreground/90'>
                  {item.declarationPreview}
                </p>
              </div>
            ) : null}

            <p className='mt-3 text-sm leading-6 text-foreground/90'>
              {item.impactSummary}
            </p>

            <div className='mt-4 space-y-2'>
              <p className='text-xs font-medium text-muted-foreground'>
                {nodeDetailCopy.connascence.reviewFilesLabel}
              </p>
              <div className='overflow-hidden rounded-lg border border-border/50 bg-muted/10'>
                {item.relatedFiles.map((file, index) => (
                  <Button
                    key={file.filePath}
                    type='button'
                    size='sm'
                    variant='ghost'
                    className={`group h-auto w-full justify-between rounded-none px-3 py-3 text-left transition-colors hover:bg-muted/45 ${
                      index > 0 ? 'border-t border-border/50' : ''
                    }`}
                    onClick={() => onNavigateToFile?.(file.filePath)}
                    disabled={!onNavigateToFile}
                  >
                    <span className='min-w-0'>
                      <span className='block font-mono text-sm font-medium text-foreground'>
                        {file.basename}
                      </span>
                      <span
                        className='mt-1 block truncate font-mono text-[11px] text-muted-foreground/70 transition-colors group-hover:text-muted-foreground'
                        title={file.relativePath}
                      >
                        {file.displayPath}
                      </span>
                    </span>
                    <ArrowRight className='ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground' />
                  </Button>
                ))}
              </div>
            </div>

            <div className='mt-4 rounded-lg bg-muted/10 px-3 py-3'>
              <p className='text-sm leading-6 text-muted-foreground'>
                <span className='font-medium text-foreground/90'>
                  {nodeDetailCopy.connascence.nextStepLabel}
                </span>{' '}
                {item.nextStep}
              </p>
            </div>

            <div className='mt-4 flex flex-wrap gap-2 pt-1'>
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={onOpenDependents}
                disabled={!onOpenDependents}
              >
                {item.primaryActionLabel}
                <ArrowRight className='ml-1 h-4 w-4' />
              </Button>
              {onFocusDependents ? (
                <Button
                  type='button'
                  size='sm'
                  variant='ghost'
                  onClick={onFocusDependents}
                >
                  <Focus className='mr-1 h-4 w-4' />
                  {item.secondaryActionLabel}
                </Button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
