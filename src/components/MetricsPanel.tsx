import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart3, FileText, Network, Puzzle, ShieldCheck, AlertCircle, TrendingUp } from 'lucide-react';

// Helper function to get file basename
const getBasename = (filePath: string): string => {
  return filePath.split('/').pop() || filePath;
};

// Type definitions matching backend
interface CodeMetrics {
  totalFiles: number;
  totalDependencies: number;
  averageDependenciesPerFile: number;
  mostComplexFiles: { file: string; outdegree: number }[];
  mostCriticalFiles: { file: string; indegree: number }[];
  codebaseHealth: {
    orphanCount: number;
    highImpactCount: number;
    circularCount: number;
  };
}

interface MetricsPanelProps {
  data?: {
    detailedMetrics?: CodeMetrics;
    metrics?: {
      fileCount: number;
      edgeCount: number;
      avgDegree: number;
    };
  };
}

// Component untuk menampilkan metrik item dengan ikon
const MetricItem = ({ 
  icon, 
  label, 
  value, 
  tooltip 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number;
  tooltip?: string;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger className="w-full">
        <div className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2 text-muted-foreground">
            {icon}
            <span>{label}</span>
          </div>
          <span className="font-semibold text-foreground">{value}</span>
        </div>
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      )}
    </Tooltip>
  </TooltipProvider>
);

// Component untuk menampilkan item file dengan value
const FileListItem = ({ 
  file, 
  value, 
  label 
}: { 
  file: string; 
  value: number; 
  label: string;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger className="w-full">
        <div className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted/50 transition-colors border">
          <span className="font-mono text-left truncate flex-1 mr-2">
            {getBasename(file)}
          </span>
          <Badge variant="secondary" className="text-xs">
            {value} {label}
          </Badge>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{file}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Health indicator component
const HealthIndicator = ({ 
  value, 
  total, 
  label, 
  icon,
  colorClass = "text-green-500"
}: {
  value: number;
  total: number;
  label: string;
  icon: React.ReactNode;
  colorClass?: string;
}) => {
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
      <div className={`${colorClass}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-muted-foreground">{percentage}%</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {value} of {total} files
        </div>
      </div>
    </div>
  );
};

export default function MetricsPanel({ data }: MetricsPanelProps) {
  // Fallback to old metrics format if detailedMetrics not available
  const detailedMetrics = data?.detailedMetrics;
  const basicMetrics = data?.metrics;

  if (!detailedMetrics && !basicMetrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            Code Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No metrics data available</p>
            <p className="text-xs mt-1">Analyze a project to see statistics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If only basic metrics available, show simple version
  if (!detailedMetrics && basicMetrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Files</span>
            <span className="text-sm font-medium">{basicMetrics.fileCount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Dependencies</span>
            <span className="text-sm font-medium">{basicMetrics.edgeCount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Avg Degree</span>
            <span className="text-sm font-medium">{basicMetrics.avgDegree}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    totalFiles,
    totalDependencies,
    averageDependenciesPerFile,
    mostComplexFiles,
    mostCriticalFiles,
    codebaseHealth,
  } = detailedMetrics!;

  return (
    <div className="space-y-4">
      {/* Overview Metrics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5 text-primary" />
            Project Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <MetricItem 
            icon={<FileText size={16} />} 
            label="Total Files" 
            value={totalFiles.toLocaleString()}
            tooltip="Total number of analyzed files in the project"
          />
          <MetricItem 
            icon={<Network size={16} />} 
            label="Total Dependencies" 
            value={totalDependencies.toLocaleString()}
            tooltip="Total number of import/require statements across all files"
          />
          <MetricItem 
            icon={<TrendingUp size={16} />} 
            label="Avg. Complexity" 
            value={`${averageDependenciesPerFile}/file`}
            tooltip="Average number of dependencies per file"
          />
        </CardContent>
      </Card>

      {/* Codebase Health Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-green-500" />
            Codebase Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <HealthIndicator
            value={codebaseHealth.orphanCount}
            total={totalFiles}
            label="Orphaned Files"
            icon={<AlertCircle size={16} />}
            colorClass={codebaseHealth.orphanCount > 0 ? "text-yellow-500" : "text-green-500"}
          />
          <HealthIndicator
            value={codebaseHealth.circularCount}
            total={totalFiles}
            label="Circular Dependencies"
            icon={<AlertCircle size={16} />}
            colorClass={codebaseHealth.circularCount > 0 ? "text-red-500" : "text-green-500"}
          />
          <HealthIndicator
            value={codebaseHealth.highImpactCount}
            total={totalFiles}
            label="High Impact Files"
            icon={<AlertCircle size={16} />}
            colorClass="text-blue-500"
          />
        </CardContent>
      </Card>

      {/* Most Critical Files Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Most Critical Files</span>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Badge 
                  variant="default"
                  className="cursor-pointer hover:opacity-80"
                >
                  {mostCriticalFiles.length}
                </Badge>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-red-500" />
                    Most Critical Files ({mostCriticalFiles.length})
                  </DialogTitle>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto p-2">
                  {mostCriticalFiles.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No critical files identified</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {mostCriticalFiles.map((item, index) => (
                        <div key={index} className="border rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{getBasename(item.file)}</span>
                            <Badge variant="secondary">{item.indegree} imports</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono truncate">
                            {item.file}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mostCriticalFiles.slice(0, 3).map((item, index) => (
              <FileListItem 
                key={index}
                file={item.file} 
                value={item.indegree} 
                label="imports" 
              />
            ))}
            {mostCriticalFiles.length > 3 && (
              <div className="text-xs text-center text-muted-foreground py-2">
                +{mostCriticalFiles.length - 3} more files
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Most Complex Files Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Puzzle className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Most Complex Files</span>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Badge 
                  variant="default"
                  className="cursor-pointer hover:opacity-80"
                >
                  {mostComplexFiles.length}
                </Badge>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Puzzle className="h-5 w-5 text-blue-500" />
                    Most Complex Files ({mostComplexFiles.length})
                  </DialogTitle>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto p-2">
                  {mostComplexFiles.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Puzzle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No complex files identified</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {mostComplexFiles.map((item, index) => (
                        <div key={index} className="border rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{getBasename(item.file)}</span>
                            <Badge variant="secondary">{item.outdegree} deps</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono truncate">
                            {item.file}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mostComplexFiles.slice(0, 3).map((item, index) => (
              <FileListItem 
                key={index}
                file={item.file} 
                value={item.outdegree} 
                label="deps" 
              />
            ))}
            {mostComplexFiles.length > 3 && (
              <div className="text-xs text-center text-muted-foreground py-2">
                +{mostComplexFiles.length - 3} more files
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
