import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle
} from '@/shared/components/ui/icons'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { shellCopy } from '@/shared/content/shellCopy'

import { setupGuideCopy } from '../content/setupGuideCopy'
import { UnresolvedImportsList } from './UnresolvedImportsList'

import type { AnalysisWarnings } from '@/shared/types/analysis'

interface SetupGuidePageProps {
  warnings: AnalysisWarnings | undefined
  onBack: () => void
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs'>
      {children}
    </code>
  )
}

const TSCONFIG_EXAMPLE = `{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  }
}`

export function SetupGuidePage({ warnings, onBack }: SetupGuidePageProps) {
  const hasUnresolvedImports = (warnings?.unresolvedImports.length ?? 0) > 0
  const statusCopy = hasUnresolvedImports
    ? setupGuideCopy.status.warningsDetected
    : setupGuideCopy.status.analysisReady

  return (
    <ScrollArea className='h-full bg-background'>
      <div className='mx-auto max-w-3xl space-y-6 p-6'>
        <div className='space-y-3'>
          <Button
            variant='ghost'
            size='sm'
            onClick={onBack}
            className='gap-2 px-0'
          >
            <ArrowLeft className='h-4 w-4' />
            {shellCopy.utilities.back}
          </Button>

          <div className='space-y-2'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge variant='outline'>
                {setupGuideCopy.header.surfaceBadge}
              </Badge>
              <Badge
                variant='secondary'
                className={
                  hasUnresolvedImports
                    ? 'bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 dark:bg-amber-500/20 dark:text-amber-300'
                    : 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:bg-emerald-500/20 dark:text-emerald-300'
                }
              >
                {statusCopy.badge}
              </Badge>
            </div>
            <h1 className='text-2xl font-bold'>
              {setupGuideCopy.header.title}
            </h1>
            <p className='text-muted-foreground'>
              {setupGuideCopy.header.description}
            </p>
          </div>
        </div>

        <Card
          className={
            hasUnresolvedImports
              ? 'border-amber-500/40'
              : 'border-emerald-500/40'
          }
        >
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-base'>
              {hasUnresolvedImports ? (
                <AlertTriangle className='h-4 w-4 text-amber-500' />
              ) : (
                <CheckCircle className='h-4 w-4 text-emerald-500' />
              )}
              {statusCopy.title}
            </CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground'>
            <p>{statusCopy.description}</p>
          </CardContent>
        </Card>

        {warnings && (
          <UnresolvedImportsList
            imports={warnings.unresolvedImports}
            totalCount={warnings.totalUnresolvedCount}
          />
        )}

        {hasUnresolvedImports && (
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>
                {setupGuideCopy.instructions.title}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-3'>
                <h4 className='text-sm font-medium'>
                  {setupGuideCopy.instructions.steps.createConfig.title}
                </h4>
                <p className='text-sm text-muted-foreground'>
                  {setupGuideCopy.instructions.steps.createConfig.description}
                </p>
                <pre className='overflow-x-auto rounded-lg bg-muted p-4 text-xs'>
                  <code>{TSCONFIG_EXAMPLE}</code>
                </pre>
              </div>

              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>
                  {setupGuideCopy.instructions.steps.rerunAnalysis.title}
                </h4>
                <p className='text-sm text-muted-foreground'>
                  {setupGuideCopy.instructions.steps.rerunAnalysis.description}{' '}
                  <InlineCode>analyze .</InlineCode>
                </p>
              </div>

              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>
                  {setupGuideCopy.instructions.steps.viteProjects.title}
                </h4>
                <p className='text-sm text-muted-foreground'>
                  {setupGuideCopy.instructions.steps.viteProjects.description}
                </p>
              </div>

              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>
                  {setupGuideCopy.instructions.steps.troubleshooting.title}
                </h4>
                <ul className='list-inside list-disc space-y-1 text-sm text-muted-foreground'>
                  {setupGuideCopy.instructions.steps.troubleshooting.items.map(
                    (item) => (
                      <li key={item}>{item}</li>
                    )
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  )
}
