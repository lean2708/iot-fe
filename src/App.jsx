import { useMemo } from 'react'
import { AppProvider, useAppContext } from './contexts/AppContext'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardPage from './pages/DashboardPage'
import DataSensorPage from './pages/DataSensorPage'
import HistoryPage from './pages/HistoryPage'
import ProfilePage from './pages/ProfilePage'
import './App.css'

function AppContent() {
  const { currentPage } = useAppContext()

  const currentScreen = useMemo(() => {
    if (currentPage === 'data-sensor') return <DataSensorPage />
    if (currentPage === 'history') return <HistoryPage />
    if (currentPage === 'profile') return <ProfilePage />
    return <DashboardPage />
  }, [currentPage])

  return <DashboardLayout>{currentScreen}</DashboardLayout>
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
