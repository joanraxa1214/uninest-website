import { useEffect, useState } from 'react'
import { BedDouble, Users, CheckCircle2, TrendingUp, MessageSquare } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { supabase } from '../../lib/supabase'

const CHART_COLORS = { 'Single Room': '#3b82f6', 'Double Sharing': '#8b5cf6', 'Triple Sharing': '#10b981' }

export default function Dashboard() {
  const [stats,      setStats]     = useState({ total: 0, occupied: 0, available: 0, revenue: 0 })
  const [chartData,  setChartData] = useState([])
  const [inquiries,  setInquiries] = useState([])
  const [loading,    setLoading]   = useState(true)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    await Promise.all([fetchStats(), fetchInquiries()])
    setLoading(false)
  }

  async function fetchStats() {
    const { data: rooms } = await supabase.from('rooms').select('*')
    if (!rooms) return

    const total     = rooms.length
    const occupied  = rooms.filter(r => r.status === 'occupied').length
    const available = rooms.filter(r => r.status === 'available').length

    // revenue: sum prices of occupied rooms (using pricing table if possible)
    const { data: pricing } = await supabase.from('pricing').select('*')
    let revenue = 0
    rooms.filter(r => r.status === 'occupied').forEach(room => {
      const p = pricing?.find(p => p.room_type === room.type)
      revenue += p?.monthly_price || room.price || 0
    })

    // chart data per room type
    const types = ['Single Room', 'Double Sharing', 'Triple Sharing']
    const chart = types.map(type => ({
      name: type.replace(' Sharing', '\nSharing').replace('Single ', 'Single\n'),
      label: type,
      total:    rooms.filter(r => r.type === type).length,
      occupied: rooms.filter(r => r.type === type && r.status === 'occupied').length,
      available:rooms.filter(r => r.type === type && r.status === 'available').length,
    }))

    setStats({ total, occupied, available, revenue })
    setChartData(chart)
  }

  async function fetchInquiries() {
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    setInquiries(data || [])
  }

  const STAT_CARDS = [
    { label: 'Total Rooms',    value: stats.total,     icon: BedDouble,    color: 'text-blue-400',   bg: 'bg-blue-500/10' },
    { label: 'Occupied',       value: stats.occupied,  icon: Users,        color: 'text-red-400',    bg: 'bg-red-500/10'  },
    { label: 'Available',      value: stats.available, icon: CheckCircle2, color: 'text-green-400',  bg: 'bg-green-500/10'},
    { label: 'Monthly Revenue',value: `Rs. ${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-gold-400', bg: 'bg-yellow-500/10'},
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-navy-800 border border-navy-600 rounded-xl p-3 shadow-xl text-sm">
        <p className="text-white font-semibold mb-2">{payload[0]?.payload?.label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <p className="text-navy-400 text-xs mb-1">{label}</p>
              <p className={`text-2xl font-bold font-heading ${color}`}>{loading ? '—' : value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-heading text-lg font-semibold text-white mb-5">Occupancy by Room Type</h3>
          {loading ? (
            <div className="h-56 flex items-center justify-center text-navy-500">Loading chart...</div>
          ) : chartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-navy-500">No room data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#244d8a" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#9fb6dd', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#9fb6dd', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total"    fill="#366bba" radius={[4,4,0,0]} name="Total"    />
                <Bar dataKey="occupied" fill="#3b82f6" radius={[4,4,0,0]} name="Occupied" />
                <Bar dataKey="available" fill="#10b981" radius={[4,4,0,0]} name="Available" />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-5 mt-3">
            {[['#366bba','Total'],['#3b82f6','Occupied'],['#10b981','Available']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ background: c }} />
                <span className="text-navy-400 text-xs">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Occupancy Rate Donut Placeholder */}
        <div className="card p-6 flex flex-col items-center justify-center">
          <h3 className="font-heading text-lg font-semibold text-white mb-5 self-start">Occupancy Rate</h3>
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1b3d71" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#3b82f6" strokeWidth="3"
                strokeDasharray={`${stats.total > 0 ? (stats.occupied / stats.total * 100).toFixed(1) : 0} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold font-heading text-blue-400">
                {stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0}%
              </p>
              <p className="text-navy-400 text-xs">Occupied</p>
            </div>
          </div>
          <div className="mt-5 space-y-2 w-full">
            <div className="flex justify-between text-sm">
              <span className="text-navy-400">Occupied</span>
              <span className="text-red-400 font-semibold">{stats.occupied}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-navy-400">Available</span>
              <span className="text-green-400 font-semibold">{stats.available}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Inquiries */}
      <div className="card">
        <div className="flex items-center gap-3 p-5 border-b border-navy-700/50">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          <h3 className="font-heading text-lg font-semibold text-white">Recent Inquiries</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-navy-500">Loading...</div>
        ) : inquiries.length === 0 ? (
          <div className="p-8 text-center text-navy-500">No inquiries yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header text-left">Name</th>
                  <th className="table-header text-left">Phone</th>
                  <th className="table-header text-left">Preferred Room</th>
                  <th className="table-header text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-navy-800/30 transition-colors">
                    <td className="table-cell font-medium">{inq.name}</td>
                    <td className="table-cell text-navy-300">{inq.phone}</td>
                    <td className="table-cell">
                      <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold px-2 py-1 rounded-full">
                        {inq.preferred_room}
                      </span>
                    </td>
                    <td className="table-cell text-navy-400 text-xs">
                      {new Date(inq.created_at).toLocaleDateString('en-PK')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
