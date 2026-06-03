import { useEffect, useState } from 'react'
import { Save, Tag, RefreshCw, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const DEFAULT_PRICING = [
  { room_type: 'Single Room',    monthly_rent: 8000, security_deposit: 10000 },
  { room_type: 'Double Sharing', monthly_rent: 5500, security_deposit: 8000  },
  { room_type: 'Triple Sharing', monthly_rent: 4000, security_deposit: 6000  },
]

const ROOM_ICONS = {
  'Single Room':    { emoji: '🛏️', desc: '1 student per room, private bathroom, full AC' },
  'Double Sharing': { emoji: '🛏🛏', desc: '2 students per room, shared bathroom, AC' },
  'Triple Sharing': { emoji: '🛏🛏🛏', desc: '3 students per room, shared bathroom, fans' },
}

export default function PricingConfig() {
  const [pricing,  setPricing]  = useState(DEFAULT_PRICING.map(p => ({ ...p })))
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  useEffect(() => { fetchPricing() }, [])

  async function fetchPricing() {
    setLoading(true)
    const { data } = await supabase.from('pricing').select('*')

    if (data && data.length > 0) {
      // Merge DB data with defaults
      const merged = DEFAULT_PRICING.map(def => {
        const found = data.find(d => d.room_type === def.room_type)
        return found ? { ...def, ...found } : def
      })
      setPricing(merged)
    }
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)

    for (const item of pricing) {
      const { data: existing } = await supabase
        .from('pricing')
        .select('id')
        .eq('room_type', item.room_type)
        .single()

      if (existing?.id) {
        await supabase.from('pricing').update({
          monthly_rent:     Number(item.monthly_rent),
          security_deposit: Number(item.security_deposit),
        }).eq('id', existing.id)
      } else {
        await supabase.from('pricing').insert([{
          room_type:        item.room_type,
          monthly_rent:     Number(item.monthly_rent),
          security_deposit: Number(item.security_deposit),
        }])
      }
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    fetchPricing()
  }

  const updateField = (idx, field, val) => {
    const updated = [...pricing]
    updated[idx] = { ...updated[idx], [field]: val }
    setPricing(updated)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Tag className="w-6 h-6 text-blue-400" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Pricing Configuration</h1>
            <p className="text-navy-400 text-sm">Update monthly prices and security deposits</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchPricing}
            className="btn-outline flex items-center gap-2 text-sm py-2 px-4"
          >
            <RefreshCw className="w-4 h-4" /> Reload
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            ) : saved ? (
              <><CheckCircle2 className="w-4 h-4" /> Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save All Prices</>
            )}
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {saved && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <p className="text-green-300 text-sm">Prices updated successfully! The public landing page will reflect these changes.</p>
        </div>
      )}

      {/* Note */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p className="text-blue-300 text-sm">
          💡 Changes made here are saved to the database and will be reflected on the public pricing page when integrated.
        </p>
      </div>

      {/* Pricing Cards */}
      {loading ? (
        <div className="text-center text-navy-500 py-16">Loading prices...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricing.map((item, idx) => {
            const meta = ROOM_ICONS[item.room_type]
            return (
              <div key={item.room_type} className="card p-6 card-hover">
                {/* Room Icon & Name */}
                <div className="text-3xl mb-3">{meta?.emoji}</div>
                <h3 className="font-heading text-xl font-bold text-white mb-1">{item.room_type}</h3>
                <p className="text-navy-400 text-sm mb-6">{meta?.desc}</p>

                {/* Monthly Price */}
                <div className="mb-5">
                  <label className="block text-navy-300 text-sm font-medium mb-2">
                    Monthly Rent <span className="text-navy-500">(Rs.)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm font-semibold">Rs.</span>
                    <input
                      type="number" min={0}
                      value={item.monthly_rent}
                      onChange={e => updateField(idx, 'monthly_rent', e.target.value)}
                      className="input-field pl-10 text-blue-300 font-semibold text-lg"
                    />
                  </div>
                  <p className="text-navy-500 text-xs mt-1">
                    Per student per month
                  </p>
                </div>

                {/* Security Deposit */}
                <div>
                  <label className="block text-navy-300 text-sm font-medium mb-2">
                    Security Deposit <span className="text-navy-500">(Rs.)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 text-sm font-semibold">Rs.</span>
                    <input
                      type="number" min={0}
                      value={item.security_deposit}
                      onChange={e => updateField(idx, 'security_deposit', e.target.value)}
                      className="input-field pl-10 text-gold-400 font-semibold text-lg"
                    />
                  </div>
                  <p className="text-navy-500 text-xs mt-1">
                    One-time refundable deposit
                  </p>
                </div>

                {/* Preview */}
                <div className="mt-5 pt-5 border-t border-navy-700/50 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-400">Monthly</span>
                    <span className="text-blue-300 font-semibold">Rs. {Number(item.monthly_rent).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-400">Security</span>
                    <span className="text-gold-400 font-semibold">Rs. {Number(item.security_deposit).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-navy-300">1st Month Total</span>
                    <span className="text-white">Rs. {(Number(item.monthly_rent) + Number(item.security_deposit)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
