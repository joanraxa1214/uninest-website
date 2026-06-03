import { useNavigate } from 'react-router-dom'
import {
  ChevronDown, ArrowRight, Users, Home, TrendingUp, Star
} from 'lucide-react'
import PublicLayout from '../../components/layout/PublicLayout'

const TESTIMONIALS = [
  {
    name: 'Ahmed Raza',
    program: 'BS Computer Science, 3rd Year',
    avatar: 'AR',
    rating: 5,
    review: 'UniNest has been an incredible second home. The study rooms are always quiet and the WiFi never drops even at 2 AM during exam season. The meals are genuinely delicious — just like home-cooked food!',
  },
  {
    name: 'Fatima Malik',
    program: 'MBBS, 2nd Year',
    avatar: 'FM',
    rating: 5,
    review: 'As a medical student I need peace and security. UniNest provides exactly that. The 24/7 security and friendly staff give my parents complete peace of mind. The transport service to the hospital is a lifesaver.',
  },
  {
    name: 'Usman Ghani',
    program: 'BE Electrical Engineering, 4th Year',
    avatar: 'UG',
    rating: 5,
    review: 'Great facilities at an affordable price. The double sharing room is spacious and my roommate and I have become best friends. The management is very responsive to any issues. Highly recommended!',
  },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <PublicLayout>
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-navy-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-3xl" />
        </div>

        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #366bba 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-5 py-2 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-blue-300 text-sm font-medium">Rooms Available for 2024-25 Session</span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-6">
            Your Home,
            <br />
            <span className="text-gradient">Away From Home</span>
          </h1>

          <p className="text-navy-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Premium hostel living designed for Pakistani university students — safe, comfortable, and built to support your academic journey.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => navigate('/rooms')}
              className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-4"
            >
              Browse Rooms <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="btn-outline flex items-center justify-center gap-2 text-base px-8 py-4"
            >
              View Pricing
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { icon: Home, value: '80+', label: 'Total Rooms' },
              { icon: Users, value: '200+', label: 'Happy Students' },
              { icon: TrendingUp, value: '98%', label: 'Satisfaction' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-1">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="font-heading text-2xl font-bold text-white">{value}</div>
                <div className="text-navy-400 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <span className="text-navy-500 text-xs">Scroll</span>
          <ChevronDown className="w-4 h-4 text-navy-500" />
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-3">Student Stories</p>
            <h2 className="section-title">What Our Students Say</h2>
            <p className="section-subtitle">Hear from the students who call UniNest their second home.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card card-hover p-7 flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gold-400 fill-gold-400" />
                  ))}
                </div>

                {/* Review */}
                <p className="text-navy-300 text-sm leading-relaxed mb-6 flex-1 italic">
                  "{t.review}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-navy-700/50">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-navy-400 text-xs">{t.program}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
