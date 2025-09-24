import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { FileTreeView } from './components/FileTreeView';
import NodeDetailPanel from './components/NodeDetailPanel';
import { ProjectDashboard } from './components/ProjectDashboard';
import { ThemeProvider, useTheme } from './components/theme-provider';
import { analyzeProject, simulateRemoval } from './lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Moon, Sun, Search, Play, FileWarning, FileX, ArrowRight, ArrowDown } from 'lucide-react';
import { TreeApi } from 'react-arborist';
import type { FileRiskProfile } from '@/types/risk';

// TypeScript interfaces for new format
interface DependencyInfo {
  target: string;
  strength: number;
  line: number;
}

interface CircularDependencyInfo {
  cycle: string[];
  length: number;
  files: string[];
  severity: 'high' | 'medium' | 'low';
}

interface AnalysisData {
  nodes: any[];  // Add nodes array
  edges: any[];  // Add edges array
  fileTree: any[];
  dependencyMap: { [filePath: string]: DependencyInfo[] };
  riskAnalysis?: FileRiskProfile[];
  issues: {
    circularDependencies: CircularDependencyInfo[];
    orphans: string[];
    highImpact: { file: string; indegree: number }[];
    summary: string;
  };
  metrics: {
    fileCount: number;
    edgeCount: number;
    avgDegree: number;
  };
  detailedMetrics?: {
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
  };
}
// Helper function to get basename without path module
const getBasename = (filePath: string) => {
  return filePath.split('/').pop() || filePath;
};

