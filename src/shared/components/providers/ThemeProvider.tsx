import { createContext, useContext } from 'react'

type Theme = 'dark'

type ThemeProviderProps = {
  children: React.ReactNode
}

interface ThemeProviderState {
  theme: Theme
}

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: 'dark'
})

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const value: ThemeProviderState = {
    theme: 'dark'
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
