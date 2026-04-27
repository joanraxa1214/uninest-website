import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Save, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const EMPTY = { name: '', cnic: '', phone: '', room_id: '', checkin_date: '', payment_status: 'pending' }

export default function Students() {
  const [students, setStudents] = useState([])
  const [rooms,    setRooms]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: s }, { data: r }] = await Promise.all([
      supabase.from('students').select('*, rooms(room_number, type)').order('name'),
      supabase.from('rooms').select('id, room_number, type, status').order('room_number'),
    ])
    setStudents(s || [])
    setRooms(r || [])
    setLoading(false)
  }

  function openAdd() {
    setForm(EMPTY)
    setEditing(null)
    setModal('add')
  }

  function openEdit(student) {
    setForm({
      name: student.name || '',
      cnic: student.cnic || '',
      phone: student.phone || '',
      room_id: student.room_id || '',
      checkin_date: student.checkin_date || '',
      payment_status: student.payment_status || 'pending',
    })
    setEditing(student.id)
    setModal('edit')
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, room_id: form.room_id || null }

    if (modal === 'add') {
      await supabase.from('students').insert([payload])
    } else {
      await supabase.from('students').update(payload).eq('id', editing)
    }

    setSaving(false)
    setModal(false)
    fetchAll()
  }

  async function handleDelete(id) {
    setDeleting(id)
    await supabase.from('students').delete().eq('id', id)
    setDeleting(null)
    fetchAll()
  }

  const formatCNIC = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 13)
    if (digits.length <= 5) return digits
    if (digits.length <= 12) return `${digits.slice(0,5)}-${digits.slice(5)}`
    return `${digits.slice(0,5)}-${digits.slice(5,12)}-${digits.slice(12)}`
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-400" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Students</h1>
            <p className="text-navy-400 text-sm">{students.length} registered students</p>
          </div>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header text-left">Name</th>
                <th className="table-header text-left">CNIC</th>
                <th className="table-header text-left">Phone</th>
                <th className="table-header text-left">Assigned Room</th>
                <th className="table-header text-left">Check-in</th>
                <th className="table-header text-center">Payment</th>
                <th className="table-header text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="table-cell text-center text-navy-500 py-12">Loading students...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={7} className="table-cell text-center text-navy-500 py-12">No students yet. Click "Add Student" to get started.</td></tr>
              ) : (
                students.map(student => (
                  <tr key={student.id} className="hover:bg-navy-800/30 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-600/30 rounded-full flex items-center justify-center border border-blue-500/30 shrink-0">
                          <span className="text-blue-300 text-xs font-bold">{student.name?.[0]?.toUpperCase()}</span>
                        </div>
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-navy-300 font-mono text-xs">{student.cnic}</td>
                    <td className="table-cell text-navy-300">{student.phone}</td>
                    <td className="table-cell">
                      {student.rooms ? (
                        <span className="text-blue-300">{student.rooms.room_number} ({student.rooms.type})</span>
                      ) : (
                        <span className="text-navy-500">—</span>
                      )}
                    </td>
                    <td className="table-cell text-navy-400 text-xs">
                      {student.checkin_date ? new Date(student.checkin_date).toLocaleDateString('en-PK') : '—'}
                    </td>
                    <td className="table-cell text-center">
                      <span className={student.payment_status === 'paid' ? 'badge-paid' : 'badge-pending'}>
                        {student.payment_status}
                      </span>
                    </td>
                    <td className="table-cell text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(student)}
                          className="w-8 h-8 bg-navy-700 hover:bg-blue-600/30 rounded-lg flex items-center justify-center transition-colors text-navy-400 hover:text-blue-400"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          disabled={deleting === student.id}
                          className="w-8 h-8 bg-navy-700 hover:bg-red-600/20 rounded-lg flex items-center justify-center transition-colors text-navy-400 hover:text-red-400 disabled:opacity-50"
                        >
                          {deleting === student.id
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
          <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-xl font-bold text-white">
                {modal === 'add' ? 'Add New Student' : 'Edit Student'}
              </h3>
              <button onClick={() => setModal(false)} className="text-navy-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-navy-300 text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text" required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Muhammad Ali" className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-navy-300 text-sm font-medium mb-2">CNIC *</label>
                  <input
                    type="text" required value={form.cnic}
                    onChange={e => setForm({ ...form, cnic: formatCNIC(e.target.value) })}
                    placeholder="35201-1234567-1" className="input-field font-mono"
                  />
                </div>
                <div>
                  <label className="block text-navy-300 text-sm font-medium mb-2">Phone *</label>
                  <input
                    type="tel" required value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+92 300 1234567" className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-navy-300 text-sm font-medium mb-2">Assign Room</label>
                  <select value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })} className="input-field">
                    <option value="">Not assigned</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.room_number} — {r.type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-navy-300 text-sm font-medium mb-2">Check-in Date</label>
                  <input
                    type="date" value={form.checkin_date}
                    onChange={e => setForm({ ...form, checkin_date: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-navy-300 text-sm font-medium mb-2">Payment Status *</label>
                <select value={form.payment_status} onChange={e => setForm({ ...form, payment_status: e.target.value })} className="input-field">
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                    : <><Save className="w-4 h-4" /> Save Student</>
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
