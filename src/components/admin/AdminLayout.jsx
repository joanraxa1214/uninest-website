import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Building2, LayoutDashboard, BedDouble, Users,
  Wallet, Tag, LogOut, Menu, X, ChevronRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { label: 'Dashboard',       icon: LayoutDashboard, path: '/admin' },
  { label: 'Room Management', icon: BedDouble,        path: '/admin/rooms' },
  { label: 'Students',        icon: Users,            path: '/admin/students' },
  { label: 'Finances',        icon: Wallet,           path: '/admin/finances' },
  { label: 'Pricing',         icon: Tag,              path: '/admin/pricing' },
]

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-navy-700/50">
        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-heading text-lg font-bold text-white leading-none">
            Uni<span className="text-blue-400">Nest</span>
          </p>
          <p className="text-navy-500 text-xs">Admin Dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const isActive = path === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(path)

          return (
            <button
              key={label}
              onClick={() => { navigate(path); setSidebarOpen(false) }}
              className={`w-full flex items-center justify-between group ${isActive ? 'sidebar-link-active' : 'sidebar-link'}`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm">{label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-blue-400 opacity-70" />}
            </button>
          )
        })}
      </nav>

      {/* User + Sign Out */}
      <div className="px-3 py-4 border-t border-navy-700/50">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-blue-600/30 rounded-full flex items-center justify-center border border-blue-500/30">
            <span className="text-blue-300 text-xs font-bold">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.email || 'Admin'}</p>
            <p className="text-navy-500 text-xs">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-navy-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-navy-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy-900 border-r border-navy-700/50 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 flex flex-col w-72 bg-navy-900 border-r border-navy-700/50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-navy-900 border-b border-navy-700/50 flex items-center justify-between px-6 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-navy-400 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 lg:flex-none">
            <h2 className="font-heading text-lg font-semibold text-white ml-3 lg:ml-0">
              {NAV_ITEMS.find(n =>
                n.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(n.path)
              )?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-navy-400 text-sm hidden sm:block">{user?.email}</span>
            <div className="w-8 h-8 bg-blue-600/30 rounded-full flex items-center justify-center border border-blue-500/30">
              <span className="text-blue-300 text-sm font-bold">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
