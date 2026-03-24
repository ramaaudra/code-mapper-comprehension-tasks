import { forwardRef, memo, useImperativeHandle, useRef } from 'react'
import { Tree } from 'react-arborist'

import { Button } from '@/shared/components/ui/button'
import {
  AlertTriangle,
  Bomb,
  ChevronRight,
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
import { getFileIcon, hasMatchInSet, normalizePath } from '@/shared/lib/utils'

import { useFileAnalysisContext } from '../context/FileAnalysisContext'
import { FileSearchBar, type FileSearchBarRef } from './FileSearchBar'

import type { FileReviewStory } from '@/shared/lib/utils/file-review-story'
import type { FileTreeNode } from '@/shared/types/analysis'
import type { NodeApi, NodeRendererProps, TreeApi } from 'react-arborist'

const createNodeRenderer = (
  filesInCycle: Set<string>,
  orphanFilesSet: Set<string>,
  fileReviewStoryMap: Map<string, FileReviewStory>,
  hoveredFile: string | null,
  setHoveredFile: (fileId: string | null) => void,
  onSimulateDelete: (fileId: string) => void,
  brokenFilesSet: Set<string>,
  newOrphansSet: Set<string>,
  isSimulating?: boolean
) =>
  memo(({ node, style, dragHandle }: NodeRendererProps<FileTreeNode>) => {
    const Icon = node.isLeaf
      ? getFileIcon(node.data.name)
      : node.isOpen
        ? FolderOpen
        : Folder
    const normalizedNodeId = normalizePath(node.id)
    const isInCycle = hasMatchInSet(filesInCycle, normalizedNodeId)
    const isOrphan = hasMatchInSet(orphanFilesSet, normalizedNodeId)
    const isHovered = hoveredFile === node.id
    const isBroken = hasMatchInSet(brokenFilesSet, normalizedNodeId)
    const isNewOrphan = hasMatchInSet(newOrphansSet, normalizedNodeId)
    const reviewStory =
      fileReviewStoryMap.get(normalizedNodeId) ||
      fileReviewStoryMap.get(node.id)

    const hasStatus = isInCycle || isOrphan || isBroken || isNewOrphan
    const showReviewIndicator = Boolean(
      reviewStory?.showTreeIndicator &&
      (reviewStory.alwaysShowTreeIndicator || node.isSelected || isHovered)
    )

    return (
      <div
        role='treeitem'
        aria-selected={node.isSelected}
        tabIndex={0}
        style={style}
        ref={dragHandle}
        className={`group flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 transition-colors ${
          node.isSelected ? 'bg-primary/5' : 'hover:bg-muted'
        } ${isHovered && !node.isSelected ? 'bg-muted' : ''}`}
        onClick={() => {
          if (node.isLeaf) {
            node.select()
          } else {
            node.toggle()
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (node.isLeaf) {
              node.select()
            } else {
              node.toggle()
            }
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
            className={`h-3 w-3 shrink-0 text-muted-foreground transition-transform ${
              node.isOpen ? 'rotate-90' : ''
            }`}
          />
        )}

        {/* File/Folder icon - neutral color */}
        <Icon className='h-4 w-4 shrink-0 text-muted-foreground' />

        {/* Filename */}
        <span className='flex-1 truncate font-mono text-sm text-foreground'>
          {node.data.name}
        </span>

        {/* Status indicators - show if selected, hovered, has status, or has high risk */}
        <div
          className={`flex items-center gap-1 ${
            node.isSelected || isHovered || hasStatus || showReviewIndicator
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100'
          } transition-opacity`}
        >
          {/* Review indicator dot */}
          {reviewStory?.showTreeIndicator && (
            <ReviewIndicator
              story={reviewStory}
              isSelected={node.isSelected}
              isHovered={isHovered}
            />
          )}

          {/* Orphan indicator */}
          {isOrphan && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Ghost className='h-3.5 w-3.5 text-muted-foreground' />
                </TooltipTrigger>
                <TooltipContent side='right'>
                  <p className='text-xs'>Orphan: Not imported by any file</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Circular dependency */}
          {isInCycle && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertTriangle className='h-3.5 w-3.5 text-muted-foreground' />
                </TooltipTrigger>
                <TooltipContent side='right'>
                  <p className='text-xs'>Circular dependency detected</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Broken by simulation */}
          {isBroken && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Bomb className='h-3.5 w-3.5 text-muted-foreground' />
                </TooltipTrigger>
                <TooltipContent side='right'>
                  <p className='text-xs'>
                    Will break if simulated file is deleted
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* New orphan by simulation */}
          {isNewOrphan && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Ghost className='h-3.5 w-3.5 text-muted-foreground' />
                </TooltipTrigger>
                <TooltipContent side='right'>
                  <p className='text-xs'>
                    Will become orphan if simulated file is deleted
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Delete simulation button - only on hover */}
          {node.isLeaf && (
            <div className='opacity-0 transition-opacity group-hover:opacity-100'>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-5 w-5'
                      disabled={isSimulating}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSimulateDelete(node.id)
                      }}
                    >
                      {isSimulating ? (
                        <div className='h-3 w-3 animate-spin rounded-full border-b border-muted-foreground' />
                      ) : (
                        <Trash2 className='h-3 w-3 text-muted-foreground' />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='right'>
                    <p className='text-xs'>Simulate deletion</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>
    )
  })

// Helper component for diagnosis-first review indicator dots
interface ReviewIndicatorProps {
  story: FileReviewStory
  isSelected: boolean
  isHovered: boolean
}

function ReviewIndicator({
  story,
  isSelected,
  isHovered
}: ReviewIndicatorProps) {
  const alwaysShow = story.alwaysShowTreeIndicator

  if (!alwaysShow && !isSelected && !isHovered) {
    return null
  }

  const toneClass: Record<FileReviewStory['badgeTone'], string> = {
    danger: 'bg-red-500',
    warning: 'bg-orange-500',
    info: 'bg-blue-500',
    success: 'bg-green-500'
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-block h-2 w-2 cursor-help rounded-full ${toneClass[story.badgeTone]}`}
          />
        </TooltipTrigger>
        <TooltipContent side='right'>
          <div className='space-y-1'>
            <p className='font-medium'>{story.assessment.title}</p>
            <p className='text-xs text-muted-foreground'>
              {story.assessment.reviewPriority}
            </p>
            <p className='text-xs text-muted-foreground'>{story.shortReason}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface FileTreeViewProps {
  data: FileTreeNode[]
  onFileSelect: (fileId: string | null) => void
  onSimulateDelete?: (fileId: string) => void
  onFileHover?: (fileId: string) => void
}

export interface FileTreeViewRef {
  focusSearch: () => void
  select: (id: string, opts?: { focus?: boolean }) => void
}

export const FileTreeView = forwardRef<FileTreeViewRef, FileTreeViewProps>(
  ({ data, onFileSelect, onSimulateDelete = () => {}, onFileHover }, ref) => {
    const searchBarRef = useRef<FileSearchBarRef>(null)
    const treeRef = useRef<TreeApi<FileTreeNode> | null>(null)

    useImperativeHandle(ref, () => ({
      focusSearch: () => {
        searchBarRef.current?.focus()
      },
      select: (id: string, opts?: { focus?: boolean }) => {
        treeRef.current?.select(id, opts)
      }
    }))

    const {
      hoveredFile,
      setHoveredFile,
      searchQuery,
      filesInCycle,
      orphanFilesSet,
      fileReviewStoryMap,
      brokenFilesSet,
      newOrphansSet,
      isSimulating
    } = useFileAnalysisContext()

    const NodeRenderer = createNodeRenderer(
      filesInCycle,
      orphanFilesSet,
      fileReviewStoryMap,
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
        <div className='flex h-full items-center justify-center text-muted-foreground'>
          <div className='text-center'>
            <Folder className='mx-auto mb-2 h-12 w-12 opacity-50' />
            <p className='text-sm'>No files to display</p>
          </div>
        </div>
      )
    }

    return (
      <div className='flex h-full flex-col bg-background'>
        <div className='shrink-0 border-b border-border px-4 py-3'>
          <span className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
            File Explorer
          </span>
        </div>

        <div className='shrink-0 px-3 py-2'>
          <FileSearchBar ref={searchBarRef} />
        </div>

        <div className='flex-1 overflow-hidden'>
          <div className='h-full px-2 pb-4'>
            <Tree
              ref={treeRef}
              data={data}
              width='100%'
              height={800}
              rowHeight={32}
              indent={16}
              openByDefault={false}
              searchTerm={searchQuery}
              onSelect={(nodes) => {
                const selectedNode: NodeApi<FileTreeNode> | undefined = nodes[0]
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
  }
)
