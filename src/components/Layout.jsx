import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, FileText, ClipboardList, LayoutDashboard, Settings, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/kaizen', icon: FileText, label: 'Kaizen' },
    { to: '/action-plan', icon: ClipboardList, label: 'Action Plan' },
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ]

  if (user?.role === 'admin') {
    links.push({ to: '/admin', icon: Settings, label: 'Admin' })
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-primary text-white transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary-light">
          {sidebarOpen && <h1 className="text-lg font-bold">🏭 SheetKaizen</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:bg-primary-light p-1 rounded">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors ${
                  isActive ? 'bg-primary-light text-white' : 'text-gray-300 hover:bg-primary-light hover:text-white'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{link.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-primary-light">
          {sidebarOpen && (
            <div className="mb-2">
              <p className="text-sm font-medium">{user?.full_name}</p>
              <p className="text-xs text-gray-400">{user?.role} — {user?.reparto}</p>
            </div>
          )}
          <button onClick={logout} className="flex items-center gap-2 text-gray-300 hover:text-white text-sm">
            <LogOut size={18} />
            {sidebarOpen && 'Esci'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
