import { Button } from '@/shared/components/ui/button'
import {
  ArrowDown,
  ArrowRight,
  PanelLeftClose,
  PanelLeftOpen,
  Search
} from '@/shared/components/ui/icons'
import { Input } from '@/shared/components/ui/input'

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
}

export function TopBar({
  isLoading,
  loadError,
  hasData,
  onRefresh,
  query,
  onQueryChange,
  layoutDirection,
  onLayoutDirectionChange,
  viewMode,
  onShowOverview,
  isTreeCollapsed,
  onToggleTree
}: TopBarProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTree}
            className="text-slate-600 dark:text-slate-400"
          >
            {isTreeCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Code Mapper
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : loadError ? 'bg-red-500' : 'bg-emerald-500'}`}
            />
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              {isLoading && 'Loading...'}
              {!isLoading && loadError && 'Failed'}
              {!isLoading && !loadError && hasData && 'Ready'}
              {!isLoading && !loadError && !hasData && 'No data'}
            </div>
          </div>
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? 'Loading...' : 'Reload'}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {hasData && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search files..."
                className="pl-10 w-48"
              />
            </div>
          )}

          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-md p-1">
            <Button
              variant={layoutDirection === 'LR' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onLayoutDirectionChange('LR')}
              disabled={!hasData}
              className="px-3 py-1 text-xs"
            >
              <ArrowRight className="h-3 w-3 mr-1" />
              LR
            </Button>
            <Button
              variant={layoutDirection === 'TB' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onLayoutDirectionChange('TB')}
              disabled={!hasData}
              className="px-3 py-1 text-xs"
            >
              <ArrowDown className="h-3 w-3 mr-1" />
              TB
            </Button>
          </div>

          {hasData && (
            <Button
              variant={viewMode === 'overview' ? 'default' : 'outline'}
              size="sm"
              onClick={onShowOverview}
            >
              Project Overview
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
