import { Tree, TreeApi } from "react-arborist";
import { File, Folder, FolderOpen, AlertTriangle, Flame, Ghost, Trash2, Bomb } from '@/components/ui/icons';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { memo, forwardRef } from "react";
import type { FileRiskProfile } from "@/types/risk";

// Node Renderer Kustom untuk menampilkan ikon
const createNodeRenderer = (
  filesInCycle: Set<string>,
  highImpactFilesMap: Map<string, number>,
  orphanFilesSet: Set<string>,
  riskProfileMap: Map<string, FileRiskProfile>,
  hoveredFile: string | null,
  setHoveredFile: (fileId: string | null) => void,
  onSimulateDelete: (fileId: string) => void,
  brokenFilesSet: Set<string>,
  newOrphansSet: Set<string>,
  isSimulating?: boolean
) => memo(({ node, style, dragHandle }: any) => {
  const Icon = node.isLeaf ? File : node.isOpen ? FolderOpen : Folder;
  const isInCycle = filesInCycle.has(node.id);
  const highImpactData = highImpactFilesMap.get(node.id);
  const isOrphan = orphanFilesSet.has(node.id);
  const isHovered = hoveredFile === node.id;
  const isBroken = brokenFilesSet.has(node.id);
  const isNewOrphan = newOrphansSet.has(node.id);
  const normalizedNodeId = node.id.replace(/\\/g, '/');
  const riskProfile = riskProfileMap.get(normalizedNodeId) || riskProfileMap.get(node.id);
  
  return (
    <div
      style={style}
      ref={dragHandle}
      className={`group flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded-md transition-colors ${
        node.isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
      } ${
        isInCycle ? 'bg-orange-50 dark:bg-orange-900/20' : ''
      } ${
        highImpactData ? 'bg-red-50 dark:bg-red-900/20' : ''
      } ${
        isOrphan ? 'bg-gray-50 dark:bg-gray-900/20' : ''
      } ${
        isBroken || isNewOrphan ? 'bg-red-100 dark:bg-red-900/30 ring-2 ring-red-300 dark:ring-red-600' : ''
      } ${
        isHovered ? 'bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-300 dark:ring-blue-600' : ''
      }`}
      onClick={() => {
        if (node.isLeaf) {
          node.select();
        } else {
          node.toggle();
        }
      }}
      onMouseEnter={() => {
        if (node.isLeaf) {
          setHoveredFile(node.id);
        }
      }}
      onMouseLeave={() => {
        if (node.isLeaf) {
          setHoveredFile(null);
        }
      }}
    >
      {riskProfile && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className={`h-2.5 w-2.5 rounded-full ${getRiskColor(riskProfile.category)}`} />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                Risiko Refactor: {riskProfile.category} (Skor: {riskProfile.score})
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
      <span className={`truncate text-sm ${
        isInCycle 
          ? 'text-orange-700 dark:text-orange-300 font-medium'
        : highImpactData
          ? 'text-red-700 dark:text-red-300 font-semibold' 
        : isOrphan
          ? 'text-gray-500 dark:text-gray-400 italic'
          : 'text-slate-700 dark:text-slate-300'
      }`}>
        {node.data.name}
      </span>
      
      {/* Status indicators container */}
      <div className="flex items-center gap-1 ml-auto">
        {/* High Impact File indicator */}
        {highImpactData && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-red-500" />
                <Badge variant="destructive" className="text-xs px-1 py-0 h-4">
                  {highImpactData}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">
                  🔥 High-Impact: Diimpor oleh {highImpactData} file lain
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Orphan File indicator */}
        {isOrphan && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Ghost className="h-4 w-4 text-gray-500" />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">
                  👻 Orphan: Tidak diimpor oleh file lain
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Circular dependency warning */}
        {isInCycle && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">
                  ⚠️ File ini terlibat dalam dependensi melingkar
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Simulation result indicators */}
        {isBroken && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Bomb className="h-4 w-4 text-red-600" />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">
                  💣 Akan rusak jika file yang disimulasi dihapus
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {isNewOrphan && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Ghost className="h-4 w-4 text-yellow-600" />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">
                  👻 Akan menjadi orphan jika file yang disimulasi dihapus
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Simulation button - only visible on hover for files */}
        {node.isLeaf && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={isSimulating}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent tree selection
                      console.log('🎯 Simulating delete for node ID:', node.id);
                      console.log('Node data:', node.data);
                      onSimulateDelete(node.id);
                    }}
                  >
                    {isSimulating ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-muted-foreground" />
                    ) : (
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs">
                    🗑️ Simulasi Penghapusan
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      
      {/* File type indicator - only show if no other indicators */}
      {node.isLeaf && !isInCycle && !highImpactData && !isOrphan && (
        <div
          className="w-2 h-2 rounded-full ml-auto"
          style={{ 
            backgroundColor: getFileTypeColor(node.data.name) 
          }}
        />
      )}
    </div>
  );
});

const getRiskColor = (category: FileRiskProfile['category']): string => {
  switch (category) {
    case 'Kritis':
      return 'bg-red-500';
    case 'Tinggi':
      return 'bg-orange-500';
    case 'Sedang':
      return 'bg-yellow-500';
    default:
      return 'bg-green-500';
  }
};

// Helper function untuk menentukan warna berdasarkan ekstensi file
const getFileTypeColor = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return '#3178c6';
    case 'js':
    case 'jsx':
      return '#f7df1e';
    case 'css':
    case 'scss':
      return '#1572b6';
    case 'json':
      return '#000000';
    case 'md':
      return '#083fa1';
    default:
      return '#64748b';
  }
};

