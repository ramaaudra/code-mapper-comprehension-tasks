interface SidebarProps {
  isCollapsed: boolean
  children: React.ReactNode
}

export function Sidebar({ isCollapsed, children }: SidebarProps) {
  return (
    <div
      className={`transition-all duration-200 ease-out overflow-hidden shrink-0 ${isCollapsed ? 'w-0 min-w-0' : 'w-80 border-r border-border bg-background'
        }`}
    >
      {!isCollapsed && children}
    </div>
  )
}

