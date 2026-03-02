import type { HighlightProps, PrismTheme } from 'prism-react-renderer'
import { useCallback, useEffect, useState } from 'react'

import { CheckCircle, Copy } from '@/shared/components/ui/icons'
import { ScrollArea } from '@/shared/components/ui/scroll-area'

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
  theme?: 'light' | 'dark' | 'auto'
  showLineNumbers?: boolean
  maxLines?: number
  className?: string
}

interface PrismModule {
  Highlight: React.ComponentType<HighlightProps>
  themes: {
    vsLight: PrismTheme
    vsDark: PrismTheme
  }
}

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

function getEffectiveTheme(
  theme: 'light' | 'dark' | 'auto',
  prismModule: PrismModule
): PrismTheme {
  if (theme === 'auto') {
    const isDark = document.documentElement.classList.contains('dark')
    return isDark ? prismModule.themes.vsDark : prismModule.themes.vsLight
  }

  return theme === 'dark'
    ? prismModule.themes.vsDark
    : prismModule.themes.vsLight
}

export function SourceCodeViewer({
  code,
  language,
  theme = 'auto',
  showLineNumbers = true,
  maxLines = 1000,
  className = ''
}: SourceCodeViewerProps) {
  const [prismModule, setPrismModule] = useState<PrismModule | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Lazy load prism-react-renderer
  useEffect(() => {
    let mounted = true

    const loadPrism = async () => {
      try {
        const mod = await import('prism-react-renderer')
        if (mounted) {
          setPrismModule(mod as unknown as PrismModule)
        }
      } catch (error) {
        console.error('Failed to load prism-react-renderer:', error)
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
      console.error('Failed to copy code:', error)
    }
  }, [code])

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
        <div className="flex items-center justify-center h-40 text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
            <span className="text-sm">Loading syntax highlighter...</span>
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
        <div className="flex-none flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50">
          <span className="text-xs text-muted-foreground">{language}</span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Copy code"
          >
            {copied ? (
              <CheckCircle
                className="h-3.5 w-3.5 text-green-500"
                weight="fill"
              />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        <ScrollArea className="flex-1 h-full">
          <pre className="p-4 font-mono text-xs leading-relaxed text-foreground/90">
            {displayCode}
          </pre>
        </ScrollArea>
        {hasMoreLines && (
          <div className="px-4 py-2 border-t border-border bg-yellow-500/10 text-xs text-yellow-600">
            Showing first {maxLines} of {lines.length.toLocaleString()} lines
          </div>
        )}
      </div>
    )
  }

  const effectiveTheme = getEffectiveTheme(theme, prismModule)
  const Highlight = prismModule.Highlight

  return (
    <div
      className={`relative flex flex-col rounded-md border border-border bg-muted/30 ${className}`}
    >
      {/* Header with language and copy button */}
      <div className="flex-none flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            {effectiveLanguage === 'text' ? language : effectiveLanguage}
          </span>
          {effectiveLanguage === 'text' && language !== 'text' && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              plain text
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <CheckCircle
                className="h-3.5 w-3.5 text-green-500"
                weight="fill"
              />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code with syntax highlighting */}
      <ScrollArea className="flex-1 h-full">
        <Highlight
          theme={effectiveTheme}
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
              className={`${highlightClassName} p-4 m-0 font-mono text-xs leading-relaxed`}
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
                    key={i}
                    {...restLineProps}
                    className="table-row"
                    style={{ display: 'table-row' }}
                  >
                    {showLineNumbers && (
                      <span
                        className="table-cell text-right pr-4 select-none text-muted-foreground/40"
                        style={{ minWidth: '2.5rem' }}
                      >
                        {i + 1}
                      </span>
                    )}
                    <span className="table-cell">
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
        <div className="flex-none px-4 py-2 border-t border-border bg-yellow-500/10 text-xs text-yellow-600 flex items-center gap-2">
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
