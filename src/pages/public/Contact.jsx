import { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'
import PublicLayout from '../../components/layout/PublicLayout'
import { supabase } from '../../lib/supabase'

const INITIAL_FORM = { name: '', phone: '', email: '', preferred_room: '', message: '' }

export default function ContactPage() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

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
    <PublicLayout>
      <section className="pt-28 pb-24 bg-navy-950">
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
                  <input type="text" name="name" required value={form.name} onChange={handleChange}
                    placeholder="Muhammad Ali" className="input-field" />
                </div>
                <div>
                  <label className="block text-navy-300 text-sm font-medium mb-2">Phone Number *</label>
                  <input type="tel" name="phone" required value={form.phone} onChange={handleChange}
                    placeholder="+92 300 123 4567" className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-navy-300 text-sm font-medium mb-2">Email Address *</label>
                  <input type="email" name="email" required value={form.email} onChange={handleChange}
                    placeholder="student@university.edu.pk" className="input-field" />
                </div>
                <div>
                  <label className="block text-navy-300 text-sm font-medium mb-2">Preferred Room *</label>
                  <select name="preferred_room" required value={form.preferred_room} onChange={handleChange} className="input-field">
                    <option value="">Select room type</option>
                    <option value="Single Room">Single Room — Rs. 8,000/mo</option>
                    <option value="Double Sharing">Double Sharing — Rs. 5,500/mo</option>
                    <option value="Triple Sharing">Triple Sharing — Rs. 4,000/mo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-navy-300 text-sm font-medium mb-2">Message</label>
                <textarea name="message" rows={4} value={form.message} onChange={handleChange}
                  placeholder="Tell us about your requirements, expected check-in date, etc."
                  className="input-field resize-none" />
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-60">
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-5 h-5" /> Send Inquiry</>
                )}
              </button>
            </form>
          </div>

          {/* Alternate Contact */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Call Us', value: '+92 300 123 4567', href: 'tel:+923001234567' },
              { label: 'Email Us', value: 'info@uninest.pk', href: 'mailto:info@uninest.pk' },
              { label: 'Visit Us', value: 'University Road, Multan', href: '#' },
            ].map((item) => (
              <a key={item.label} href={item.href}
                className="card p-4 text-center hover:border-blue-500/50 transition-all duration-200 group">
                <p className="text-navy-400 text-xs mb-1">{item.label}</p>
                <p className="text-blue-300 text-sm font-medium group-hover:text-blue-200">{item.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
