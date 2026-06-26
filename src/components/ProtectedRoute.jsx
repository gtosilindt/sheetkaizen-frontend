import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requireRole = null }) {
  const { user, loading } = useAuth()

  // Aspetta che il contesto auth sia caricato
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Caricamento...</div>
      </div>
    )
  }

  // Non loggato → redirect a login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Se richiede ruolo specifico, verifica
  if (requireRole) {
    const roleHierarchy = { admin: 4, manager: 3, office: 2, operator: 1 }
    const userLevel = roleHierarchy[user.role] || 0
    const requiredLevel = roleHierarchy[requireRole] || 0

    if (userLevel < requiredLevel) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow p-12 text-center max-w-md">
            <h2 className="text-2xl font-bold mb-2">Accesso negato</h2>
            <p className="text-gray-500">
              Questa pagina richiede il ruolo <strong>{requireRole}</strong>.
              <br />
              Il tuo ruolo attuale è <strong>{user.role}</strong>.
            </p>
          </div>
        </div>
      )
    }
  }

  return children
}
