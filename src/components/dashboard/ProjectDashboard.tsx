import { IssuesPanel } from './IssuesPanel';
import MetricsPanel from './MetricsPanel';
import { DependencyGraph } from '@/components/graph/DependencyGraph';
import { FileText, Network, TrendingUp, ShieldAlert } from '@/components/ui/icons';
import type { AnalysisData } from '@/types/analysis';
import type { DependencyEdgeData, DependencyNodeData } from '@/components/graph/DependencyGraph';
import type { Edge, Node } from '@xyflow/react';

interface ProjectDashboardProps {
  analysisData: AnalysisData | null;
  dependencyGraph: {
    nodes: Node<DependencyNodeData>[];
    edges: Edge<DependencyEdgeData>[];
    focusNodeId: string | null;
  };
  hoveredFile: string | null;
  layoutDirection: 'LR' | 'TB';
  viewMode: 'overview' | 'file';
  onNavigateToFile: (fileId: string) => void;
}

export function ProjectDashboard({
  analysisData,
  dependencyGraph,
  hoveredFile,
  layoutDirection,
  viewMode,
  onNavigateToFile,
}: ProjectDashboardProps) {
  if (viewMode === 'overview') {
    const snapshot = {
      totalFiles: analysisData?.detailedMetrics?.totalFiles ?? analysisData?.metrics?.fileCount ?? 0,
      totalDependencies: analysisData?.detailedMetrics?.totalDependencies ?? analysisData?.metrics?.edgeCount ?? 0,
      averageDependenciesPerFile: analysisData?.detailedMetrics?.averageDependenciesPerFile ?? analysisData?.metrics?.avgDegree ?? 0,
      highImpactCount: analysisData?.detailedMetrics?.codebaseHealth?.highImpactCount ?? analysisData?.issues?.highImpact?.length ?? 0,
    };

    const overviewCards = [
      {
        label: 'Total Files',
        value: snapshot.totalFiles.toLocaleString(),
        icon: <FileText className="h-4 w-4" />,
      },
      {
        label: 'Dependencies',
        value: snapshot.totalDependencies.toLocaleString(),
        icon: <Network className="h-4 w-4" />,
      },
      {
        label: 'Avg. Dependencies / File',
        value: typeof snapshot.averageDependenciesPerFile === 'number'
          ? `${snapshot.averageDependenciesPerFile}`
          : snapshot.averageDependenciesPerFile,
        icon: <TrendingUp className="h-4 w-4" />,
      },
      {
        label: 'High Impact Files',
        value: snapshot.highImpactCount.toLocaleString(),
        icon: <ShieldAlert className="h-4 w-4" />,
      },
    ];

    return (
      <div className="h-full overflow-y-auto overflow-x-hidden bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-6 pb-12 space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Project Overview</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ringkasan analisis dependensi dan prioritas perbaikan untuk proyek Anda.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {overviewCards.map(({ label, value, icon }) => (
              <div
                key={label}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{label}</span>
                  {icon}
                </div>
                <div className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6 min-w-0">
              <MetricsPanel data={analysisData} onSelectFile={onNavigateToFile} />
            </div>
            <div className="space-y-6 min-w-0">
              <IssuesPanel data={analysisData} onNavigateToFile={onNavigateToFile} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-slate-900">
      <DependencyGraph
        nodes={dependencyGraph.nodes}
        edges={dependencyGraph.edges}
        focusNodeId={dependencyGraph.focusNodeId}
        hoveredFile={hoveredFile}
        layoutDirection={layoutDirection}
        onNodeClick={onNavigateToFile}
      />
    </div>
  );
}
