import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, FileText, ClipboardList, LayoutDashboard, Settings, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Layout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/kaizen', icon: FileText, label: 'Kaizen' },
    { to: '/action-plan', icon: ClipboardList, label: 'Action Plan' },
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin', icon: Settings, label: 'Admin' },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-primary text-white transition-all duration-300 flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-primary-light">
          {sidebarOpen && <h1 className="text-lg font-bold">🏭 SheetKaizen</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:bg-primary-light p-1 rounded">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

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

        <div className="p-4 border-t border-primary-light text-xs text-gray-400">
          {sidebarOpen && 'SheetKaizen v1.0'}
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
