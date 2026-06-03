import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Save, BedDouble } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const EMPTY = { room_number: '', type: 'Single Room', capacity: 1 }

export default function RoomManagement() {
  const [rooms, setRooms] = useState([])
  const [allocations, setAllocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => { fetchRooms() }, [])

  async function fetchRooms() {
    setLoading(true)
    const [{ data: r }, { data: a }] = await Promise.all([
      supabase.from('rooms').select('*').order('room_number'),
      supabase.from('room_allocations').select('room_id').eq('status', 'active'),
    ])
    setRooms(r || [])
    setAllocations(a || [])
    setLoading(false)
  }

  function getOcc(roomId, cap) {
    const n = (allocations || []).filter(a => a.room_id === roomId).length
    return { n, full: n >= cap }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const p = { ...form, capacity: Number(form.capacity) }
    if (modal === 'add') await supabase.from('rooms').insert([p])
    else await supabase.from('rooms').update(p).eq('id', editing)
    setSaving(false); setModal(false); fetchRooms()
  }

  async function handleDelete(id) {
    setDeleting(id)
    const { error } = await supabase.from('rooms').delete().eq('id', id)
    if (error) alert('Cannot delete: ' + error.message)
    setDeleting(null); fetchRooms()
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BedDouble className="w-6 h-6 text-blue-400" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Room Management</h1>
            <p className="text-navy-400 text-sm">{rooms.length} rooms total</p>
          </div>
        </div>
        <button onClick={() => { setForm(EMPTY); setEditing(null); setModal('add') }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Room
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>
              <th className="table-header text-left">Room No.</th>
              <th className="table-header text-left">Type</th>
              <th className="table-header text-center">Capacity</th>
              <th className="table-header text-center">Occupancy</th>
              <th className="table-header text-center">Status</th>
              <th className="table-header text-center">Actions</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="table-cell text-center text-navy-500 py-12">Loading...</td></tr>
              ) : rooms.length === 0 ? (
                <tr><td colSpan={6} className="table-cell text-center text-navy-500 py-12">No rooms yet.</td></tr>
              ) : rooms.map(room => {
                const { n, full } = getOcc(room.id, room.capacity)
                return (
                  <tr key={room.id} className="hover:bg-navy-800/30 transition-colors">
                    <td className="table-cell font-semibold text-blue-300">{room.room_number}</td>
                    <td className="table-cell">{room.type}</td>
                    <td className="table-cell text-center text-navy-300">{room.capacity}</td>
                    <td className="table-cell text-center"><span className={`font-semibold ${full ? 'text-red-400' : 'text-green-400'}`}>{n}/{room.capacity}</span></td>
                    <td className="table-cell text-center">
                      <span className={full ? 'bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold px-2 py-1 rounded-full' : 'bg-green-500/20 text-green-300 border border-green-500/30 text-xs font-semibold px-2 py-1 rounded-full'}>
                        {full ? 'Full' : 'Available'}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setForm({ room_number: room.room_number, type: room.type, capacity: room.capacity }); setEditing(room.id); setModal('edit') }}
                          className="w-8 h-8 bg-navy-700 hover:bg-blue-600/30 rounded-lg flex items-center justify-center transition-colors text-navy-400 hover:text-blue-400"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(room.id)} disabled={deleting === room.id}
                          className="w-8 h-8 bg-navy-700 hover:bg-red-600/20 rounded-lg flex items-center justify-center transition-colors text-navy-400 hover:text-red-400 disabled:opacity-50">
                          {deleting === room.id ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-xl font-bold text-white">{modal === 'add' ? 'Add New Room' : 'Edit Room'}</h3>
              <button onClick={() => setModal(false)} className="text-navy-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="block text-navy-300 text-sm font-medium mb-2">Room Number *</label>
                <input type="text" required value={form.room_number} onChange={e => setForm({ ...form, room_number: e.target.value })} placeholder="e.g. A-101" className="input-field" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-navy-300 text-sm font-medium mb-2">Type *</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-field">
                    <option>Single Room</option><option>Double Sharing</option><option>Triple Sharing</option>
                  </select></div>
                <div><label className="block text-navy-300 text-sm font-medium mb-2">Capacity *</label>
                  <input type="number" min={1} max={4} required value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className="input-field" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