function AppContent() {
  const [rootPath, setRootPath] = useState('/Users/mbam1/Local Document/Project/kirimpaket');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [query, setQuery] = useState('');
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('LR'); // Default ke Left-Right
  const { theme, setTheme } = useTheme();
  const treeRef = useRef<TreeApi<any> | null>(null);
  
  // State baru dengan full analysis data
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);
  const [mermaidChart, setMermaidChart] = useState<string>('');
  const [riskAnalysis, setRiskAnalysis] = useState<FileRiskProfile[]>([]);
  const [viewMode, setViewMode] = useState<'overview' | 'file'>('overview');

  // Simulation state
  const [simulationResult, setSimulationResult] = useState<{ brokenFiles: string[], newOrphans: string[] } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const normalizePath = useCallback((value: string) => value.replace(/\\/g, '/'), []);

  const riskProfileMap = useMemo(() => {
    const map = new Map<string, FileRiskProfile>();
    const normalizedRoot = normalizePath(rootPath).replace(/\/+$|\\+$/g, '');
    const rootPrefix = normalizedRoot ? `${normalizedRoot}/` : '';

    riskAnalysis.forEach(profile => {
      const normalizedFile = normalizePath(profile.file);
      map.set(normalizedFile, profile);

      if (rootPrefix && normalizedFile.startsWith(rootPrefix)) {
        const relativePath = normalizedFile.slice(rootPrefix.length);
        map.set(relativePath, profile);
      }
    });

    return map;
  }, [normalizePath, riskAnalysis, rootPath]);

  const getRiskProfileForFile = useCallback((fileId: string | null) => {
    if (!fileId) return null;
    const normalizedId = normalizePath(fileId);

    if (riskProfileMap.has(normalizedId)) {
      return riskProfileMap.get(normalizedId) || null;
    }

    for (const [key, profile] of riskProfileMap.entries()) {
      if (key === normalizedId || key.endsWith(`/${normalizedId}`)) {
        return profile;
      }
    }

    return null;
  }, [normalizePath, riskProfileMap]);

  // MEMOIZED SETS: Untuk pengecekan cepat file status
  const filesInCycle = useMemo(() => {
    if (!analysisData?.issues?.circularDependencies) return new Set<string>();
    const allFilesInCycles = analysisData.issues.circularDependencies.flatMap(dep => dep.files);
    return new Set(allFilesInCycles);
  }, [analysisData?.issues?.circularDependencies]);

  const highImpactFilesMap = useMemo(() => {
    if (!analysisData?.issues?.highImpact) return new Map<string, number>();
    return new Map(analysisData.issues.highImpact.map(item => [item.file, item.indegree]));
  }, [analysisData?.issues?.highImpact]);

  const orphanFilesSet = useMemo(() => {
    if (!analysisData?.issues?.orphans) return new Set<string>();
    return new Set(analysisData.issues.orphans);
  }, [analysisData?.issues?.orphans]);

  // Memoized sets for simulation results
  const brokenFilesSet = useMemo(() => new Set(simulationResult?.brokenFiles || []), [simulationResult]);
  const newOrphansSet = useMemo(() => new Set(simulationResult?.newOrphans || []), [simulationResult]);

  const generateMermaidForFile = useCallback((fileId: string | null, sourceData?: AnalysisData | null) => {
    const currentData = sourceData ?? analysisData;

    if (!fileId || !currentData) {
      setMermaidChart('');
      return null;
    }

    const dependencyMap = currentData.dependencyMap || {};
    const absoluteFileId = Object.keys(dependencyMap).find(key =>
      key.endsWith('/' + fileId) || key === fileId
    );

    const actualFileId = absoluteFileId || fileId;
    const selectedFileName = getBasename(actualFileId);

    const nodeMap = new Map<string, string>();
    nodeMap.set(selectedFileName, actualFileId);

    const outgoing = dependencyMap[actualFileId] || [];
    outgoing.forEach((dep: DependencyInfo) => {
      nodeMap.set(getBasename(dep.target), dep.target);
    });

    const incoming = Object.entries(dependencyMap).filter(([, deps]) =>
      (deps as DependencyInfo[]).some((dep: DependencyInfo) => dep.target === actualFileId)
    );
    incoming.forEach(([importer]) => {
      nodeMap.set(getBasename(importer), importer);
    });

    let chartString = `graph ${layoutDirection}\n`;
    nodeMap.forEach((fullPath, basename) => {
      const nodeId = basename.replace(/[^a-zA-Z0-9]/g, '_');
      chartString += `  ${nodeId}["${basename}"]\n`;
      chartString += `  click ${nodeId} call handleMermaidNodeClick("${fullPath}")\n`;
    });

    let linkIndex = 0;
    const selectedNodeId = selectedFileName.replace(/[^a-zA-Z0-9]/g, '_');

    if (outgoing.length > 0) {
      outgoing.forEach((dep: DependencyInfo) => {
        const targetNodeId = getBasename(dep.target).replace(/[^a-zA-Z0-9]/g, '_');
        chartString += `  ${selectedNodeId} --> ${targetNodeId}\n`;

        const strokeWidth = Math.min(1 + Math.log2(dep.strength + 1), 5).toFixed(2);
        const strokeColor = dep.strength >= 3 ? '#ef4444' : '#6b7280';
        chartString += `  linkStyle ${linkIndex} stroke-width:${strokeWidth}px,stroke:${strokeColor}\n`;
        linkIndex++;
      });
    }

    if (incoming.length > 0) {
      incoming.forEach(([importer, deps]) => {
        const sourceNodeId = getBasename(importer).replace(/[^a-zA-Z0-9]/g, '_');
        chartString += `  ${sourceNodeId} --> ${selectedNodeId}\n`;

        const connection = (deps as DependencyInfo[]).find((d: DependencyInfo) => d.target === actualFileId);
        const strength = connection ? connection.strength : 1;

        const strokeWidth = Math.min(1 + Math.log2(strength + 1), 5).toFixed(2);
        const strokeColor = strength >= 3 ? '#ef4444' : '#6b7280';
        chartString += `  linkStyle ${linkIndex} stroke-width:${strokeWidth}px,stroke:${strokeColor}\n`;
        linkIndex++;
      });
    }

    if (outgoing.length === 0 && incoming.length === 0) {
      chartString += `  ${selectedNodeId} --> NONE["No dependencies found"]\n`;
      chartString += '  style NONE fill:#f3f4f6,stroke:#9ca3af,stroke-dasharray: 5 5\n';
    }

    chartString += `  style ${selectedNodeId} fill:#BAF8D0,stroke:#16a34a,stroke-width:2px\n`;

    setMermaidChart(chartString);
    return actualFileId;
  }, [analysisData, layoutDirection]);

  const handleFileSelect = useCallback((fileId: string | null) => {
    if (!fileId || !analysisData) {
      setSelectedFileId(null);
      setSelectedNode(null);
      setViewMode('overview');
      generateMermaidForFile(null);
      return;
    }

    setViewMode('file');
    const resolvedFileId = generateMermaidForFile(fileId) || fileId;
    setSelectedFileId(resolvedFileId);

    const nodeData = analysisData.nodes?.find((n: any) => n.id === resolvedFileId)
      || analysisData.nodes?.find((n: any) => n.id.endsWith('/' + resolvedFileId));

    setSelectedNode(nodeData || null);
  }, [analysisData, generateMermaidForFile]);

  const handleShowOverview = useCallback(() => {
    setViewMode('overview');
    setSelectedFileId(null);
    setSelectedNode(null);
    setMermaidChart('');
  }, []);

  // Register global function for Mermaid click navigation
  useEffect(() => {
    (window as any).handleMermaidNodeClick = (fileIdOrName: string) => {
      console.log('Mermaid node clicked:', fileIdOrName);
      
      if (!analysisData || !treeRef.current) return;
      
      // Try to find the full path by matching filename or full path
      let matchedFileId = fileIdOrName;
      
      // If it's just a filename, try to find the full path
      if (!fileIdOrName.includes('/') && analysisData.dependencyMap) {
        const allFiles = Object.keys(analysisData.dependencyMap);
        const matchedFile = allFiles.find(filePath => {
          const basename = filePath.split('/').pop() || '';
          return basename === fileIdOrName || basename.replace(/\.[^/.]+$/, '') === fileIdOrName.replace(/\.[^/.]+$/, '');
        });
        
        if (matchedFile) {
          matchedFileId = matchedFile;
          console.log('Resolved filename to full path:', matchedFile);
        }
      }
      
      // Find the node in the tree and select it
      treeRef.current.select(matchedFileId, { focus: true });
      // Also trigger the file select handler
      handleFileSelect(matchedFileId);
    };

    // Cleanup on unmount
    return () => {
      delete (window as any).handleMermaidNodeClick;
    };
  }, [analysisData, handleFileSelect]);

  // Regenerate chart when layout direction changes
  useEffect(() => {
    if (selectedFileId) {
      generateMermaidForFile(selectedFileId);
    }
  }, [generateMermaidForFile, layoutDirection, selectedFileId]);

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      setRiskAnalysis([]);
      const result = await analyzeProject({ rootPath });
      // Store the complete analysis result including issues
      const typedResult = result as AnalysisData;
      setAnalysisData(typedResult);
      setRiskAnalysis(typedResult.riskAnalysis || []);
      setSelectedFileId(null);
      setSelectedNode(null);
      setMermaidChart('');
      setViewMode('overview');
      // Clear any previous simulation results
      setSimulationResult(null);
      
      // Log circular dependencies for debugging
      if (result.issues?.circularDependencies?.length > 0) {
        console.log('🔄 Circular Dependencies Found:', result.issues.circularDependencies);
        console.log('📋 Summary:', result.issues.summary);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSimulateDelete = async (fileId: string) => {
    console.log('🚀 Frontend: Starting simulation for file:', fileId);
    setIsSimulating(true);
    try {
      const result = await simulateRemoval({
        fileToRemove: fileId,
        dependencyMap: analysisData?.dependencyMap,
      });
      console.log('✅ Frontend: Simulation result received:', result);
      setSimulationResult(result);
    } catch (error) {
      console.error("😭 Simulasi gagal:", error);
    } finally {
      setIsSimulating(false);
    }
  };
  
  const closeSimulation = () => setSimulationResult(null);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      {/* Simple Top Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm opacity-90"></div>
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Code Mapper
            </h1>
          </div>
          
          {/* Center: Input and Analyze */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                value={rootPath}
                onChange={e => setRootPath(e.target.value)}
                placeholder="Enter project path..."
                className="w-80 pr-4 border-slate-300 dark:border-slate-600 focus:border-green-500 dark:focus:border-green-400"
              />
            </div>
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="bg-green-600 hover:bg-green-700 text-white px-6"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
          
          {/* Right: Search, Layout Controls, and Theme */}
          <div className="flex items-center gap-3">
            {analysisData && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search files..."
                  className="pl-10 w-48 border-slate-300 dark:border-slate-600 focus:border-green-500 dark:focus:border-green-400"
                />
              </div>
            )}
            
            {/* Layout Direction Controls */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-md p-1">
              <Button
                variant={layoutDirection === 'LR' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayoutDirection('LR')}
                disabled={!analysisData}
                className={`px-3 py-1 text-xs ${layoutDirection === 'LR' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''} ${!analysisData ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Left-Right Layout"
              >
                <ArrowRight className="h-3 w-3 mr-1" />
                LR
              </Button>
              <Button
                variant={layoutDirection === 'TB' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayoutDirection('TB')}
                disabled={!analysisData}
                className={`px-3 py-1 text-xs ${layoutDirection === 'TB' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''} ${!analysisData ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Top-Bottom Layout"
              >
                <ArrowDown className="h-3 w-3 mr-1" />
                TB
              </Button>
            </div>
            {analysisData && (
              <Button
                variant={viewMode === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={handleShowOverview}
                className="px-3 py-1 text-xs"
              >
                Project Overview
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'light' ? 
                <Moon className="h-5 w-5" /> : 
                <Sun className="h-5 w-5" />
              }
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {analysisData && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-6">
              <span>
                <strong className="text-slate-900 dark:text-slate-100">
                  {Object.keys(analysisData.dependencyMap).length}
                </strong> files
              </span>
              {selectedNode && (
                <span className="text-green-600 dark:text-green-400">
                  <strong>Selected:</strong> {getBasename(selectedNode.id || selectedFileId || '')}
                </span>
              )}
            </div>
            <div className="text-xs">
              Analyzed: <strong>{new Date().toLocaleTimeString()}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Layout Utama - Tree, Dashboard, dan Panel Detail */}
      <div className="flex h-[calc(100vh-140px)]">
        <div className="w-80 border-r border-slate-200 dark:border-slate-800">
          {analysisData && (
            <FileTreeView
              ref={treeRef}
              data={analysisData.fileTree}
              onFileSelect={handleFileSelect}
              filesInCycle={filesInCycle}
              highImpactFilesMap={highImpactFilesMap}
              orphanFilesSet={orphanFilesSet}
              searchTerm={query}
              hoveredFile={hoveredFile}
              setHoveredFile={setHoveredFile}
              onSimulateDelete={handleSimulateDelete}
              brokenFilesSet={brokenFilesSet}
              newOrphansSet={newOrphansSet}
              isSimulating={isSimulating}
              riskProfileMap={riskProfileMap}
            />
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          {analysisData ? (
            <ProjectDashboard
              analysisData={analysisData}
              mermaidChart={mermaidChart}
              hoveredFile={hoveredFile}
              viewMode={viewMode}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
                  <div className="w-12 h-12 bg-white rounded-full opacity-90"></div>
                </div>
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Ready to analyze your codebase
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Enter a project path above and click "Analyze" to get started
                </p>
              </div>
            </div>
          )}
        </div>

        {analysisData && viewMode === 'file' && selectedNode && (
          <div className="w-96 border-l border-slate-200 dark:border-slate-800 overflow-hidden">
            <NodeDetailPanel
              node={selectedNode}
              data={analysisData}
              onClose={() => handleFileSelect(null)}
              riskProfile={getRiskProfileForFile(selectedFileId)}
            />
          </div>
        )}
      </div>

      {/* Modal untuk menampilkan hasil simulasi */}
      <Dialog open={!!simulationResult} onOpenChange={(isOpen) => !isOpen && closeSimulation()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Hasil Simulasi Penghapusan</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <FileWarning className="h-5 w-5 text-red-500" />
                File yang Akan Rusak ({simulationResult?.brokenFiles.length || 0})
              </h3>
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {simulationResult?.brokenFiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Tidak ada file yang akan rusak</p>
                ) : (
                  simulationResult?.brokenFiles.map(file => (
                    <div key={file} className="text-sm p-2 bg-muted rounded font-mono">{getBasename(file)}</div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <FileX className="h-5 w-5 text-yellow-500" />
                Orphan Baru ({simulationResult?.newOrphans.length || 0})
              </h3>
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {simulationResult?.newOrphans.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Tidak ada file yang akan menjadi orphan</p>
                ) : (
                  simulationResult?.newOrphans.map(file => (
                    <div key={file} className="text-sm p-2 bg-muted rounded font-mono">{getBasename(file)}</div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SimpleApp() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="code-mapper-theme">
      <AppContent />
    </ThemeProvider>
  );
}
