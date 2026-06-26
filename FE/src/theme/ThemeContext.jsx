import { createContext, useContext, useState } from 'react'
import { themes } from '../theme/tokens.js'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState('light')

  const colors = themes[themeName] ?? themes.light

  const toggleTheme = () => {
    setThemeName(prev => prev === 'light' ? 'dark' : 'light')
  }

  const setTheme = (name) => {
    if (themes[name]) setThemeName(name)
  }

  return (
    <ThemeContext.Provider value={{ colors, themeName, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}