import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'

// Pages
import LandingPage    from './pages/public/LandingPage'
import Login          from './pages/auth/Login'
import Dashboard      from './pages/admin/Dashboard'
import RoomManagement from './pages/admin/RoomManagement'
import Students       from './pages/admin/Students'
import BudgetTracker  from './pages/admin/BudgetTracker'
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
          <Route path="/" element={<LandingPage />} />

          {/* Auth */}
          <Route path="/admin/login" element={<Login />} />

          {/* Admin (Protected) */}
          <Route path="/admin" element={
            <AdminDashboard><Dashboard /></AdminDashboard>
          } />
          <Route path="/admin/rooms" element={
            <AdminDashboard><RoomManagement /></AdminDashboard>
          } />
          <Route path="/admin/students" element={
            <AdminDashboard><Students /></AdminDashboard>
          } />
          <Route path="/admin/budget" element={
            <AdminDashboard><BudgetTracker /></AdminDashboard>
          } />
          <Route path="/admin/pricing" element={
            <AdminDashboard><PricingConfig /></AdminDashboard>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
