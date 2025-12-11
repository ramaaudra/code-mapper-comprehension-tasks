interface SidebarProps {
  isCollapsed: boolean
  children: React.ReactNode
}

export function Sidebar({ isCollapsed, children }: SidebarProps) {
  return (
    <div
      className={`transition-all duration-200 ease-out overflow-hidden shrink-0 ${
        isCollapsed
          ? 'w-0 min-w-0'
          : 'w-80 border-r border-slate-200 dark:border-slate-800'
      }`}
    >
      {!isCollapsed && children}
    </div>
  )
}
