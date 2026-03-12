import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { FileText, Focus, Map, Network } from '@/shared/components/ui/icons'

import type { MetricsGuideScreenHelp } from '../content/metricsGuideContent'

interface ScreenUsageGuideProps {
  screens: MetricsGuideScreenHelp[]
}

const screenIcons = {
  overview: FileText,
  graph: Network,
  'node-detail': Focus,
  architecture: Map
} as const

export function ScreenUsageGuide({ screens }: ScreenUsageGuideProps) {
  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      {screens.map((screen) => {
        const Icon =
          screenIcons[screen.id as keyof typeof screenIcons] ?? FileText

        return (
          <Card key={screen.id} className='border-border/70 bg-card/50'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Icon className='h-4 w-4 text-primary' />
                {screen.title}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <p className='text-sm text-muted-foreground'>{screen.summary}</p>
              <ul className='space-y-2 text-sm text-foreground'>
                {screen.bullets.map((bullet) => (
                  <li key={bullet} className='flex gap-2'>
                    <span className='mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary' />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
