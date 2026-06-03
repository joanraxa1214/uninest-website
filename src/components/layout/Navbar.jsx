import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Building2 } from 'lucide-react'

const navLinks = [
  { label: 'Home',     to: '/' },
  { label: 'Rooms',    to: '/rooms' },
  { label: 'Pricing',  to: '/pricing' },
  { label: 'Features', to: '/features' },
  { label: 'Contact',  to: '/contact' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass border-b border-navy-700/50 shadow-lg shadow-navy-950/50' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-200">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading text-xl font-bold text-white">
              Uni<span className="text-blue-400">Nest</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium font-body transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'text-white bg-navy-700/60'
                    : 'text-navy-300 hover:text-white hover:bg-navy-700/40'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Admin Login */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/login')}
              className="btn-primary text-sm py-2 px-5"
            >
              Admin Login
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-navy-300 hover:text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-navy-700/50">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium font-body ${
                  location.pathname === link.to
                    ? 'text-white bg-navy-700/60'
                    : 'text-navy-200 hover:text-white hover:bg-navy-700/40'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-navy-700/50 mt-2">
              <button
                onClick={() => { setMobileOpen(false); navigate('/admin/login') }}
                className="btn-primary w-full text-sm"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
