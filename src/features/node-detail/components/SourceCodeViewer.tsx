import { useCallback, useEffect, useState } from 'react'

import { CheckCircle, Copy } from '@/shared/components/ui/icons'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { StatusAnnouncer } from '@/shared/components/ui/StatusAnnouncer'
import { createUiLogger } from '@/shared/lib/logger/uiLogger'

import type { HighlightProps, PrismTheme } from 'prism-react-renderer'

// Supported languages - only load what's necessary
const SUPPORTED_LANGUAGES = [
  'typescript',
  'tsx',
  'javascript',
  'jsx',
  'json',
  'css'
] as const

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

interface SourceCodeViewerProps {
  code: string
  language: string
  showLineNumbers?: boolean
  maxLines?: number
  className?: string
}

interface PrismModule {
  Highlight: React.ComponentType<HighlightProps>
  themes: {
    vsDark: PrismTheme
  }
}

const sourceCodeViewerLogger = createUiLogger('SourceCodeViewer')

function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)
}

function normalizeLanguage(language: string): string {
  const normalized = language.toLowerCase()

  // Map common extensions/aliases
  const languageMap: Record<string, string> = {
    ts: 'typescript',
    js: 'javascript',
    tsx: 'tsx',
    jsx: 'jsx'
  }

  return languageMap[normalized] || normalized
}

export function SourceCodeViewer({
  code,
  language,
  showLineNumbers = true,
  maxLines = 1000,
  className = ''
}: SourceCodeViewerProps) {
  const [prismModule, setPrismModule] = useState<PrismModule | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [prismLoadError, setPrismLoadError] = useState<string | null>(null)

  // Lazy load prism-react-renderer
  useEffect(() => {
    let mounted = true

    const loadPrism = async () => {
      try {
        const mod = await import('prism-react-renderer')
        if (mounted) {
          setPrismModule(mod as unknown as PrismModule)
          setPrismLoadError(null)
        }
      } catch (error) {
        sourceCodeViewerLogger.error(
          'Failed to load prism-react-renderer',
          error,
          {
            event: 'syntax_highlighter_load_failed',
            operation: 'load_syntax_highlighter'
          }
        )
        if (mounted) {
          setPrismLoadError(
            'Syntax highlighting is unavailable. Showing plain text instead.'
          )
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadPrism()

    return () => {
      mounted = false
    }
  }, [])

  // Handle copy functionality
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      sourceCodeViewerLogger.error('Failed to copy code', error, {
        event: 'copy_source_code_failed',
        language
      })
    }
  }, [code, language])

  // Normalize and validate language
  const normalizedLanguage = normalizeLanguage(language)
  const effectiveLanguage = isSupportedLanguage(normalizedLanguage)
    ? normalizedLanguage
    : 'text'

  // Truncate code if needed
  const lines = code.split('\n')
  const hasMoreLines = lines.length > maxLines
  const displayCode = hasMoreLines ? lines.slice(0, maxLines).join('\n') : code

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`relative flex flex-col rounded-md border border-border bg-muted/30 ${className}`}
      >
        <StatusAnnouncer message='Loading syntax highlighter.' />
        <div className='flex h-40 items-center justify-center text-muted-foreground'>
          <div className='flex items-center gap-2'>
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
            <span className='text-sm'>Loading syntax highlighter...</span>
          </div>
        </div>
      </div>
    )
  }

  // Fallback: plain text display if Prism failed to load or language not supported
  if (!prismModule) {
    return (
      <div
        className={`relative flex flex-col rounded-md border border-border bg-muted/30 ${className}`}
      >
        <StatusAnnouncer
          message={copied ? 'Code copied to clipboard.' : prismLoadError}
          politeness={prismLoadError ? 'assertive' : 'polite'}
        />
        <div className='flex flex-none items-center justify-between border-b border-border bg-muted/50 px-3 py-2'>
          <span className='text-xs text-muted-foreground'>{language}</span>
          <button
            onClick={handleCopy}
            type='button'
            className='rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
            title='Copy code'
            aria-label='Copy code'
          >
            {copied ? (
              <CheckCircle
                className='h-3.5 w-3.5 text-status-success-foreground'
                weight='fill'
              />
            ) : (
              <Copy className='h-3.5 w-3.5' />
            )}
          </button>
        </div>
        <ScrollArea className='h-full flex-1'>
          <pre className='p-4 font-mono text-xs leading-relaxed text-foreground/90'>
            {displayCode}
          </pre>
        </ScrollArea>
        {hasMoreLines && (
          <div className='border-t border-status-warning-border bg-status-warning-surface px-4 py-2 text-xs text-status-warning-foreground'>
            Showing first {maxLines} of {lines.length.toLocaleString()} lines
          </div>
        )}
      </div>
    )
  }

  const Highlight = prismModule.Highlight

  return (
    <div
      className={`relative flex flex-col rounded-md border border-border bg-muted/30 ${className}`}
    >
      <StatusAnnouncer message={copied ? 'Code copied to clipboard.' : null} />
      {/* Header with language and copy button */}
      <div className='flex flex-none items-center justify-between border-b border-border bg-muted/50 px-3 py-2'>
        <div className='flex items-center gap-2'>
          <span className='font-mono text-xs text-muted-foreground'>
            {effectiveLanguage === 'text' ? language : effectiveLanguage}
          </span>
          {effectiveLanguage === 'text' && language !== 'text' && (
            <span className='rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground'>
              plain text
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          type='button'
          className='flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
          title='Copy code'
        >
          {copied ? (
            <>
              <CheckCircle
                className='h-3.5 w-3.5 text-status-success-foreground'
                weight='fill'
              />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className='h-3.5 w-3.5' />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code with syntax highlighting */}
      <ScrollArea className='h-full flex-1'>
        <Highlight
          theme={prismModule.themes.vsDark}
          code={displayCode}
          language={effectiveLanguage}
        >
          {({
            className: highlightClassName,
            style,
            tokens,
            getLineProps,
            getTokenProps
          }) => (
            <pre
              className={`${highlightClassName} m-0 p-4 font-mono text-xs leading-relaxed`}
              style={{
                ...style,
                background: 'transparent',
                margin: 0,
                padding: 0
              }}
            >
              {tokens.map((line, i) => {
                const lineProps = getLineProps({ line })
                const { key: _lineKey, ...restLineProps } = lineProps
                return (
                  <div
                    key={String(_lineKey)}
                    {...restLineProps}
                    className='table-row'
                    style={{ display: 'table-row' }}
                  >
                    {showLineNumbers && (
                      <span
                        className='table-cell select-none pr-4 text-right text-muted-foreground/40'
                        style={{ minWidth: '2.5rem' }}
                      >
                        {i + 1}
                      </span>
                    )}
                    <span className='table-cell'>
                      {line.map((token, tokenKey) => {
                        const tokenProps = getTokenProps({ token })
                        const { key: _tokenKey, ...restTokenProps } = tokenProps
                        return <span key={tokenKey} {...restTokenProps} />
                      })}
                    </span>
                  </div>
                )
              })}
            </pre>
          )}
        </Highlight>
      </ScrollArea>

      {/* Warning for large files */}
      {hasMoreLines && (
        <div className='flex flex-none items-center gap-2 border-t border-status-warning-border bg-status-warning-surface px-4 py-2 text-xs text-status-warning-foreground'>
          <span>
            Large file detected. Showing first {maxLines} of{' '}
            {lines.length.toLocaleString()} lines.
          </span>
        </div>
      )}
    </div>
  )
}

export default SourceCodeViewer
