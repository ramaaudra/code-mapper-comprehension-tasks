import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, Ghost, Flame, ArrowRight } from 'lucide-react';
import type { AnalysisData } from '@/types/analysis';

interface IssuesPanelProps {
  data: AnalysisData | null;
  onNavigateToFile?: (file: string) => void;
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

export function IssuesPanel({ data, onNavigateToFile }: IssuesPanelProps) {
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

  const [circularDialogOpen, setCircularDialogOpen] = useState(false);
  const [orphansDialogOpen, setOrphansDialogOpen] = useState(false);
  const [highImpactDialogOpen, setHighImpactDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      {summary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4" />
              Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-line text-xs text-muted-foreground">
              {summary}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Circular Dependencies */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Circular Dependencies</span>
            </div>
            <Dialog open={circularDialogOpen} onOpenChange={setCircularDialogOpen}>
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
                <div className="space-y-4 overflow-y-auto p-2">
                  {circularDependencies.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <AlertTriangle className="mx-auto h-12 w-12 opacity-50" />
                      <p>✅ No circular dependencies found!</p>
                      <p className="mt-1 text-xs">Your codebase has a clean dependency structure.</p>
                    </div>
                  ) : (
                    circularDependencies.map((depInfo, index) => (
                      <div key={index} className="space-y-3 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">Cycle #{index + 1}</span>
                            <Badge 
                              className={`px-2 py-1 text-xs ${getSeverityColor(depInfo.severity)}`}
                              variant="outline"
                            >
                              {depInfo.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Length: {depInfo.length} • Files: {depInfo.files.length}
                          </div>
                        </div>

                        <div className="rounded-md bg-muted/50 p-3">
                          <p className="mb-2 text-xs font-medium text-muted-foreground">Dependency Flow:</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                        {depInfo.cycle.map((file, fileIndex) => (
                          <React.Fragment key={fileIndex}>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onNavigateToFile?.(file);
                                      setCircularDialogOpen(false);
                                    }}
                                    className="rounded border bg-background px-2 py-1 text-left text-xs transition hover:border-primary/50 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                  >
                                    <span className="truncate">{getBasename(file)}</span>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs whitespace-pre-line text-xs">{file}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {fileIndex < depInfo.cycle.length - 1 && (
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            )}
                          </React.Fragment>
                        ))}
                          </div>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-medium text-muted-foreground">Files Involved:</p>
                          <div className="flex flex-wrap gap-1">
                            {depInfo.files.map((file, fileIndex) => (
                              <TooltipProvider key={fileIndex}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge 
                                      variant="outline" 
                                      className="cursor-pointer text-xs hover:border-primary/50 hover:text-primary"
                                      onClick={() => {
                                        onNavigateToFile?.(file);
                                        setCircularDialogOpen(false);
                                      }}
                                    >
                                      {getBasename(file)}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs whitespace-pre-line text-xs">{file}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
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

        {circularDependencies.length > 0 && (
          <CardContent>
            <div className="flex flex-wrap gap-2 text-xs">
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

      <div className="space-y-4">
        {/* Orphaned Files */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ghost className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Orphaned Files</span>
              </div>
              <Dialog open={orphansDialogOpen} onOpenChange={setOrphansDialogOpen}>
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
                  <div className="max-h-96 space-y-2 overflow-y-auto p-2">
                    {orphans.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        <Ghost className="mx-auto h-12 w-12 opacity-50" />
                        <p>✅ No orphaned files found!</p>
                        <p className="mt-1 text-xs">All files are properly referenced.</p>
                      </div>
                    ) : (
                      orphans.map((file: string, index: number) => (
                        <TooltipProvider key={index}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => {
                                  onNavigateToFile?.(file);
                                  setOrphansDialogOpen(false);
                                }}
                                className="w-full rounded-lg border px-3 py-3 text-left transition hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                              >
                                <span className="block truncate text-sm font-medium">{getBasename(file)}</span>
                                <span className="block truncate font-mono text-xs text-muted-foreground">{file}</span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-sm whitespace-pre-line text-xs">{file}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          {orphans.length > 0 && (
            <CardContent>
              <div className="space-y-2">
                {orphans.slice(0, 4).map((file, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => onNavigateToFile?.(file)}
                          className="w-full rounded-md border bg-background px-3 py-2 text-left text-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          <span className="block truncate font-medium">{getBasename(file)}</span>
                          <span className="block truncate font-mono text-xs text-muted-foreground">{file}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-sm whitespace-pre-line text-xs">{file}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {orphans.length > 4 && (
                  <p className="text-center text-xs text-muted-foreground">
                    +{orphans.length - 4} more files
                  </p>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* High Impact Files */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">High Impact Files</span>
              </div>
              <Dialog open={highImpactDialogOpen} onOpenChange={setHighImpactDialogOpen}>
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
                  <div className="max-h-96 space-y-2 overflow-y-auto p-2">
                    {highImpact.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        <Flame className="mx-auto h-12 w-12 opacity-50" />
                        <p>No high impact files found.</p>
                      </div>
                    ) : (
                      highImpact.map((item: { file: string; indegree: number }, index: number) => (
                        <TooltipProvider key={index}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => {
                                  onNavigateToFile?.(item.file);
                                  setHighImpactDialogOpen(false);
                                }}
                                className="w-full rounded-lg border px-3 py-3 text-left transition hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                              >
                                <div className="mb-1 flex items-center justify-between gap-3">
                                  <span className="flex-1 truncate text-sm font-medium">{getBasename(item.file)}</span>
                                  <Badge variant="secondary">{item.indegree} deps</Badge>
                                </div>
                                <div className="truncate font-mono text-xs text-muted-foreground">
                                  {item.file}
                                </div>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-sm whitespace-pre-line text-xs">{item.file}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          {highImpact.length > 0 && (
            <CardContent>
              <div className="space-y-2">
                {highImpact.slice(0, 4).map((item, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => onNavigateToFile?.(item.file)}
                          className="w-full rounded-md border bg-background px-3 py-2 text-left text-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex-1 truncate font-medium">{getBasename(item.file)}</span>
                            <Badge variant="secondary">{item.indegree} deps</Badge>
                          </div>
                          <span className="block truncate font-mono text-xs text-muted-foreground">{item.file}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-sm whitespace-pre-line text-xs">{item.file}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {highImpact.length > 4 && (
                  <p className="text-center text-xs text-muted-foreground">
                    +{highImpact.length - 4} more files
                  </p>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
