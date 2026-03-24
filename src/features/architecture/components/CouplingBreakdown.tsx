import { ArrowLeft, ArrowRight } from '@/shared/components/ui/icons'

import { architectureCopy } from '../content/architectureCopy'

interface CouplingBreakdownProps {
  couplingTo: Record<string, number>
  couplingFrom: Record<string, number>
}

export function CouplingBreakdown({
  couplingTo,
  couplingFrom
}: CouplingBreakdownProps) {
  const toEntries = Object.entries(couplingTo)
  const fromEntries = Object.entries(couplingFrom)

  return (
    <div className='grid grid-cols-1 gap-4 text-xs sm:grid-cols-2'>
      {/* Efferent: this folder imports from... */}
      <div className='min-w-0'>
        <h4 className='mb-2 flex items-center gap-1 text-muted-foreground'>
          <ArrowRight size={12} />
          {architectureCopy.couplingBreakdown.importsFromOtherModules}
        </h4>
        {toEntries.length > 0 ? (
          <ul className='space-y-1'>
            {toEntries.map(([folder, count]) => (
              <li
                key={folder}
                className='flex items-start justify-between gap-3'
              >
                <span
                  className='min-w-0 flex-1 break-all font-mono'
                  title={folder}
                >
                  {folder}
                </span>
                <span className='font-data text-muted-foreground'>{count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className='italic text-muted-foreground'>
            {architectureCopy.couplingBreakdown.noOutgoing}
          </p>
        )}
      </div>

      {/* Afferent: this folder is imported by... */}
      <div className='min-w-0'>
        <h4 className='mb-2 flex items-center gap-1 text-muted-foreground'>
          <ArrowLeft size={12} />
          {architectureCopy.couplingBreakdown.usedByOtherModules}
        </h4>
        {fromEntries.length > 0 ? (
          <ul className='space-y-1'>
            {fromEntries.map(([folder, count]) => (
              <li
                key={folder}
                className='flex items-start justify-between gap-3'
              >
                <span
                  className='min-w-0 flex-1 break-all font-mono'
                  title={folder}
                >
                  {folder}
                </span>
                <span className='font-data text-muted-foreground'>{count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className='italic text-muted-foreground'>
            {architectureCopy.couplingBreakdown.noIncoming}
          </p>
        )}
      </div>
    </div>
  )
}
