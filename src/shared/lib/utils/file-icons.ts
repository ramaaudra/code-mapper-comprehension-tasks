import {
  File,
  FileCode,
  FileCss,
  FileHtml,
  FileJs,
  FileJsx,
  FileMd,
  FileTs,
  FileTsx,
  FileVue
} from '@/shared/components/ui/icons'

// Icon component type
type IconComponent = React.ComponentType<{ className?: string }>

/**
 * Get the appropriate icon component based on file extension
 */
export function getFileIcon(fileName: string): IconComponent {
  const extension = fileName.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'ts':
      return FileTs
    case 'tsx':
      return FileTsx
    case 'js':
      return FileJs
    case 'jsx':
      return FileJsx
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return FileCss
    case 'html':
    case 'htm':
      return FileHtml
    case 'md':
    case 'mdx':
      return FileMd
    case 'vue':
      return FileVue
    case 'json':
    case 'svg':
    case 'svelte':
      return FileCode
    default:
      return File
  }
}
