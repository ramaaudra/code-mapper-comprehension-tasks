import { useQuery } from '@tanstack/react-query'

import type { FolderArchitectureMetrics } from '@/features/architecture/types/architecture'
import { Button } from '@/shared/components/ui/button'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  FileCode,
  Folder,
  X
} from '@/shared/components/ui/icons'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/shared/components/ui/tabs'
import { architectureApi } from '@/shared/lib/api'

interface ModuleSidePanelProps {
  modulePath: string
  onClose: () => void
  onViewFile: (filePath: string) => void
  moduleData?: FolderArchitectureMetrics
}

type RiskLevel = 'danger' | 'warning' | 'safe'

interface RiskConfig {
  level: RiskLevel
  borderClass: string
  bgClass: string
  textClass: string
  icon: typeof AlertTriangle
  label: string
  description: string
}

function getRiskLevel(instability: number): RiskLevel {
  if (instability >= 0.7) {
    return 'danger'
  }
  if (instability >= 0.4) {
    return 'warning'
  }
  return 'safe'
}

function getRiskConfig(instability: number): RiskConfig {
  const level = getRiskLevel(instability)
  switch (level) {
    case 'danger':
      return {
        level,
        borderClass: 'border-red-500',
        bgClass: 'bg-red-500/5',
        textClass: 'text-red-500',
        icon: AlertTriangle,
        label: 'High Risk',
        description:
          'Module is highly unstable. Many dependents rely on this module, making changes risky.'
      }
    case 'warning':
      return {
        level,
        borderClass: 'border-yellow-500',
        bgClass: 'bg-yellow-500/5',
        textClass: 'text-yellow-600',
        icon: AlertTriangle,
        label: 'Moderate Risk',
        description:
          'Module has moderate instability. Consider refactoring to reduce coupling.'
      }
    default:
      return {
        level,
        borderClass: 'border-green-500',
        bgClass: 'bg-green-500/5',
        textClass: 'text-green-600',
        icon: CheckCircle,
        label: 'Stable',
        description:
          'Module is stable with low coupling. Changes here have minimal impact on dependents.'
      }
  }
}

