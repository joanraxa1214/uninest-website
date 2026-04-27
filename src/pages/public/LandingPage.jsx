import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wifi, UtensilsCrossed, ShieldCheck, BookOpen,
  WashingMachine, Wind, Bath, Bus,
  Star, ChevronDown, CheckCircle2, Send,
  ArrowRight, Users, Home, TrendingUp
} from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { supabase } from '../../lib/supabase'

// ─── DATA ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: Wifi,            title: 'High-Speed WiFi',   desc: 'Fiber-optic internet in every room and common area, perfect for online studying.' },
  { icon: UtensilsCrossed, title: 'Meals Included',    desc: 'Fresh, home-cooked Pakistani meals served thrice daily in the dining hall.' },
  { icon: ShieldCheck,     title: '24/7 Security',     desc: 'CCTV surveillance, security guards, and biometric entry for complete safety.' },
  { icon: BookOpen,        title: 'Study Rooms',       desc: 'Dedicated silent study halls with whiteboards, available around the clock.' },
  { icon: WashingMachine,  title: 'Laundry Service',   desc: 'Coin-operated washing machines and dryers available in every building.' },
  { icon: Wind,            title: 'Air Conditioning',  desc: 'Individual AC units in every room for year-round comfort.' },
  { icon: Bath,            title: 'Clean Bathrooms',   desc: 'Attached and shared bathrooms cleaned and sanitized twice daily.' },
  { icon: Bus,             title: 'Transport',         desc: 'Free shuttle service to and from the university campus daily.' },
]

const ROOMS = [
  {
    type: 'Single Room',
    price: 8000,
    capacity: 1,
    tag: 'Most Private',
    tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    highlight: true,
    amenities: ['Private room', 'Attached bathroom', 'Individual AC', 'Study desk', 'Wardrobe', 'High-speed WiFi'],
    image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=1000'
  },
  {
    type: 'Double Sharing',
    price: 5500,
    capacity: 2,
    tag: 'Most Popular',
    tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    highlight: false,
    amenities: ['Shared with 1 student', 'Shared bathroom', 'Individual AC', 'Two study desks', 'Personal wardrobe', 'High-speed WiFi'],
    image_url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=1000'
  },
  {
    type: 'Triple Sharing',
    price: 4000,
    capacity: 3,
    tag: 'Best Value',
    tagColor: 'bg-green-500/20 text-green-300 border-green-500/30',
    highlight: false,
    amenities: ['Shared with 2 students', 'Shared bathroom', 'Ceiling fans', 'Study table', 'Shared storage', 'High-speed WiFi'],
    image_url: 'https://images.unsplash.com/photo-1555854817-9160601df5f9?auto=format&fit=crop&q=80&w=1000'
  },
]

const PRICING_FEATURES = [
  'Monthly Rent',
  'Security Deposit',
  'Meals (3x daily)',
  'WiFi',
  'AC',
  'Attached Bathroom',
  'Laundry Access',
  'Study Room Access',
  'Transport',
  'Security Guard',
]

const PRICING_DATA = {
  'Single Room':    ['Rs. 8,000', 'Rs. 10,000', '✓', '✓', '✓', '✓', '✓', '✓', '✓', '✓'],
  'Double Sharing': ['Rs. 5,500', 'Rs. 8,000',  '✓', '✓', '✓', '✗', '✓', '✓', '✓', '✓'],
  'Triple Sharing': ['Rs. 4,000', 'Rs. 6,000',  '✓', '✓', '✗', '✗', '✓', '✓', '✓', '✓'],
}

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

// ─── INQUIRY FORM INITIAL STATE ───────────────────────────────────────────────
const INITIAL_FORM = { name: '', phone: '', email: '', preferred_room: '', message: '' }

// ─── SECTION COMPONENTS ───────────────────────────────────────────────────────

