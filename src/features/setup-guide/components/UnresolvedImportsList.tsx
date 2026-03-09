import { Badge } from '@/shared/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'

import type { UnresolvedImport } from '@/shared/types/analysis'

interface UnresolvedImportsListProps {
  imports: UnresolvedImport[]
  totalCount: number
}

export function UnresolvedImportsList({
  imports,
  totalCount
}: UnresolvedImportsListProps) {
  if (imports.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-base'>
          Unresolved Imports
          <Badge variant='secondary'>{totalCount} total</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {imports.map((item) => (
            <div
              key={item.pattern}
              className='flex items-start justify-between rounded-lg bg-muted/50 p-3'
            >
              <div className='space-y-1'>
                <code className='font-mono text-sm text-foreground'>
                  {item.pattern}
                </code>
                <p className='text-xs text-muted-foreground'>
                  {item.count} imports from {item.files.length} files
                </p>
              </div>
              <Badge variant='outline' className='shrink-0'>
                {item.count}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