interface FileTreeViewProps {
  data: any[]; // Data dari backend (fileTree)
  onFileSelect: (fileId: string | null) => void;
  filesInCycle: Set<string>; // Files that are involved in circular dependencies
  highImpactFilesMap: Map<string, number>; // High-impact files with their indegree
  orphanFilesSet: Set<string>; // Orphan files (never imported)
  riskProfileMap: Map<string, FileRiskProfile>; // Refactor risk profiles per file
  searchTerm: string; // Search term for filtering files
  hoveredFile: string | null; // Currently hovered file
  setHoveredFile: (fileId: string | null) => void; // Function to set hovered file
  onSimulateDelete?: (fileId: string) => void; // Function to simulate file deletion
  brokenFilesSet?: Set<string>; // Files that would break if simulated file is deleted
  newOrphansSet?: Set<string>; // Files that would become orphans if simulated file is deleted
  isSimulating?: boolean; // Whether simulation is currently running
}

export const FileTreeView = forwardRef<TreeApi<any> | undefined, FileTreeViewProps>(
  ({ 
    data, 
    onFileSelect, 
    filesInCycle, 
    highImpactFilesMap, 
    orphanFilesSet, 
    riskProfileMap,
    searchTerm, 
    hoveredFile, 
    setHoveredFile,
    onSimulateDelete = () => {},
    brokenFilesSet = new Set(),
    newOrphansSet = new Set(),
    isSimulating = false
  }, ref) => {
    const NodeRenderer = createNodeRenderer(
      filesInCycle, 
      highImpactFilesMap, 
      orphanFilesSet, 
      riskProfileMap,
      hoveredFile, 
      setHoveredFile,
      onSimulateDelete,
      brokenFilesSet,
      newOrphansSet,
      isSimulating
    );

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
        <div className="text-center">
          <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No files to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Project Files
        </h3>
      </div>
      
      {/* Tree */}
      <div className="p-2">
        <Tree
          ref={ref}
          data={data}
          width="100%"
          height={800}
          rowHeight={28}
          indent={16}
          openByDefault={false}
          searchTerm={searchTerm}
          onSelect={(nodes) => {
            const selectedNode = nodes[0];
            if (!selectedNode) {
              return;
            }
            if (selectedNode?.isLeaf) {
              onFileSelect(selectedNode.id);
            } else {
              onFileSelect(null);
            }
          }}
        >
          {NodeRenderer}
        </Tree>
      </div>
    </div>
  );
  }
);
