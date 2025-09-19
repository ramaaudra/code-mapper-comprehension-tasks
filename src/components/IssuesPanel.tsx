import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Ghost, Flame, ArrowRight } from 'lucide-react';

// Type definitions for new format
interface CircularDependencyInfo {
  cycle: string[];
  length: number;
  files: string[];
  severity: 'high' | 'medium' | 'low';
}

interface IssuesPanelProps {
  data: {
    issues: {
      circularDependencies: CircularDependencyInfo[];
      orphans: string[];
      highImpact: { file: string; indegree: number }[];
      summary: string;
    };
  };
}

// Helper function to get severity color
const getSeverityColor = (severity: 'high' | 'medium' | 'low'): string => {
  switch (severity) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400';
    case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400';
    case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400';
  }
};

// Helper function to get file basename
const getBasename = (filePath: string): string => {
  return filePath.split('/').pop() || filePath;
};

export function IssuesPanel({ data }: IssuesPanelProps) {
  if (!data?.issues) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Issues Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No analysis data available</p>
        </CardContent>
      </Card>
    );
  }

  const { circularDependencies, orphans, highImpact, summary } = data.issues;

  // Count by severity
  const severityCounts = circularDependencies.reduce(
    (acc, dep) => {
      acc[dep.severity] = (acc[dep.severity] || 0) + 1;
      return acc;
    },
    {} as Record<'high' | 'medium' | 'low', number>
  );

  return (
    <div className="h-full overflow-y-auto space-y-4">
      {/* Summary Card */}
      {summary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground whitespace-pre-line">
              {summary}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues Cards */}
      <div className="space-y-3">
        {/* Circular Dependencies */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Circular Dependencies</span>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Badge 
                    variant={circularDependencies.length > 0 ? "destructive" : "secondary"}
                    className="cursor-pointer hover:opacity-80"
                  >
                    {circularDependencies.length}
                  </Badge>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Circular Dependencies ({circularDependencies.length})
                    </DialogTitle>
                  </DialogHeader>
                  <div className="overflow-y-auto space-y-4 p-2">
                    {circularDependencies.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>✅ No circular dependencies found!</p>
                        <p className="text-xs mt-1">Your codebase has a clean dependency structure.</p>
                      </div>
                    ) : (
                      circularDependencies.map((depInfo, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          {/* Header with severity */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">Cycle #{index + 1}</span>
                              <Badge 
                                className={`text-xs px-2 py-1 ${getSeverityColor(depInfo.severity)}`}
                                variant="outline"
                              >
                                {depInfo.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Length: {depInfo.length} • Files: {depInfo.files.length}
                            </div>
                          </div>
                          
                          {/* Cycle path */}
                          <div className="bg-muted/50 rounded-md p-3">
                            <p className="text-xs font-medium mb-2 text-muted-foreground">Dependency Flow:</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                              {depInfo.cycle.map((file, fileIndex) => (
                                <React.Fragment key={fileIndex}>
                                  <div className="bg-background border rounded px-2 py-1 max-w-[200px] truncate">
                                    {getBasename(file)}
                                  </div>
                                  {fileIndex < depInfo.cycle.length - 1 && (
                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                          
                          {/* Involved files */}
                          <div>
                            <p className="text-xs font-medium mb-2 text-muted-foreground">Files Involved:</p>
                            <div className="flex flex-wrap gap-1">
                              {depInfo.files.map((file, fileIndex) => (
                                <Badge key={fileIndex} variant="outline" className="text-xs">
                                  {getBasename(file)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          
          {/* Severity breakdown */}
          {circularDependencies.length > 0 && (
            <CardContent>
              <div className="flex gap-2 text-xs">
                {(['high', 'medium', 'low'] as const).map((severity) => {
                  const count = severityCounts[severity] || 0;
                  if (count === 0) return null;
                  return (
                    <Badge 
                      key={severity}
                      className={`${getSeverityColor(severity)} text-xs`}
                      variant="outline"
                    >
                      {count} {severity}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Orphaned Files */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ghost className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Orphaned Files</span>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Badge 
                    variant={orphans.length > 0 ? "outline" : "secondary"}
                    className="cursor-pointer hover:opacity-80"
                  >
                    {orphans.length}
                  </Badge>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Ghost className="h-5 w-5 text-gray-500" />
                      Orphaned Files ({orphans.length})
                    </DialogTitle>
                  </DialogHeader>
                  <div className="max-h-96 overflow-y-auto p-2">
                    {orphans.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Ghost className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>✅ No orphaned files found!</p>
                        <p className="text-xs mt-1">All files are properly referenced.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {orphans.map((file: string, index: number) => (
                          <div key={index} className="border rounded p-3">
                            <div className="text-sm font-medium mb-1">{getBasename(file)}</div>
                            <div className="text-xs text-muted-foreground font-mono truncate">
                              {file}
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
        </Card>

        {/* High Impact Files */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">High Impact Files</span>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Badge 
                    variant="default"
                    className="cursor-pointer hover:opacity-80"
                  >
                    {highImpact.length}
                  </Badge>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-red-500" />
                      High Impact Files ({highImpact.length})
                    </DialogTitle>
                  </DialogHeader>
                  <div className="max-h-96 overflow-y-auto p-2">
                    {highImpact.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Flame className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No high impact files found.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {highImpact.map((item: { file: string; indegree: number }, index: number) => (
                          <div key={index} className="border rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{getBasename(item.file)}</span>
                              <Badge variant="secondary">{item.indegree} dependencies</Badge>
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
        </Card>
      </div>
    </div>
  );
}
