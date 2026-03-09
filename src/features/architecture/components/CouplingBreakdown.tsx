import { ArrowLeft, ArrowRight } from '@/shared/components/ui/icons'

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
    <div className='grid grid-cols-2 gap-4 text-xs'>
      {/* Efferent: this folder imports from... */}
      <div>
        <h4 className='mb-2 flex items-center gap-1 text-muted-foreground'>
          <ArrowRight size={12} />
          Depends on Other Modules (Ce)
        </h4>
        {toEntries.length > 0 ? (
          <ul className='space-y-1'>
            {toEntries.map(([folder, count]) => (
              <li key={folder} className='flex justify-between'>
                <span
                  className='max-w-[140px] truncate font-mono'
                  title={folder}
                >
                  {folder}
                </span>
                <span className='text-muted-foreground'>{count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className='italic text-muted-foreground'>
            No outgoing cross-module dependencies
          </p>
        )}
      </div>

      {/* Afferent: this folder is imported by... */}
      <div>
        <h4 className='mb-2 flex items-center gap-1 text-muted-foreground'>
          <ArrowLeft size={12} />
          Used by Other Modules (Ca)
        </h4>
        {fromEntries.length > 0 ? (
          <ul className='space-y-1'>
            {fromEntries.map(([folder, count]) => (
              <li key={folder} className='flex justify-between'>
                <span
                  className='max-w-[140px] truncate font-mono'
                  title={folder}
                >
                  {folder}
                </span>
                <span className='text-muted-foreground'>{count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className='italic text-muted-foreground'>
            No incoming cross-module dependents
          </p>
        )}
      </div>
    </div>
  )
}
