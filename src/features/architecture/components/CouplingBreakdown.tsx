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
    <div className="grid grid-cols-2 gap-4 text-xs">
      {/* Efferent: this folder imports from... */}
      <div>
        <h4 className="text-muted-foreground mb-2 flex items-center gap-1">
          <ArrowRight size={12} />
          Depends On (Ce)
        </h4>
        {toEntries.length > 0 ? (
          <ul className="space-y-1">
            {toEntries.map(([folder, count]) => (
              <li key={folder} className="flex justify-between">
                <span
                  className="font-mono truncate max-w-[140px]"
                  title={folder}
                >
                  {folder}
                </span>
                <span className="text-muted-foreground">{count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground italic">
            No external dependencies
          </p>
        )}
      </div>

      {/* Afferent: this folder is imported by... */}
      <div>
        <h4 className="text-muted-foreground mb-2 flex items-center gap-1">
          <ArrowLeft size={12} />
          Used By (Ca)
        </h4>
        {fromEntries.length > 0 ? (
          <ul className="space-y-1">
            {fromEntries.map(([folder, count]) => (
              <li key={folder} className="flex justify-between">
                <span
                  className="font-mono truncate max-w-[140px]"
                  title={folder}
                >
                  {folder}
                </span>
                <span className="text-muted-foreground">{count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground italic">No external dependents</p>
        )}
      </div>
    </div>
  )
}
