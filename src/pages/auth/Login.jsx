import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Building2, Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const { signIn } = useAuth()
  const navigate   = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await signIn(form.email, form.password)

    if (authError) {
      console.error("Login Error:", authError);
      setError(authError.message || 'Invalid credentials. Please check your email and password.')
      setLoading(false)
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-navy-500/20 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, #366bba 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to Site */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-navy-400 hover:text-blue-400 transition-colors duration-200 mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to UniNest
        </Link>

        {/* Card */}
        <div className="card p-8 border-navy-600/50 glow-blue">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/40">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-white leading-none">
                Uni<span className="text-blue-400">Nest</span>
              </p>
              <p className="text-navy-400 text-xs mt-0.5">Admin Portal</p>
            </div>
          </div>

          <h1 className="font-heading text-2xl font-bold text-white text-center mb-2">Welcome Back</h1>
          <p className="text-navy-400 text-sm text-center mb-8">Sign in to access the admin dashboard</p>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-navy-300 text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@uninest.pk"
                  className="input-field pl-11"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-navy-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 hover:text-navy-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Hint */}
            <p className="text-navy-500 text-xs">
              Use your registered Supabase admin email and password.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-navy-700/50 text-center">
            <p className="text-navy-500 text-xs">
              Admin access only. For room inquiries, please visit the{' '}
              <Link to="/#contact" className="text-blue-400 hover:underline">contact page</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
