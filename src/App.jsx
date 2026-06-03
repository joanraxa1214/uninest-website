import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'

// Public Pages
import HomePage       from './pages/public/Home'
import FeaturesPage   from './pages/public/Features'
import RoomsPage      from './pages/public/Rooms'
import PricingPage    from './pages/public/Pricing'
import ContactPage    from './pages/public/Contact'

// Auth
import Login from './pages/auth/Login'

// Admin Pages
import Dashboard      from './pages/admin/Dashboard'
import RoomManagement from './pages/admin/RoomManagement'
import Students       from './pages/admin/Students'
import Finances       from './pages/admin/Finances'
import PricingConfig  from './pages/admin/PricingConfig'

function AdminDashboard({ children }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Auth */}
          <Route path="/admin/login" element={<Login />} />

          {/* Admin (Protected) */}
          <Route path="/admin" element={<AdminDashboard><Dashboard /></AdminDashboard>} />
          <Route path="/admin/rooms" element={<AdminDashboard><RoomManagement /></AdminDashboard>} />
          <Route path="/admin/students" element={<AdminDashboard><Students /></AdminDashboard>} />
          <Route path="/admin/finances" element={<AdminDashboard><Finances /></AdminDashboard>} />
          <Route path="/admin/pricing" element={<AdminDashboard><PricingConfig /></AdminDashboard>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