function ModuleHeader({
  modulePath,
  onClose
}: Pick<ModuleSidePanelProps, 'modulePath' | 'onClose'>) {
  const folderName = modulePath.split('/').pop() ?? modulePath

  return (
    <div className="flex items-start justify-between gap-3 p-4 border-b border-border">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
          <Folder className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold text-foreground truncate">
            {folderName}
          </h2>
          <p className="text-xs text-muted-foreground truncate">{modulePath}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        aria-label="Close panel"
        className="shrink-0 h-8 w-8"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface RiskCardProps {
  instability: number
}

function RiskCard({ instability }: RiskCardProps) {
  const config = getRiskConfig(instability)
  const RiskIcon = config.icon

  return (
    <div
      className={`rounded-lg border p-4 ${config.borderClass} ${config.bgClass}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <RiskIcon className={`h-4 w-4 ${config.textClass}`} />
        <span className={`text-sm font-semibold ${config.textClass}`}>
          {config.label}
        </span>
        <span className={`ml-auto text-xs font-mono ${config.textClass}`}>
          I: {instability.toFixed(2)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {config.description}
      </p>
    </div>
  )
}

interface MetricCardProps {
  value: number | string
  label: string
}

function MetricCard({ value, label }: MetricCardProps) {
  return (
    <div className="p-3 rounded-lg bg-muted">
      <div className="text-2xl font-semibold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

interface OverviewTabProps {
  moduleData: FolderArchitectureMetrics
}

function OverviewTab({ moduleData }: OverviewTabProps) {
  return (
    <div className="space-y-4 p-4">
      <RiskCard instability={moduleData.instability} />
      <div className="grid grid-cols-2 gap-3">
        <MetricCard value={moduleData.fileCount} label="Files" />
        <MetricCard value={moduleData.ca} label="Ca (Incoming)" />
        <MetricCard value={moduleData.ce} label="Ce (Outgoing)" />
        <MetricCard
          value={moduleData.instability.toFixed(2)}
          label="Instability"
        />
      </div>
    </div>
  )
}

interface FilesTabProps {
  modulePath: string
  onViewFile: (filePath: string) => void
}

function FilesTab({ modulePath, onViewFile }: FilesTabProps) {
  const { data: folderDetail, isLoading } = useQuery({
    queryKey: ['folder-detail', modulePath],
    queryFn: () => architectureApi.getFolderDetail(modulePath),
    enabled: !!modulePath
  })

  const sortedFiles = [...(folderDetail?.files ?? [])].sort((a, b) => {
    const riskA = a.ca * a.instability
    const riskB = b.ca * b.instability
    return riskB - riskA
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        Loading...
      </div>
    )
  }

  if (sortedFiles.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        No files found
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {sortedFiles.map((file, index) => (
          <div
            key={file.filePath}
            className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-muted-foreground w-5 shrink-0">
                {index + 1}
              </span>
              <FileCode className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground truncate flex-1">
                {file.filePath.split('/').pop()}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pl-7">
              <span className="text-xs text-muted-foreground">
                I: {file.instability.toFixed(2)}, Ca: {file.ca}
              </span>
              <button
                onClick={() => onViewFile(file.filePath)}
                className="flex items-center gap-1 text-xs text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
              >
                View
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

interface ConnectionRowProps {
  moduleName: string
  count: number
}

function ConnectionRow({ moduleName, count }: ConnectionRowProps) {
  const name = moduleName.split('/').pop() ?? moduleName
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors">
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground truncate">
          {name}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {moduleName}
        </div>
      </div>
      <span className="text-xs font-mono text-muted-foreground shrink-0 ml-2">
        {count}
      </span>
    </div>
  )
}

interface ConnectionsTabProps {
  moduleData: FolderArchitectureMetrics
}

function ConnectionsTab({ moduleData }: ConnectionsTabProps) {
  const incoming = Object.entries(moduleData.couplingFrom)
  const outgoing = Object.entries(moduleData.couplingTo)

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <section>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Incoming ({incoming.length})
          </h3>
          {incoming.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No incoming dependencies
            </p>
          ) : (
            <div className="space-y-1">
              {incoming.map(([path, count]) => (
                <ConnectionRow key={path} moduleName={path} count={count} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Outgoing ({outgoing.length})
          </h3>
          {outgoing.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No outgoing dependencies
            </p>
          ) : (
            <div className="space-y-1">
              {outgoing.map(([path, count]) => (
                <ConnectionRow key={path} moduleName={path} count={count} />
              ))}
            </div>
          )}
        </section>
      </div>
    </ScrollArea>
  )
}

export function ModuleSidePanel({
  modulePath,
  onClose,
  onViewFile,
  moduleData
}: ModuleSidePanelProps) {
  return (
    <div className="h-full w-full bg-background flex flex-col">
      <ModuleHeader modulePath={modulePath} onClose={onClose} />

      <Tabs defaultValue="overview" className="flex flex-col flex-1 min-h-0">
        <div className="px-4 pt-2 overflow-x-auto">
          <TabsList className="w-full justify-start h-9 bg-transparent p-0 border-b rounded-none">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2 pt-1.5"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2 pt-1.5"
            >
              Files
            </TabsTrigger>
            <TabsTrigger
              value="connections"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2 pt-1.5"
            >
              Connections
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="overview"
          className="flex-1 min-h-0 overflow-y-auto mt-0"
        >
          {moduleData ? (
            <OverviewTab moduleData={moduleData} />
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              No data available
            </div>
          )}
        </TabsContent>

        <TabsContent value="files" className="flex-1 min-h-0 mt-0">
          <FilesTab modulePath={modulePath} onViewFile={onViewFile} />
        </TabsContent>

        <TabsContent value="connections" className="flex-1 min-h-0 mt-0">
          {moduleData ? (
            <ConnectionsTab moduleData={moduleData} />
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              No connection data available
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
