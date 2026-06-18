import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import KaizenListPage from './pages/KaizenListPage'
import KaizenDetailPage from './pages/KaizenDetailPage'
import ActionPlanPage from './pages/ActionPlanPage'
import DashboardListPage from './pages/DashboardListPage'
import DashboardDetailPage from './pages/DashboardDetailPage'
import DocumentiPage from './pages/DocumentiPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="kaizen" element={<KaizenListPage />} />
        <Route path="kaizen/:id" element={<KaizenDetailPage />} />
        <Route path="action-plan" element={<ActionPlanPage />} />
        <Route path="dashboard" element={<DashboardListPage />} />
        <Route path="dashboard/:id" element={<DashboardDetailPage />} />
        <Route path="documenti" element={<DocumentiPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
