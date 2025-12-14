import { forwardRef, memo } from 'react'
import { Tree, TreeApi } from 'react-arborist'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  AlertTriangle,
  Bomb,
  ChevronRight,
  File,
  Folder,
  FolderOpen,
  Ghost,
  Trash2
} from '@/shared/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip'
import type { FileRiskProfile } from '@/shared/types/risk'

import { useFileAnalysisContext } from '../context/FileAnalysisContext'

// Node Renderer - Clean Minimalist Style
const createNodeRenderer = (
  filesInCycle: Set<string>,
  orphanFilesSet: Set<string>,
  riskProfileMap: Map<string, FileRiskProfile>,
  hoveredFile: string | null,
  setHoveredFile: (fileId: string | null) => void,
  onSimulateDelete: (fileId: string) => void,
  brokenFilesSet: Set<string>,
  newOrphansSet: Set<string>,
  isSimulating?: boolean
) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  memo(({ node, style, dragHandle }: any) => {
    const Icon = node.isLeaf ? File : node.isOpen ? FolderOpen : Folder
    const isInCycle = filesInCycle.has(node.id)
    const isOrphan = orphanFilesSet.has(node.id)
    const isHovered = hoveredFile === node.id
    const isBroken = brokenFilesSet.has(node.id)
    const isNewOrphan = newOrphansSet.has(node.id)
    const normalizedNodeId = node.id.replace(/\\/g, '/')
    const riskProfile =
      riskProfileMap.get(normalizedNodeId) || riskProfileMap.get(node.id)

    // Determine if file has any status
    const hasStatus = isInCycle || isOrphan || isBroken || isNewOrphan
    const isHighRisk = riskProfile && (riskProfile.category === 'Kritis' || riskProfile.category === 'Tinggi')

    return (
      <div
        style={style}
        ref={dragHandle}
        className={`group flex items-center gap-2 cursor-pointer rounded-md transition-colors h-8 px-2 ${node.isSelected
          ? 'bg-primary/5 border-l-2 border-primary'
          : 'hover:bg-muted border-l-2 border-transparent'
          } ${isHovered && !node.isSelected ? 'bg-muted' : ''}`}
        onClick={() => {
          if (node.isLeaf) {
            node.select()
          } else {
            node.toggle()
          }
        }}
        onMouseEnter={() => {
          if (node.isLeaf) {
            setHoveredFile(node.id)
          }
        }}
        onMouseLeave={() => {
          if (node.isLeaf) {
            setHoveredFile(null)
          }
        }}
      >
        {/* Chevron for folders */}
        {!node.isLeaf && (
          <ChevronRight
            className={`h-3 w-3 text-muted-foreground shrink-0 transition-transform ${node.isOpen ? 'rotate-90' : ''
              }`}
          />
        )}

        {/* File/Folder icon - neutral color */}
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />

        {/* Filename */}
        <span className="truncate text-sm text-foreground flex-1">
          {node.data.name}
        </span>

        {/* Status indicators - only show on hover or if selected, except for high-risk items */}
        <div className={`flex items-center gap-1 ${(node.isSelected || isHovered || isHighRisk || hasStatus) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          } transition-opacity`}>
          {/* Risk badge - outline style */}
          {riskProfile && (node.isSelected || isHovered || isHighRisk) && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                    {riskProfile.category === 'Kritis' ? 'K' :
                      riskProfile.category === 'Tinggi' ? 'T' :
                        riskProfile.category === 'Sedang' ? 'S' : 'R'}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs">
                    Risk: {riskProfile.category} (Score: {riskProfile.score})
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Orphan indicator */}
          {isOrphan && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Ghost className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs">Orphan: Not imported by any file</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Circular dependency */}
          {isInCycle && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs">Circular dependency detected</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Broken by simulation */}
          {isBroken && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Bomb className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs">Will break if simulated file is deleted</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* New orphan by simulation */}
          {isNewOrphan && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Ghost className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs">Will become orphan if simulated file is deleted</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Delete simulation button - only on hover */}
          {node.isLeaf && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      disabled={isSimulating}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSimulateDelete(node.id)
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
                    <p className="text-xs">Simulate deletion</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>
    )
  })

interface FileTreeViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[] // Data dari backend (fileTree)
  onFileSelect: (fileId: string | null) => void
  onSimulateDelete?: (fileId: string) => void
  onFileHover?: (fileId: string) => void
}

export const FileTreeView = forwardRef<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TreeApi<any> | undefined,
  FileTreeViewProps
>(({ data, onFileSelect, onSimulateDelete = () => { }, onFileHover }, ref) => {
  // Get all status data from context
  const {
    hoveredFile,
    setHoveredFile,
    searchQuery,
    filesInCycle,
    orphanFilesSet,
    riskProfileMap,
    brokenFilesSet,
    newOrphansSet,
    isSimulating
  } = useFileAnalysisContext()

  const NodeRenderer = createNodeRenderer(
    filesInCycle,
    orphanFilesSet,
    riskProfileMap,
    hoveredFile,
    (id) => {
      setHoveredFile(id)
      if (id) {
        onFileHover?.(id)
      }
    },
    onSimulateDelete,
    brokenFilesSet,
    newOrphansSet,
    isSimulating
  )

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No files to display</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Section Label */}
      <div className="px-4 py-3">
        <span className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
          File Explorer
        </span>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 pb-4">
          <Tree
            ref={ref}
            data={data}
            width="100%"
            height={800}
            rowHeight={32}
            indent={16}
            openByDefault={false}
            searchTerm={searchQuery}
            onSelect={(nodes) => {
              const selectedNode = nodes[0]
              if (!selectedNode) {
                return
              }
              if (selectedNode?.isLeaf) {
                onFileSelect(selectedNode.id)
              } else {
                onFileSelect(null)
              }
            }}
          >
            {NodeRenderer}
          </Tree>
        </div>
      </div>
    </div>
  )
})
