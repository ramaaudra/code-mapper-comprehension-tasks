import { Button } from '@/shared/components/ui/button'
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw
} from '@/shared/components/ui/icons'
import {
  ToggleGroup,
  ToggleGroupItem
} from '@/shared/components/ui/toggle-group'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'

interface TopBarProps {
  isLoading: boolean
  loadError: string | null
  hasData: boolean
  onRefresh: () => void
  layoutDirection: 'LR' | 'TB'
  onLayoutDirectionChange: (direction: 'LR' | 'TB') => void
  viewMode: 'overview' | 'graph' | 'architecture' | 'setup-guide'
  onShowOverview: () => void
  onShowGraph: () => void
  onShowArchitecture: () => void
  isTreeCollapsed: boolean
  onToggleTree: () => void
  onShowSetupGuide: () => void
  hasUnresolvedImports: boolean
  fileCount?: number
  analysisLoadedAt?: number | string | null
  hasChanges?: boolean
  totalChanges?: number
}

export function TopBar({
  isLoading,
  hasData,
  onRefresh,
  layoutDirection,
  onLayoutDirectionChange,
  viewMode,
  onShowOverview,
  onShowGraph,
  onShowArchitecture,
  isTreeCollapsed,
  onToggleTree,
  onShowSetupGuide,
  hasUnresolvedImports,
  fileCount,
  analysisLoadedAt,
  hasChanges = false,
  totalChanges = 0
}: TopBarProps) {
  return (
    <header className="h-14 bg-background border-b border-border px-4 flex items-center justify-between">
      {/* Left: Toggle Sidebar + Brand */}
      <div className="flex items-center gap-3">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleTree}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                {isTreeCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isTreeCollapsed ? 'Show sidebar' : 'Hide sidebar'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-foreground">
            Code Mapper
          </h1>
          {hasData && fileCount !== undefined && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
              {fileCount} files
            </span>
          )}
        </div>
      </div>

      {/* Center: Mode Switch (Overview | Graph | Architecture) */}
      {hasData && (
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value: string) => {
              if (value === 'overview') {
                onShowOverview()
              } else if (value === 'graph') {
                onShowGraph()
              } else if (value === 'architecture') {
                onShowArchitecture()
              } else if (value === 'setup-guide') {
                onShowSetupGuide()
              }
            }}
            size="sm"
          >
            <ToggleGroupItem value="overview" size="sm">
              Overview
            </ToggleGroupItem>
            <ToggleGroupItem value="graph" size="sm">
              Graph
            </ToggleGroupItem>
            <ToggleGroupItem value="architecture" size="sm">
              Architecture
            </ToggleGroupItem>
            <ToggleGroupItem value="setup-guide" size="sm">
              <span className="flex items-center gap-1.5">
                Setup
                {hasUnresolvedImports && (
                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                )}
              </span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {/* Right: Layout + Actions */}
      <div className="flex items-center gap-2">
        {hasData && (
          <>
            {/* Layout Direction Toggle */}
            <ToggleGroup
              type="single"
              value={layoutDirection}
              onValueChange={(value: string) => {
                if (value) {
                  onLayoutDirectionChange(value as 'LR' | 'TB')
                }
              }}
              size="sm"
            >
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value="LR" size="sm">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Left to Right layout
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value="TB" size="sm">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Top to Bottom layout
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </ToggleGroup>
          </>
        )}

        {/* Reload Button */}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw
                    className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                  />
                </Button>
                {hasChanges && totalChanges > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-medium rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                    {totalChanges > 9 ? '9+' : totalChanges}
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isLoading
                ? 'Loading...'
                : hasChanges
                  ? `${totalChanges} file${totalChanges !== 1 ? 's' : ''} changed - click to reload`
                  : 'Reload analysis'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Timestamp (subtle) */}
        {analysisLoadedAt && (
          <span className="text-xs text-muted-foreground hidden lg:inline">
            {new Date(analysisLoadedAt).toLocaleTimeString()}
          </span>
        )}
      </div>
    </header>
  )
}