function HeroSection() {
  const scrollTo = (href) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient"
    >
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
            onClick={() => scrollTo('#rooms')}
            className="btn-primary flex items-center justify-center gap-2 text-base px-8 py-4"
          >
            Browse Rooms <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollTo('#pricing')}
            className="btn-outline flex items-center justify-center gap-2 text-base px-8 py-4"
          >
            View Pricing
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { icon: Home,      value: '80+',  label: 'Total Rooms' },
            { icon: Users,     value: '200+', label: 'Happy Students' },
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
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-3">World-Class Facilities</p>
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-subtitle">Modern amenities to make your hostel stay comfortable, productive, and enjoyable.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card card-hover p-6 group">
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition-colors duration-300">
                <Icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-navy-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function RoomsSection() {
  const scrollTo = (href) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="rooms" className="py-24 bg-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-3">Accommodation Options</p>
          <h2 className="section-title">Choose Your Room</h2>
          <p className="section-subtitle">Flexible accommodation options to suit every budget and lifestyle preference.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROOMS.map((room) => (
            <div
              key={room.type}
              className={`card card-hover p-7 relative ${room.highlight ? 'border-blue-500/50 glow-blue' : ''}`}
            >
              {room.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg shadow-blue-600/40">
                    PREMIUM CHOICE
                  </span>
                </div>
              )}

              {room.image_url && (
                <div className="w-full h-48 mb-5 rounded-lg overflow-hidden relative group">
                  <div className="absolute inset-0 bg-navy-900/20 group-hover:bg-transparent transition-colors duration-300 z-10"/>
                  <img src={room.image_url} alt={room.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                </div>
              )}

              <div className="mb-5">
                <span className={`text-xs font-semibold border px-3 py-1 rounded-full ${room.tagColor}`}>
                  {room.tag}
                </span>
              </div>

              <h3 className="font-heading text-2xl font-bold text-white mb-1">{room.type}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-blue-400 font-heading">
                  Rs. {room.price.toLocaleString()}
                </span>
                <span className="text-navy-400 text-sm">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                {room.amenities.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-navy-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => scrollTo('#contact')}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 active:scale-95 ${
                  room.highlight
                    ? 'btn-primary'
                    : 'bg-navy-700 hover:bg-navy-600 text-white border border-navy-600 hover:border-navy-500'
                }`}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingTable() {
  const roomTypes = Object.keys(PRICING_DATA)

  return (
    <section id="pricing" className="py-24 bg-navy-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-3">Transparent Pricing</p>
          <h2 className="section-title">Compare Room Plans</h2>
          <p className="section-subtitle">See exactly what's included in each accommodation option.</p>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-navy-800">
                  <th className="table-header text-left rounded-tl-2xl w-44">Features</th>
                  {roomTypes.map((type, i) => (
                    <th key={type} className={`table-header text-center ${i === roomTypes.length - 1 ? 'rounded-tr-2xl' : ''}`}>
                      {type}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRICING_FEATURES.map((feature, rowIdx) => (
                  <tr
                    key={feature}
                    className={rowIdx % 2 === 0 ? 'bg-navy-900/50' : 'bg-navy-900/20'}
                  >
                    <td className="table-cell font-medium text-navy-200">{feature}</td>
                    {roomTypes.map((type) => {
                      const val = PRICING_DATA[type][rowIdx]
                      const isCheck = val === '✓'
                      const isCross = val === '✗'
                      return (
                        <td key={type} className="table-cell text-center">
                          {isCheck ? (
                            <span className="text-green-400 font-bold text-lg">✓</span>
                          ) : isCross ? (
                            <span className="text-navy-600 font-bold text-lg">✗</span>
                          ) : (
                            <span className="text-blue-300 font-semibold">{val}</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
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
  )
}

function ContactSection() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null) // 'success' | 'error'

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    const { error } = await supabase.from('inquiries').insert([{
      name: form.name,
      phone: form.phone,
      email: form.email,
      preferred_room: form.preferred_room,
      message: form.message,
    }])

    setLoading(false)
    if (error) {
      console.error('Inquiry error:', error)
      setStatus('error')
    } else {
      setStatus('success')
      setForm(INITIAL_FORM)
    }
  }

  return (
    <section id="contact" className="py-24 bg-navy-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-blue-400 font-semibold text-sm uppercase tracking-widest mb-3">Get In Touch</p>
          <h2 className="section-title">Book Your Stay</h2>
          <p className="section-subtitle">Fill in the form below and our team will get back to you within 24 hours.</p>
        </div>

        <div className="card p-8">
          {status === 'success' && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
              <p className="text-green-300 text-sm">Your inquiry has been sent! We'll contact you shortly.</p>
            </div>
          )}
          {status === 'error' && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-300 text-sm">Something went wrong. Please try again or call us directly.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-navy-300 text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text" name="name" required value={form.name} onChange={handleChange}
                  placeholder="Muhammad Ali"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-navy-300 text-sm font-medium mb-2">Phone Number *</label>
                <input
                  type="tel" name="phone" required value={form.phone} onChange={handleChange}
                  placeholder="+92 300 123 4567"
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-navy-300 text-sm font-medium mb-2">Email Address *</label>
                <input
                  type="email" name="email" required value={form.email} onChange={handleChange}
                  placeholder="student@university.edu.pk"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-navy-300 text-sm font-medium mb-2">Preferred Room *</label>
                <select
                  name="preferred_room" required value={form.preferred_room} onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select room type</option>
                  <option value="Single Room">Single Room — Rs. 8,000/mo</option>
                  <option value="Double Sharing">Double Sharing — Rs. 5,500/mo</option>
                  <option value="Triple Sharing">Triple Sharing — Rs. 4,000/mo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-navy-300 text-sm font-medium mb-2">Message</label>
              <textarea
                name="message" rows={4} value={form.message} onChange={handleChange}
                placeholder="Tell us about your requirements, expected check-in date, etc."
                className="input-field resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Inquiry
                </>
              )}
            </button>
          </form>
        </div>

        {/* Alternate Contact */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Call Us',    value: '+92 300 123 4567', href: 'tel:+923001234567' },
            { label: 'Email Us',   value: 'info@uninest.pk',  href: 'mailto:info@uninest.pk' },
            { label: 'Visit Us',   value: 'University Road, Multan', href: '#' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="card p-4 text-center hover:border-blue-500/50 transition-all duration-200 group"
            >
              <p className="text-navy-400 text-xs mb-1">{item.label}</p>
              <p className="text-blue-300 text-sm font-medium group-hover:text-blue-200">{item.value}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-950">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <RoomsSection />
      <PricingTable />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </div>
  )
}
