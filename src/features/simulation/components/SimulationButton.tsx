import { Button } from '@/shared/components/ui/button'
import { Trash2 } from '@/shared/components/ui/icons'

interface SimulationButtonProps {
  fileId: string
  onSimulate: (fileId: string) => void
  isSimulating: boolean
  disabled?: boolean
}

export function SimulationButton({
  fileId,
  onSimulate,
  isSimulating,
  disabled
}: SimulationButtonProps) {
  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={(e) => {
        e.stopPropagation()
        onSimulate(fileId)
      }}
      disabled={disabled || isSimulating}
      className='opacity-0 transition-opacity group-hover:opacity-100'
    >
      <Trash2 className='h-3.5 w-3.5' />
    </Button>
  )
}
