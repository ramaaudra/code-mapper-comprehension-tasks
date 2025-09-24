import { IssuesPanel } from './IssuesPanel';
import MetricsPanel from './MetricsPanel';
import { MermaidDiagram } from './MermaidDiagram';

interface ProjectDashboardProps {
  analysisData: any;
  mermaidChart: string;
  hoveredFile: string | null;
  viewMode: 'overview' | 'file';
}

export function ProjectDashboard({ analysisData, mermaidChart, hoveredFile, viewMode }: ProjectDashboardProps) {
  if (viewMode === 'overview') {
    return (
      <div className="h-full overflow-y-auto bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <MetricsPanel data={analysisData} />
            <IssuesPanel data={analysisData} />
          </div>
        </div>
      </div>
    );
  }

  const hasChart = Boolean(mermaidChart?.trim());

  return (
    <div className="h-full bg-white dark:bg-slate-900">
      {hasChart ? (
        <MermaidDiagram chart={mermaidChart} hoveredFile={hoveredFile} />
      ) : (
        <div className="h-full flex items-center justify-center p-12">
          <div className="text-center space-y-3">
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              Select a file to explore its dependencies
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Choose a file from the tree to visualize its relationships and inspect metrics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
