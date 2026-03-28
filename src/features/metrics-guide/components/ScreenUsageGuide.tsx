import {
  FileText,
  Focus,
  Map,
  Network,
  ArrowRight
} from '@/shared/components/ui/icons'

import type { MetricsGuideScreenUsage } from '../content/metricsGuideContent'

interface ScreenUsageGuideProps {
  screens: MetricsGuideScreenUsage[]
}

const screenIcons = {
  overview: FileText,
  graph: Network,
  'node-detail': Focus,
  architecture: Map
} as const

export function ScreenUsageGuide({ screens }: ScreenUsageGuideProps) {
  return (
    <div className='space-y-6'>
      {screens.map((screen) => {
        const Icon =
          screenIcons[screen.id as keyof typeof screenIcons] ?? FileText

        return (
          <div
            key={screen.id}
            className='flex flex-col gap-4 border-b border-border/40 pb-6 last:border-0 last:pb-0 sm:flex-row sm:gap-6'
          >
            <div className='flex flex-1 items-start gap-4'>
              <div className='mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                <Icon className='h-4 w-4' />
              </div>
              <div className='space-y-1.5'>
                <p className='text-sm text-muted-foreground'>
                  If you want to know...
                </p>
                <p className='text-base font-medium text-foreground'>
                  {screen.ifYouWantToKnow}
                </p>
              </div>
            </div>

            <div className='hidden shrink-0 items-center text-muted-foreground/30 sm:flex'>
              <ArrowRight className='h-5 w-5' />
            </div>

            <div className='flex-1 space-y-1.5 pl-12 sm:pl-0'>
              <div className='text-sm text-muted-foreground'>
                Go to{' '}
                <strong className='rounded bg-muted/40 px-1 py-0.5 font-semibold text-foreground'>
                  {screen.goTo}
                </strong>
              </div>
              <p className='text-sm text-foreground/90'>
                You will get {screen.youWillGet}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
