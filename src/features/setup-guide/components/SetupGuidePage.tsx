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
  CheckCircle,
  FileWarning
} from '@/shared/components/ui/icons'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { shellCopy } from '@/shared/content/shellCopy'

import { setupGuideCopy } from '../content/setupGuideCopy'
import { UnresolvedImportsList } from './UnresolvedImportsList'

import type {
  AnalysisWarnings,
  UnsupportedFilesWarning
} from '@/shared/types/analysis'

interface SetupGuidePageProps {
  warnings: AnalysisWarnings | undefined
  onBack: () => void
}

interface StatusTone {
  badgeClassName: string
  cardClassName: string
  iconClassName: string
}

const WARNING_STATUS_TONE: StatusTone = {
  badgeClassName:
    'border-status-warning-border bg-status-warning-surface text-status-warning-foreground hover:bg-status-warning-surface',
  cardClassName: 'border-status-warning-border bg-status-warning-surface/20',
  iconClassName: 'text-status-warning-foreground'
}

const SUCCESS_STATUS_TONE: StatusTone = {
  badgeClassName:
    'border-status-success-border bg-status-success-surface text-status-success-foreground hover:bg-status-success-surface',
  cardClassName: 'border-status-success-border bg-status-success-surface/20',
  iconClassName: 'text-status-success-foreground'
}

const SCOPE_NOTICE_BADGE_CLASS =
  'border-status-warning-border bg-background/70 text-status-warning-foreground'

function InlineCode({
  children
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs'>
      {children}
    </code>
  )
}

function getStatusTone(hasSetupWarnings: boolean): StatusTone {
  return hasSetupWarnings ? WARNING_STATUS_TONE : SUCCESS_STATUS_TONE
}

function hasSkippedUnsupportedFiles(warnings?: AnalysisWarnings): boolean {
  return (warnings?.unsupportedFiles?.total ?? 0) > 0
}

function resolveStatusCopy({
  hasUnresolvedImports,
  hasUnsupportedFiles
}: {
  hasUnresolvedImports: boolean
  hasUnsupportedFiles: boolean
}): (typeof setupGuideCopy.status)[keyof typeof setupGuideCopy.status] {
  if (hasUnresolvedImports) {
    return setupGuideCopy.status.warningsDetected
  }

  if (hasUnsupportedFiles) {
    return setupGuideCopy.status.scopeNotice
  }

  return setupGuideCopy.status.analysisReady
}

function UnsupportedFilesNotice({
  unsupportedFiles
}: {
  unsupportedFiles: UnsupportedFilesWarning | undefined
}): React.JSX.Element | null {
  if (!unsupportedFiles || unsupportedFiles.total === 0) {
    return null
  }

  return (
    <Card className='border-status-warning-border bg-status-warning-surface/15'>
      <CardHeader className='pb-3'>
        <CardTitle className='flex flex-wrap items-center gap-2 text-base'>
          <FileWarning className='h-4 w-4 text-status-warning-foreground' />
          {setupGuideCopy.unsupportedFiles.title}
          <Badge variant='outline' className={SCOPE_NOTICE_BADGE_CLASS}>
            {unsupportedFiles.total}{' '}
            {setupGuideCopy.unsupportedFiles.totalSuffix}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4 text-sm text-muted-foreground'>
        <div className='space-y-1'>
          <p>{unsupportedFiles.message}</p>
          <p>{unsupportedFiles.suggestion}</p>
        </div>

        <div className='flex flex-wrap gap-2'>
          {Object.entries(unsupportedFiles.byExtension).map(
            ([extension, count]) => (
              <Badge
                key={extension}
                variant='outline'
                className={SCOPE_NOTICE_BADGE_CLASS}
              >
                {extension}:{' '}
                {setupGuideCopy.unsupportedFiles.extensionSummary(count)}
              </Badge>
            )
          )}
        </div>

        {unsupportedFiles.examples.length > 0 && (
          <div className='space-y-2'>
            <p className='text-xs font-medium uppercase text-muted-foreground'>
              {setupGuideCopy.unsupportedFiles.examplesLabel}
            </p>
            <div className='flex flex-wrap gap-2'>
              {unsupportedFiles.examples.map((example) => (
                <InlineCode key={example}>{example}</InlineCode>
              ))}
            </div>
          </div>
        )}

        <p className='text-xs'>
          {setupGuideCopy.unsupportedFiles.supportedLabel}:{' '}
          {unsupportedFiles.supportedExtensions.join(', ')}
        </p>
      </CardContent>
    </Card>
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

export function SetupGuidePage({
  warnings,
  onBack
}: SetupGuidePageProps): React.JSX.Element {
  const hasUnresolvedImports = (warnings?.unresolvedImports.length ?? 0) > 0
  const hasUnsupportedFiles = hasSkippedUnsupportedFiles(warnings)
  const hasSetupWarnings = hasUnresolvedImports || hasUnsupportedFiles
  const StatusIcon = hasSetupWarnings ? AlertTriangle : CheckCircle
  const statusCopy = resolveStatusCopy({
    hasUnresolvedImports,
    hasUnsupportedFiles
  })
  const statusTone = getStatusTone(hasSetupWarnings)
  const unsupportedFiles = warnings?.unsupportedFiles

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
              <Badge variant='outline' className={statusTone.badgeClassName}>
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

        <Card className={statusTone.cardClassName}>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <StatusIcon className={`h-4 w-4 ${statusTone.iconClassName}`} />
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

        <UnsupportedFilesNotice unsupportedFiles={unsupportedFiles} />

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
