import { Button } from '@/shared/components/ui/button'
import { DetailPanelSectionHeading } from '@/shared/components/ui/detail-panel-section-heading'
import { ArrowLeft, ArrowRight, Focus } from '@/shared/components/ui/icons'

import { nodeDetailCopy } from '../content/nodeDetailCopy'

interface NodeDetailGraphToolsSectionProps {
  focusDirection: 'inward' | 'outward'
  resolvedNodeId: string
  onFocusSubgraph: (nodeId: string, direction: 'inward' | 'outward') => void
  onFocusDirectionChange: (direction: 'inward' | 'outward') => void
}

export function NodeDetailGraphToolsSection({
  focusDirection,
  resolvedNodeId,
  onFocusSubgraph,
  onFocusDirectionChange
}: NodeDetailGraphToolsSectionProps) {
  return (
    <div className='space-y-4 border-t border-border/40 pb-2 pt-6'>
      <DetailPanelSectionHeading
        title={nodeDetailCopy.graphTools.title}
        level='section'
      />
      <div className='space-y-3'>
        <div className='flex w-full gap-2'>
          <Button
            variant={focusDirection === 'inward' ? 'secondary' : 'outline'}
            size='sm'
            onClick={() => onFocusDirectionChange('inward')}
            className='flex-1 justify-center'
          >
            <ArrowLeft className='mr-2 h-3 w-3' />
            {nodeDetailCopy.graphTools.inward}
          </Button>
          <Button
            variant={focusDirection === 'outward' ? 'secondary' : 'outline'}
            size='sm'
            onClick={() => onFocusDirectionChange('outward')}
            className='flex-1 justify-center'
          >
            {nodeDetailCopy.graphTools.outward}
            <ArrowRight className='ml-2 h-3 w-3' />
          </Button>
        </div>
        <Button
          variant='default'
          size='sm'
          onClick={() => onFocusSubgraph(resolvedNodeId, focusDirection)}
          className='w-full'
        >
          <Focus className='mr-2 h-3.5 w-3.5' />
          {nodeDetailCopy.graphTools.focusPrefix}{' '}
          {focusDirection === 'inward'
            ? nodeDetailCopy.graphTools.focusDependencies
            : nodeDetailCopy.graphTools.focusDependents}{' '}
          {nodeDetailCopy.graphTools.focusSuffix}
        </Button>
      </div>
    </div>
  )
}
