import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import KaizenListPage from './pages/KaizenListPage'
import KaizenDetailPage from './pages/KaizenDetailPage'
import ActionPlanPage from './pages/ActionPlanPage'
import DashboardListPage from './pages/DashboardListPage'
import AdminPage from './pages/AdminPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen">Caricamento...</div>
  if (!user) return <Navigate to="/login" />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<HomePage />} />
        <Route path="kaizen" element={<KaizenListPage />} />
        <Route path="kaizen/:id" element={<KaizenDetailPage />} />
        <Route path="action-plan" element={<ActionPlanPage />} />
        <Route path="dashboard" element={<DashboardListPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
    </Routes>
  )
}
