import { memo, useMemo } from 'react'

import { useArchitectureFolders } from '@/features/architecture'
import {
  type DependencyEdgeData,
  DependencyGraph,
  type DependencyNodeData
} from '@/features/graph'
import { CaretRight, Lightbulb } from '@/shared/components/ui/icons'
import { createModuleReviewThresholdCalibration } from '@/shared/lib/metric-thresholds'
import {
  buildEvolutionaryHotspots,
  summarizeEvolutionAvailability
} from '@/shared/lib/utils'
import { calculateRiskScore, getRiskLevel } from '@/shared/lib/utils/risk'

import { dashboardCopy } from '../content/dashboardCopy'
import {
  buildCouplingDistribution,
  type CouplingBucketFile
} from '../lib/couplingBuckets'
import {
  buildOverviewReviewQueue,
  getOverviewSectionOrder
} from '../lib/overview-priority'
import { IssuesPanel } from './IssuesPanel'
import { PriorityReviewQueue } from './PriorityReviewQueue'
import { SupportingContextSection } from './SupportingContextSection'

import type { AnalysisData } from '@/shared/types/analysis'
import type { Edge, Node } from '@xyflow/react'

interface OverviewSectionHeaderProps {
  eyebrow: string
  title: string
  description: string
}

function OverviewSectionHeader({
  eyebrow,
  title,
  description
}: OverviewSectionHeaderProps) {
  return (
    <div className='space-y-1.5'>
      <p className='text-xs font-medium uppercase tracking-label text-muted-foreground/85'>
        {eyebrow}
      </p>
      <div className='space-y-1'>
        <h2 className='text-2xl font-bold text-foreground'>{title}</h2>
        <p className='max-w-3xl text-sm leading-relaxed text-muted-foreground/90'>
          {description}
        </p>
      </div>
    </div>
  )
}

interface ProjectDashboardProps {
  analysisData: AnalysisData | null
  dependencyGraph: {
    nodes: Node<DependencyNodeData>[]
    edges: Edge<DependencyEdgeData>[]
    focusNodeId: string | null
  }
  hoveredFile: string | null
  layoutDirection: 'LR' | 'TB'
  onLayoutDirectionChange?: (direction: 'LR' | 'TB') => void
  viewMode: 'overview' | 'architecture'
  selectedFileId: string | null
  onNavigateToFile: (fileId: string) => void
  onShowArchitecture?: () => void
  onShowMetricsGuide?: () => void
  onShowCycleTriage?: (cycleId?: string) => void
  onShowModuleGraph?: (modulePath: string) => void
  isLayoutTransitioning?: boolean
}

