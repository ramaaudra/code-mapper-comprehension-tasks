interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className='flex h-dvh min-h-dvh min-h-screen flex-col overflow-hidden bg-background'>
      {children}
    </div>
  )
}
