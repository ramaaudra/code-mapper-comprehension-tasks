import { Search } from '@/shared/components/ui/icons'
import { Input } from '@/shared/components/ui/input'

import { useFileAnalysisContext } from '../context/FileAnalysisContext'

export function FileSearchBar() {
  const { searchQuery, setSearchQuery } = useFileAnalysisContext()

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        type="text"
        placeholder="Cari file..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
      />
    </div>
  )
}
