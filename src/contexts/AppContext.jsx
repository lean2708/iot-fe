import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [classroomId, setClassroomId] = useState('classroom-101')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const value = useMemo(
    () => ({
      darkMode,
      setDarkMode,
      currentPage,
      setCurrentPage,
      classroomId,
      setClassroomId,
      user: {
        fullName: 'Admin User',
        status: 'System Online',
      },
    }),
    [classroomId, currentPage, darkMode],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider')
  }
  return context
}