export const ProjectDashboard = memo(function ProjectDashboard({
  analysisData,
  dependencyGraph,
  hoveredFile,
  layoutDirection,
  onLayoutDirectionChange,
  viewMode,
  selectedFileId,
  onNavigateToFile,
  onShowArchitecture: _onShowArchitecture,
  onShowMetricsGuide,
  onShowCycleTriage,
  onShowModuleGraph,
  isLayoutTransitioning
}: ProjectDashboardProps) {
  const { data: architectureData } = useArchitectureFolders()
  const evolutionarySummary = analysisData?.evolutionaryMetrics.summary ?? null
  const moduleThresholdCalibration = useMemo(() => {
    if (!architectureData?.folders) {
      return undefined
    }

    return createModuleReviewThresholdCalibration({
      impactScopeValues: architectureData.folders.map((folder) => folder.ca),
      changePressureValues: architectureData.folders.map(
        (folder) => folder.evolution.churn30d.relativeChurn
      ),
      externalRelianceValues: architectureData.folders.map(
        (folder) => folder.ce
      ),
      propagationRiskValues: architectureData.folders.map((folder) =>
        calculateRiskScore(folder.ca, folder.instability)
      )
    })
  }, [architectureData?.folders])

  // Calculate health breakdown
  const healthBreakdown = useMemo(() => {
    if (!architectureData?.folders) {
      return { stabilityScore: 0, cycleCount: 0, orphanCount: 0 }
    }

    const folders = architectureData.folders
    const avgInstability =
      folders.reduce((sum, f) => sum + f.instability, 0) / folders.length
    const cycleCount = analysisData?.issues?.circularDependencies.length ?? 0

    return {
      stabilityScore: avgInstability,
      cycleCount,
      orphanCount: analysisData?.issues?.orphans?.length ?? 0
    }
  }, [architectureData, analysisData])

  // Calculate risk profiles for all folders using unified formula: RiskScore = Ca × I
  const allRiskProfiles = useMemo(() => {
    if (!architectureData?.folders) {
      return []
    }

    return architectureData.folders
      .map((f) => ({
        path: f.folderPath,
        instability: f.instability,
        fanIn: f.ca,
        riskScore: calculateRiskScore(f.ca, f.instability),
        hasCycle: f.hasCycle,
        level: getRiskLevel(
          calculateRiskScore(f.ca, f.instability),
          moduleThresholdCalibration
        )
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
  }, [architectureData, moduleThresholdCalibration])

  // Segmented risk lists for Actionable Insights (triage view)
  const criticalRisks = useMemo(() => {
    return allRiskProfiles.filter((r) => r.level === 'critical')
  }, [allRiskProfiles])

  const warningRisks = useMemo(() => {
    return allRiskProfiles.filter((r) => r.level === 'high')
  }, [allRiskProfiles])

  const hotspotAvailability = useMemo(() => {
    return summarizeEvolutionAvailability(evolutionarySummary)
  }, [evolutionarySummary])

  const evolutionaryHotspots = useMemo(() => {
    return architectureData?.folders
      ? buildEvolutionaryHotspots(architectureData.folders)
      : []
  }, [architectureData])

  const topHotspot = evolutionaryHotspots[0] ?? null
  const reviewQueue = useMemo(() => {
    return buildOverviewReviewQueue({
      cycleCount: healthBreakdown.cycleCount,
      orphanCount: healthBreakdown.orphanCount,
      criticalRisks,
      warningRisks,
      topHotspot
    })
  }, [
    criticalRisks,
    healthBreakdown.cycleCount,
    healthBreakdown.orphanCount,
    topHotspot,
    warningRisks
  ])

  // Calculate coupling distribution
  const couplingDistribution = useMemo(() => {
    if (!analysisData?.dependencyMap) {
      return {
        avgDependencies: 0,
        distribution: [],
        mostCoupledFile: undefined,
        godObjects: []
      }
    }

    const depCounts: CouplingBucketFile[] = Object.entries(
      analysisData.dependencyMap
    ).map(([path, deps]) => ({
      path,
      count: deps.length
    }))

    const sortedByCount = [...depCounts].sort((a, b) => b.count - a.count)

    const total = depCounts.length
    const avgDeps =
      depCounts.reduce((sum, d) => sum + d.count, 0) / Math.max(total, 1)
    const mostCoupled = sortedByCount[0]

    // Identify God Objects (files with >15 dependencies)
    const godObjects = depCounts
      .filter((d) => d.count > 15)
      .map((d) => ({
        path: d.path,
        dependencyCount: d.count
      }))

    return {
      avgDependencies: avgDeps,
      godObjects,
      distribution: buildCouplingDistribution(depCounts),
      mostCoupledFile: mostCoupled
    }
  }, [analysisData])

  if (viewMode === 'overview' && !selectedFileId) {
    const snapshot = {
      totalFiles:
        analysisData?.detailedMetrics?.totalFiles ??
        analysisData?.metrics?.fileCount ??
        0,
      totalDependencies:
        analysisData?.detailedMetrics?.totalDependencies ??
        analysisData?.metrics?.edgeCount ??
        0,
      averageDependenciesPerFile:
        analysisData?.detailedMetrics?.averageDependenciesPerFile ??
        analysisData?.metrics?.avgDegree ??
        0,
      averageRelativeChurn30d:
        analysisData?.evolutionaryMetrics.summary.averageRelativeChurn30d ?? 0
    }

    const overviewCards = [
      {
        label: 'Total Files',
        value: snapshot.totalFiles.toLocaleString(),
        subValue: 'Repository scale only'
      },
      {
        label: 'Dependencies',
        value: snapshot.totalDependencies.toLocaleString(),
        subValue: 'Structural breadth'
      },
      {
        label: 'Avg. Dependencies / File',
        value:
          typeof snapshot.averageDependenciesPerFile === 'number'
            ? snapshot.averageDependenciesPerFile.toFixed(2)
            : snapshot.averageDependenciesPerFile,
        subValue: 'Coupling density'
      },
      {
        label: 'Avg. Relative Churn (30d)',
        value: hotspotAvailability.isAvailable
          ? `${(snapshot.averageRelativeChurn30d * 100).toFixed(1)}%`
          : 'Unavailable',
        subValue: hotspotAvailability.isAvailable
          ? 'Recent change pressure'
          : 'Git history unavailable'
      }
    ]

    const overviewSectionOrder = getOverviewSectionOrder()

    return (
      <div className='h-full w-full overflow-y-auto overflow-x-hidden bg-background'>
        <div className='mx-auto max-w-full space-y-8 px-6 py-6 pb-12 md:px-8 lg:px-12'>
          <div className='space-y-2'>
            <h1 className='text-2xl font-semibold text-foreground'>
              {dashboardCopy.page.title}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {dashboardCopy.page.description}
            </p>
          </div>

          {overviewSectionOrder.map((sectionId) => {
            if (sectionId === 'start-here') {
              return (
                <section key={sectionId} className='space-y-4'>
                  <OverviewSectionHeader
                    eyebrow={dashboardCopy.sections.reviewFirst.eyebrow}
                    title={dashboardCopy.sections.reviewFirst.title}
                    description={dashboardCopy.sections.reviewFirst.description}
                  />
                  <PriorityReviewQueue
                    items={reviewQueue}
                    onViewModule={onShowModuleGraph}
                    onShowCycleTriage={onShowCycleTriage}
                  />
                </section>
              )
            }

            if (sectionId === 'current-issues') {
              return (
                <section key={sectionId} className='space-y-4'>
                  <OverviewSectionHeader
                    eyebrow={dashboardCopy.sections.currentIssues.eyebrow}
                    title={dashboardCopy.sections.currentIssues.title}
                    description={
                      dashboardCopy.sections.currentIssues.description
                    }
                  />
                  <IssuesPanel
                    data={analysisData}
                    onNavigateToFile={onNavigateToFile}
                    onShowCycleTriage={onShowCycleTriage}
                  />
                </section>
              )
            }

            if (sectionId === 'system-context') {
              return (
                <section key={sectionId} className='space-y-4'>
                  <OverviewSectionHeader
                    eyebrow={dashboardCopy.sections.systemContext.eyebrow}
                    title={dashboardCopy.sections.systemContext.title}
                    description={
                      dashboardCopy.sections.systemContext.description
                    }
                  />
                  <SupportingContextSection
                    breakdown={healthBreakdown}
                    riskMetrics={{
                      criticalCount: criticalRisks.length,
                      warningCount: warningRisks.length,
                      godObjectCount: couplingDistribution.godObjects.length
                    }}
                    couplingDistribution={couplingDistribution}
                    onNavigateToFile={onNavigateToFile}
                  />
                </section>
              )
            }

            return (
              <section key={sectionId} className='space-y-4'>
                <OverviewSectionHeader
                  eyebrow={dashboardCopy.sections.quickSnapshot.eyebrow}
                  title={dashboardCopy.sections.quickSnapshot.title}
                  description={dashboardCopy.sections.quickSnapshot.description}
                />
                <div className='rounded-2xl border border-border/70 bg-muted/15'>
                  <div className='border-b border-border/70 px-4 py-3'>
                    <p className='max-w-3xl text-sm leading-relaxed text-muted-foreground'>
                      {dashboardCopy.sections.quickSnapshot.helper}
                    </p>
                  </div>
                  <dl className='grid gap-px bg-border/70 sm:grid-cols-2 xl:grid-cols-4'>
                    {overviewCards.map(({ label, value, subValue }) => (
                      <div
                        key={label}
                        className='bg-background/95 px-4 py-4 first:rounded-t-none'
                      >
                        <dt className='text-xs font-medium uppercase tracking-label text-muted-foreground/85'>
                          {label}
                        </dt>
                        <dd className='mt-2 text-2xl font-semibold tracking-tight text-foreground'>
                          {value}
                        </dd>
                        <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>
                          {subValue}
                        </p>
                      </div>
                    ))}
                  </dl>
                </div>
              </section>
            )
          })}

          {/* Instability Teaser Card */}
          {onShowMetricsGuide && (
            <button
              onClick={onShowMetricsGuide}
              className='group relative w-full overflow-hidden rounded-xl border border-border/70 bg-muted/25 transition-colors duration-200 hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            >
              <div className='relative flex items-center gap-4 p-4'>
                <div className='flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-background/70 transition-transform duration-200 group-hover:translate-x-0.5'>
                  <Lightbulb className='h-5 w-5 text-foreground' />
                </div>
                <div className='min-w-0 flex-1 text-left'>
                  <h3 className='mb-0.5 text-base font-semibold text-foreground'>
                    {dashboardCopy.guideTeaser.title}
                  </h3>
                  <p className='max-w-3xl text-sm leading-relaxed text-muted-foreground'>
                    {dashboardCopy.guideTeaser.description}
                  </p>
                </div>
                <div className='flex flex-shrink-0 items-center gap-2'>
                  <span className='text-sm font-medium text-foreground'>
                    {dashboardCopy.guideTeaser.cta}
                  </span>
                  <div className='flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-background/70 transition-colors duration-200 group-hover:bg-background'>
                    <CaretRight className='h-4 w-4 text-foreground transition-transform duration-200 group-hover:translate-x-0.5' />
                  </div>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='h-full bg-background'>
      <DependencyGraph
        nodes={dependencyGraph.nodes}
        edges={dependencyGraph.edges}
        focusNodeId={dependencyGraph.focusNodeId}
        hoveredFile={hoveredFile}
        layoutDirection={layoutDirection}
        onLayoutDirectionChange={onLayoutDirectionChange}
        onNodeClick={onNavigateToFile}
        isLayoutTransitioning={isLayoutTransitioning}
      />
    </div>
  )
})
