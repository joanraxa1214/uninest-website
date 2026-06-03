import { useEffect, useState } from 'react'
import { BedDouble, Users, CheckCircle2, TrendingUp, TrendingDown, MessageSquare, Wallet } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({ totalRooms: 0, totalStudents: 0, occupiedRooms: 0, availableRooms: 0, totalIncome: 0, totalExpenses: 0 })
  const [chartData, setChartData] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    await Promise.all([fetchStats(), fetchInquiries()])
    setLoading(false)
  }

  async function fetchStats() {
    // Rooms
    const { data: rooms } = await supabase.from('rooms').select('*')
    // Active allocations
    const { data: allocations } = await supabase.from('room_allocations').select('room_id').eq('status', 'active')
    // Students
    const { data: students } = await supabase.from('students').select('id').eq('is_active', true)
    // Payments total
    const { data: payments } = await supabase.from('payments').select('amount').eq('status', 'paid')
    // Expenses total
    const { data: expenses } = await supabase.from('expenses').select('amount')

    const totalRooms = rooms?.length || 0
    const totalStudents = students?.length || 0

    // Rooms that have at least one active allocation
    const occupiedRoomIds = new Set((allocations || []).map(a => a.room_id))
    // A room is "full" when active allocations >= capacity
    let occupiedRooms = 0
    let availableRooms = 0
    ;(rooms || []).forEach(room => {
      const activeCount = (allocations || []).filter(a => a.room_id === room.id).length
      if (activeCount >= room.capacity) {
        occupiedRooms++
      } else {
        availableRooms++
      }
    })

    const totalIncome = (payments || []).reduce((s, p) => s + Number(p.amount), 0)
    const totalExpenses = (expenses || []).reduce((s, e) => s + Number(e.amount), 0)

    // Chart: occupancy per room type
    const types = ['Single Room', 'Double Sharing', 'Triple Sharing']
    const chart = types.map(type => {
      const typeRooms = (rooms || []).filter(r => r.type === type)
      const totalCap = typeRooms.reduce((s, r) => s + r.capacity, 0)
      const filled = typeRooms.reduce((s, r) => {
        return s + (allocations || []).filter(a => a.room_id === r.id).length
      }, 0)
      return { name: type, capacity: totalCap, occupied: Math.min(filled, totalCap), available: Math.max(totalCap - filled, 0) }
    })

    setStats({ totalRooms, totalStudents, occupiedRooms, availableRooms, totalIncome, totalExpenses })
    setChartData(chart)
  }

  async function fetchInquiries() {
    const { data } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false }).limit(5)
    setInquiries(data || [])
  }

  const profit = stats.totalIncome - stats.totalExpenses

  const STAT_CARDS = [
    { label: 'Total Rooms', value: stats.totalRooms, icon: BedDouble, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Active Students', value: stats.totalStudents, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Rooms Available', value: stats.availableRooms, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Total Income', value: `Rs. ${stats.totalIncome.toLocaleString()}`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Total Expenses', value: `Rs. ${stats.totalExpenses.toLocaleString()}`, icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Net Profit', value: `Rs. ${profit.toLocaleString()}`, icon: Wallet, color: profit >= 0 ? 'text-blue-400' : 'text-red-400', bg: profit >= 0 ? 'bg-blue-500/10' : 'bg-red-500/10' },
  ]

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-navy-800 border border-navy-600 rounded-xl p-3 shadow-xl text-sm">
        <p className="text-white font-semibold mb-2">{payload[0]?.payload?.name}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                <XAxis dataKey="name" tick={{ fill: '#9fb6dd', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#9fb6dd', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="capacity" fill="#366bba" radius={[4,4,0,0]} name="Capacity" />
                <Bar dataKey="occupied" fill="#3b82f6" radius={[4,4,0,0]} name="Occupied" />
                <Bar dataKey="available" fill="#10b981" radius={[4,4,0,0]} name="Available" />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-5 mt-3">
            {[['#366bba','Capacity'],['#3b82f6','Occupied'],['#10b981','Available']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{ background: c }} />
                <span className="text-navy-400 text-xs">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Occupancy Rate Donut */}
        <div className="card p-6 flex flex-col items-center justify-center">
          <h3 className="font-heading text-lg font-semibold text-white mb-5 self-start">Occupancy Rate</h3>
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1b3d71" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
                strokeDasharray={`${stats.totalRooms > 0 ? (stats.occupiedRooms / stats.totalRooms * 100).toFixed(1) : 0} 100`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold font-heading text-blue-400">
                {stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0}%
              </p>
              <p className="text-navy-400 text-xs">Full</p>
            </div>
          </div>
          <div className="mt-5 space-y-2 w-full">
            <div className="flex justify-between text-sm">
              <span className="text-navy-400">Full Rooms</span>
              <span className="text-red-400 font-semibold">{stats.occupiedRooms}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-navy-400">Available</span>
              <span className="text-green-400 font-semibold">{stats.availableRooms}</span>
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
