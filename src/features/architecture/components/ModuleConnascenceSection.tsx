import { Button } from '@/shared/components/ui/button'
import { ArrowRight } from '@/shared/components/ui/icons'
import { InfoTooltip } from '@/shared/components/ui/info-tooltip'

import { architectureCopy } from '../content/architectureCopy'
import { buildModuleConnascenceItems } from '../lib/module-connascence-presentation'

import type { ConnascenceSignal } from '@/shared/types/analysis'

interface ModuleConnascenceSectionProps {
  signals: ConnascenceSignal[]
  onNavigateToFile?: (filePath: string) => void
}

export function ModuleConnascenceSection({
  signals,
  onNavigateToFile
}: ModuleConnascenceSectionProps) {
  const items = buildModuleConnascenceItems(signals)

  if (items.length === 0) {
    return null
  }

  return (
    <section className='space-y-3'>
      <div className='space-y-1'>
        <div className='flex items-center gap-2'>
          <h4 className='text-sm font-semibold text-foreground'>
            {architectureCopy.table.expanded.connascenceTitle}
          </h4>
          <InfoTooltip
            title={architectureCopy.table.expanded.connascenceTooltipTitle}
            triggerLabel={
              architectureCopy.table.expanded.connascenceTooltipTitle
            }
          >
            <p className='text-xs leading-relaxed text-popover-foreground'>
              {architectureCopy.table.expanded.connascenceTooltipDescription}
            </p>
          </InfoTooltip>
        </div>
        <p className='text-xs leading-relaxed text-muted-foreground'>
          {architectureCopy.table.expanded.connascenceDescription}
        </p>
      </div>

      <div className='space-y-3'>
        {items.map((item) => (
          <article
            key={item.signalKey}
            className='rounded-xl border border-border/60 bg-background/60 p-4'
          >
            <div className='space-y-1'>
              <h5 className='text-[15px] font-semibold tracking-tight text-foreground'>
                {item.headline}
              </h5>
              <p className='text-[11px] leading-5 text-muted-foreground/85'>
                {item.scopeLabel} {'\u2022'} {item.reviewTargetsLabel}
              </p>
            </div>

            <p className='mt-3 text-sm leading-6 text-foreground/90'>
              {item.impactSummary}
            </p>

            <div className='mt-4 space-y-2'>
              <p className='text-xs font-medium text-muted-foreground'>
                {architectureCopy.table.expanded.connascenceDeclarationLabel}
              </p>
              <Button
                type='button'
                size='sm'
                variant='outline'
                className='h-auto w-full justify-between px-3 py-2 text-left'
                onClick={() =>
                  onNavigateToFile?.(item.declarationFile.filePath)
                }
                disabled={!onNavigateToFile}
              >
                <span className='min-w-0'>
                  <span className='block font-mono text-sm font-medium text-foreground'>
                    {item.declarationFile.basename}
                  </span>
                  <span
                    className='mt-1 block truncate font-mono text-xs text-muted-foreground'
                    title={item.declarationFile.relativePath}
                  >
                    {item.declarationFile.displayPath}
                  </span>
                </span>
                <ArrowRight className='ml-2 h-4 w-4 shrink-0' />
              </Button>
            </div>

            <div className='mt-4 space-y-2'>
              <p className='text-xs font-medium text-muted-foreground'>
                {architectureCopy.table.expanded.connascenceReviewFilesLabel}
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
                  {architectureCopy.table.expanded.connascenceNextStepLabel}
                </span>{' '}
                {item.nextStep}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
