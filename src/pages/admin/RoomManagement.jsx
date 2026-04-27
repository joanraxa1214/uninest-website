import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Save, BedDouble } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const EMPTY = { room_number: '', type: 'Single Room', capacity: 1, price: 8000, status: 'available' }

export default function RoomManagement() {
  const [rooms,   setRooms]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)     // 'add' | 'edit' | false
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState(EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [deleting,setDeleting]= useState(null)

  useEffect(() => { fetchRooms() }, [])

  async function fetchRooms() {
    setLoading(true)
    const { data } = await supabase.from('rooms').select('*').order('room_number')
    setRooms(data || [])
    setLoading(false)
  }

  function openAdd() {
    setForm(EMPTY)
    setEditing(null)
    setModal('add')
  }

  function openEdit(room) {
    setForm({ room_number: room.room_number, type: room.type, capacity: room.capacity, price: room.price, status: room.status })
    setEditing(room.id)
    setModal('edit')
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, price: Number(form.price), capacity: Number(form.capacity) }

    if (modal === 'add') {
      await supabase.from('rooms').insert([payload])
    } else {
      await supabase.from('rooms').update(payload).eq('id', editing)
    }

    setSaving(false)
    setModal(false)
    fetchRooms()
  }

  async function handleDelete(id) {
    setDeleting(id)
    await supabase.from('rooms').delete().eq('id', id)
    setDeleting(null)
    fetchRooms()
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BedDouble className="w-6 h-6 text-blue-400" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Room Management</h1>
            <p className="text-navy-400 text-sm">{rooms.length} rooms total</p>
          </div>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Room
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header text-left">Room No.</th>
                <th className="table-header text-left">Type</th>
                <th className="table-header text-center">Capacity</th>
                <th className="table-header text-right">Price/Month</th>
                <th className="table-header text-center">Status</th>
                <th className="table-header text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="table-cell text-center text-navy-500 py-12">Loading rooms...</td></tr>
              ) : rooms.length === 0 ? (
                <tr><td colSpan={6} className="table-cell text-center text-navy-500 py-12">No rooms yet. Click "Add Room" to get started.</td></tr>
              ) : (
                rooms.map(room => (
                  <tr key={room.id} className="hover:bg-navy-800/30 transition-colors">
                    <td className="table-cell font-semibold text-blue-300">{room.room_number}</td>
                    <td className="table-cell">{room.type}</td>
                    <td className="table-cell text-center text-navy-300">{room.capacity}</td>
                    <td className="table-cell text-right font-semibold">Rs. {Number(room.price).toLocaleString()}</td>
                    <td className="table-cell text-center">
                      <span className={room.status === 'available' ? 'badge-available' : 'badge-occupied'}>
                        {room.status}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(room)}
                          className="w-8 h-8 bg-navy-700 hover:bg-blue-600/30 rounded-lg flex items-center justify-center transition-colors text-navy-400 hover:text-blue-400"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
                          disabled={deleting === room.id}
                          className="w-8 h-8 bg-navy-700 hover:bg-red-600/20 rounded-lg flex items-center justify-center transition-colors text-navy-400 hover:text-red-400 disabled:opacity-50"
                        >
                          {deleting === room.id
                            ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-xl font-bold text-white">
                {modal === 'add' ? 'Add New Room' : 'Edit Room'}
              </h3>
              <button onClick={() => setModal(false)} className="text-navy-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-navy-300 text-sm font-medium mb-2">Room Number *</label>
                <input
                  type="text" required value={form.room_number}
                  onChange={e => setForm({ ...form, room_number: e.target.value })}
                  placeholder="e.g. A-101" className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-navy-300 text-sm font-medium mb-2">Type *</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-field">
                    <option>Single Room</option>
                    <option>Double Sharing</option>
                    <option>Triple Sharing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-navy-300 text-sm font-medium mb-2">Capacity *</label>
                  <input
                    type="number" min={1} max={4} required value={form.capacity}
                    onChange={e => setForm({ ...form, capacity: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-navy-300 text-sm font-medium mb-2">Price (Rs./month) *</label>
                  <input
                    type="number" min={0} required value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-navy-300 text-sm font-medium mb-2">Status *</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field">
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                    : <><Save className="w-4 h-4" /> Save Room</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
