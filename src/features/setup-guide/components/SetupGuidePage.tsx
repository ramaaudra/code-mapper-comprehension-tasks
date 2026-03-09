import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { ArrowLeft } from '@/shared/components/ui/icons'
import { ScrollArea } from '@/shared/components/ui/scroll-area'

import { UnresolvedImportsList } from './UnresolvedImportsList'

import type { AnalysisWarnings } from '@/shared/types/analysis'

interface SetupGuidePageProps {
  warnings: AnalysisWarnings | undefined
  onBack: () => void
}

// Reusable inline code component to avoid repetition
function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs'>
      {children}
    </code>
  )
}

// Static content defined outside component to avoid re-creation on render
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
  const hasUnresolvedImports = warnings && warnings.unresolvedImports.length > 0

  return (
    <ScrollArea className='h-full bg-background'>
      <div className='mx-auto max-w-3xl space-y-6 p-6'>
        {/* Header */}
        <div className='space-y-2'>
          <button
            onClick={onBack}
            className='inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
          >
            <ArrowLeft className='h-4 w-4' />
            Back to Overview
          </button>
          <h1 className='text-2xl font-bold'>Setup Guide</h1>
          <p className='text-muted-foreground'>
            Configure path aliases for accurate analysis results.
          </p>
        </div>

        {/* Status Card */}
        <Card
          className={
            hasUnresolvedImports
              ? 'border-yellow-500/50'
              : 'border-green-500/50'
          }
        >
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-base'>
              {hasUnresolvedImports ? (
                <>
                  <span className='h-2 w-2 rounded-full bg-yellow-500' />
                  Unresolved Imports Detected
                </>
              ) : (
                <>
                  <span className='h-2 w-2 rounded-full bg-green-500' />
                  Configuration Correct
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground'>
            {hasUnresolvedImports ? (
              <p>
                Some imports with aliases like{' '}
                <code className='text-foreground'>@/components</code> could not
                be resolved. This usually happens because the path mapping
                configuration is incomplete or the referenced file does not
                exist.
              </p>
            ) : (
              <p>
                Path mappings detected successfully. All imports should be
                resolved correctly.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Unresolved Imports List */}
        {warnings && (
          <UnresolvedImportsList
            imports={warnings.unresolvedImports}
            totalCount={warnings.totalUnresolvedCount}
          />
        )}

        {/* Instructions */}
        {hasUnresolvedImports && (
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>How to Fix</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-3'>
                <h4 className='text-sm font-medium'>
                  1. Create or edit configuration file
                </h4>
                <p className='text-sm text-muted-foreground'>
                  Make sure one of the following files exists in your project
                  root with the correct path mappings (priority:
                  tsconfig.app.json {'>'} tsconfig.json {'>'} jsconfig.json):
                </p>
                <pre className='overflow-x-auto rounded-lg bg-muted p-4 text-xs'>
                  <code>{TSCONFIG_EXAMPLE}</code>
                </pre>
              </div>

              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>2. Re-run analysis</h4>
                <p className='text-sm text-muted-foreground'>
                  After adding path mappings, re-run the{' '}
                  <InlineCode>analyze .</InlineCode> command or click the
                  refresh button in the UI.
                </p>
              </div>

              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>3. For Vite projects</h4>
                <p className='text-sm text-muted-foreground'>
                  Make sure path mappings are in{' '}
                  <InlineCode>tsconfig.json</InlineCode> or{' '}
                  <InlineCode>tsconfig.app.json</InlineCode>, not just in{' '}
                  <InlineCode>vite.config.ts</InlineCode>. Code Mapper reads
                  configuration from tsconfig/jsconfig files, not from Vite
                  config.
                </p>
              </div>

              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>4. Troubleshooting tips</h4>
                <ul className='list-inside list-disc space-y-1 text-sm text-muted-foreground'>
                  <li>
                    Ensure <code>baseUrl</code> is set relative to the tsconfig
                    file location
                  </li>
                  <li>Verify that the imported file actually exists</li>
                  <li>
                    For monorepos, run analysis from the subdirectories
                    (frontend/backend), not from the root
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  )
}
