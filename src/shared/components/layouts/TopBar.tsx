import { Button } from '@/shared/components/ui/button'
import {
  ArrowDown,
  ArrowRight,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Search
} from '@/shared/components/ui/icons'
import { Input } from '@/shared/components/ui/input'
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
  query: string
  onQueryChange: (value: string) => void
  layoutDirection: 'LR' | 'TB'
  onLayoutDirectionChange: (direction: 'LR' | 'TB') => void
  viewMode: 'overview' | 'file'
  onShowOverview: () => void
  isTreeCollapsed: boolean
  onToggleTree: () => void
  // New props from StatsBar
  fileCount?: number
  analysisLoadedAt?: number | string | null
}

export function TopBar({
  isLoading,
  hasData,
  onRefresh,
  query,
  onQueryChange,
  layoutDirection,
  onLayoutDirectionChange,
  viewMode,
  onShowOverview,
  isTreeCollapsed,
  onToggleTree,
  fileCount,
  analysisLoadedAt
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

      {/* Center: Mode Switch (Dashboard | Graph) */}
      {hasData && (
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <ToggleGroup
            type="single"
            value={viewMode === 'overview' ? 'dashboard' : 'graph'}
            onValueChange={(value: string) => {
              if (value === 'dashboard') {
                onShowOverview()
              }
            }}
            size="sm"
          >
            <ToggleGroupItem value="dashboard" size="sm">
              Dashboard
            </ToggleGroupItem>
            <ToggleGroupItem value="graph" size="sm">
              Graph
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {/* Right: Search + Layout + Actions */}
      <div className="flex items-center gap-2">
        {hasData && (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search..."
                className="pl-8 h-8 w-40 text-sm"
              />
            </div>

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
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isLoading ? 'Loading...' : 'Reload analysis'}
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
