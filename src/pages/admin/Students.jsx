import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Save, Users, UserPlus, LogOut as CheckOutIcon, CheckCircle2, AlertTriangle, Calendar, CreditCard, Landmark } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const EMPTY_STUDENT = { name: '', cnic: '', phone: '', email: '', address: '', emergency_contact_name: '', emergency_contact_phone: '' }

function isOverdue(lastPaymentDate) {
  if (!lastPaymentDate) return true // Never paid = overdue
  const last = new Date(lastPaymentDate)
  const now = new Date()
  const diffMs = now - last
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays > 30
}

function daysSincePayment(lastPaymentDate) {
  if (!lastPaymentDate) return null
  const last = new Date(lastPaymentDate)
  const now = new Date()
  return Math.floor((now - last) / (1000 * 60 * 60 * 24))
}

export default function Students() {
  const [students, setStudents] = useState([])
  const [rooms, setRooms] = useState([])
  const [allocations, setAllocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false) // 'add' | 'edit' | 'allocate'
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_STUDENT)
  const [allocForm, setAllocForm] = useState({ student_id: '', room_id: '', checkin_date: new Date().toISOString().split('T')[0] })
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null) // student id to delete
  const [deleting, setDeleting] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [payForm, setPayForm] = useState({ student_id: '', student_name: '', amount: '', month: '', payment_method: 'cash', account_id: '', transaction_id: '', bank_name: '' })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: s }, { data: r }, { data: a }, { data: acc }] = await Promise.all([
      supabase.from('students').select('*').order('name'),
      supabase.from('rooms').select('*').order('room_number'),
      supabase.from('room_allocations').select('*, rooms(room_number), students(name)').eq('status', 'active'),
      supabase.from('accounts').select('*').order('name'),
    ])
    setStudents(s || []); setRooms(r || []); setAllocations(a || []); setAccounts(acc || [])
    setLoading(false)
  }

  function getStudentRoom(studentId) {
    return (allocations || []).find(a => a.student_id === studentId)
  }

  async function handleSaveStudent(e) {
    e.preventDefault(); setSaving(true)
    if (modal === 'add') await supabase.from('students').insert([{ ...form, is_active: true }])
    else await supabase.from('students').update(form).eq('id', editing)
    setSaving(false); setModal(false); setForm(EMPTY_STUDENT); fetchAll()
  }

  async function handleAllocate(e) {
    e.preventDefault(); setSaving(true)
    await supabase.from('room_allocations').insert([{ student_id: allocForm.student_id, room_id: allocForm.room_id, checkin_date: allocForm.checkin_date, status: 'active' }])
    setSaving(false); setModal(false); fetchAll()
  }

  async function handleCheckout(allocationId) {
    await supabase.from('room_allocations').update({ status: 'completed', checkout_date: new Date().toISOString().split('T')[0] }).eq('id', allocationId)
    fetchAll()
  }

  async function handleToggleActive(student) {
    await supabase.from('students').update({ is_active: !student.is_active }).eq('id', student.id)
    fetchAll()
  }

  // ── DELETE with confirmation ──
  async function handleDeleteStudent() {
    if (!deleteConfirm) return
    setDeleting(true)

    // 1. Get all payment IDs for this student (needed to delete related transactions)
    const { data: studentPayments } = await supabase
      .from('payments').select('id').eq('student_id', deleteConfirm)
    
    // 2. Delete transactions linked to those payments
    if (studentPayments && studentPayments.length > 0) {
      const paymentIds = studentPayments.map(p => p.id)
      await supabase.from('transactions')
        .delete()
        .in('reference_id', paymentIds)
        .eq('reference', 'payment')
    }

    // 3. Delete payments for this student
    await supabase.from('payments').delete().eq('student_id', deleteConfirm)

    // 4. Delete room allocations
    await supabase.from('room_allocations').delete().eq('student_id', deleteConfirm)

    // 5. Finally delete the student
    const { error } = await supabase.from('students').delete().eq('id', deleteConfirm)
    if (error) {
      alert('Cannot delete student: ' + error.message)
    }

    setDeleting(false)
    setDeleteConfirm(null)
    fetchAll()
  }

  // ── OPEN PAYMENT POPUP (pre-fills student) ──
  function openPaymentModal(student) {
    const now = new Date()
    const monthStr = now.toLocaleString('en-US', { month: 'short' }) + '-' + now.getFullYear()
    setPayForm({
      student_id: student.id,
      student_name: student.name,
      amount: '',
      month: monthStr,
      payment_method: 'cash',
      account_id: '',
      transaction_id: '',
      bank_name: '',
    })
    setModal('payment')
  }

  // ── RECORD PAYMENT (inserts into payments table + updates last_payment_date) ──
  async function handlePayment(e) {
    e.preventDefault()
    setSaving(true)

    const today = new Date().toISOString().split('T')[0]
    const payload = {
      student_id: payForm.student_id,
      amount: Number(payForm.amount),
      month: payForm.month,
      payment_method: payForm.payment_method,
      account_id: payForm.account_id,
      status: 'paid',
      payment_date: today,
    }
    if (payForm.payment_method === 'bank_transfer') {
      payload.transaction_id = payForm.transaction_id
      payload.bank_name = payForm.bank_name
    }

    const { error } = await supabase.from('payments').insert([payload])
    if (error) {
      alert('Payment error: ' + error.message)
      setSaving(false)
      return
    }

    // Also update last_payment_date on the student
    await supabase.from('students').update({ last_payment_date: today }).eq('id', payForm.student_id)

    setSaving(false)
    setModal(false)
    fetchAll()
  }

  // Available rooms (not full)
  const availableRooms = rooms.filter(room => {
    const active = (allocations || []).filter(a => a.room_id === room.id).length
    return active < room.capacity
  })

  // Unallocated students
  const unallocatedStudents = students.filter(s => s.is_active && !getStudentRoom(s.id))

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-400" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Student Management</h1>
            <p className="text-navy-400 text-sm">{students.filter(s => s.is_active).length} active students</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setAllocForm({ student_id: '', room_id: '', checkin_date: new Date().toISOString().split('T')[0] }); setModal('allocate') }}
            className="btn-outline flex items-center gap-2 text-sm"><UserPlus className="w-4 h-4" /> Assign Room</button>
          <button onClick={() => { setForm(EMPTY_STUDENT); setEditing(null); setModal('add') }}
            className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" /> Add Student</button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>
              <th className="table-header text-left">Name</th>
              <th className="table-header text-left">CNIC</th>
              <th className="table-header text-left">Phone</th>
              <th className="table-header text-center">Room</th>
              <th className="table-header text-center">Payment</th>
              <th className="table-header text-center">Status</th>
              <th className="table-header text-center">Actions</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="table-cell text-center text-navy-500 py-12">Loading...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={7} className="table-cell text-center text-navy-500 py-12">No students yet.</td></tr>
              ) : students.map(s => {
                const alloc = getStudentRoom(s.id)
                const overdue = s.is_active && isOverdue(s.last_payment_date)
                const days = daysSincePayment(s.last_payment_date)

                return (
                  <tr key={s.id}
                    className={`transition-colors ${
                      overdue && s.is_active
                        ? 'bg-red-500/8 hover:bg-red-500/15 border-l-2 border-l-red-500'
                        : 'hover:bg-navy-800/30'
                    }`}
                  >
                    <td className="table-cell font-medium">{s.name}</td>
                    <td className="table-cell text-navy-300 text-sm">{s.cnic || '—'}</td>
                    <td className="table-cell text-navy-300 text-sm">{s.phone || '—'}</td>
                    <td className="table-cell text-center">
                      {alloc ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold px-2 py-1 rounded-full">
                            {alloc.rooms?.room_number || '—'}
                          </span>
                          <button onClick={() => handleCheckout(alloc.id)} title="Checkout"
                            className="w-6 h-6 bg-navy-700 hover:bg-red-600/20 rounded flex items-center justify-center text-navy-400 hover:text-red-400 transition-colors">
                            <CheckOutIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ) : <span className="text-navy-500 text-xs">Not assigned</span>}
                    </td>

                    {/* ── Payment Status Column ── */}
                    <td className="table-cell text-center">
                      {!s.is_active ? (
                        <span className="text-navy-500 text-xs">—</span>
                      ) : overdue ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Overdue
                          </span>
                          <span className="text-red-400/70 text-[10px]">
                            {days !== null ? `${days} days ago` : 'Never paid'}
                          </span>
                          <button onClick={() => openPaymentModal(s)}
                            className="mt-1 bg-green-600/20 hover:bg-green-600/40 text-green-300 border border-green-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors flex items-center gap-1">
                            <CreditCard className="w-3 h-3" /> Record Payment
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <span className="bg-green-500/20 text-green-300 border border-green-500/30 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                          <span className="text-navy-500 text-[10px] flex items-center gap-0.5">
                            <Calendar className="w-3 h-3" />
                            {days !== null ? `${days}d ago` : '—'}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="table-cell text-center">
                      <button onClick={() => handleToggleActive(s)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border ${s.is_active ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-navy-700 text-navy-400 border-navy-600'}`}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* ── Actions Column (Edit + Delete) ── */}
                    <td className="table-cell text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setForm({ name: s.name, cnic: s.cnic || '', phone: s.phone || '', email: s.email || '', address: s.address || '', emergency_contact_name: s.emergency_contact_name || '', emergency_contact_phone: s.emergency_contact_phone || '' }); setEditing(s.id); setModal('edit') }}
                          className="w-8 h-8 bg-navy-700 hover:bg-blue-600/30 rounded-lg flex items-center justify-center transition-colors text-navy-400 hover:text-blue-400">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(s.id)}
                          className="w-8 h-8 bg-navy-700 hover:bg-red-600/20 rounded-lg flex items-center justify-center transition-colors text-navy-400 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
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

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-sm text-center">
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="font-heading text-xl font-bold text-white mb-2">Delete Student?</h3>
            <p className="text-navy-400 text-sm mb-1">Are you sure you want to delete this student?</p>
            <p className="text-navy-500 text-xs mb-6">This will also remove their room allocation. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} disabled={deleting}
                className="btn-outline flex-1">Cancel</button>
              <button onClick={handleDeleteStudent} disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60">
                {deleting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 className="w-4 h-4" /> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Student Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-xl font-bold text-white">{modal === 'add' ? 'Add Student' : 'Edit Student'}</h3>
              <button onClick={() => setModal(false)} className="text-navy-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div><label className="block text-navy-300 text-sm font-medium mb-2">Full Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-navy-300 text-sm font-medium mb-2">CNIC</label>
                  <input type="text" value={form.cnic} onChange={e => setForm({ ...form, cnic: e.target.value })} placeholder="xxxxx-xxxxxxx-x" className="input-field" /></div>
                <div><label className="block text-navy-300 text-sm font-medium mb-2">Phone</label>
                  <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="03xx-xxxxxxx" className="input-field" /></div>
              </div>
              <div><label className="block text-navy-300 text-sm font-medium mb-2">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" /></div>
              <div><label className="block text-navy-300 text-sm font-medium mb-2">Address</label>
                <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input-field" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-navy-300 text-sm font-medium mb-2">Emergency Contact</label>
                  <input type="text" value={form.emergency_contact_name} onChange={e => setForm({ ...form, emergency_contact_name: e.target.value })} placeholder="Father/Mother" className="input-field" /></div>
                <div><label className="block text-navy-300 text-sm font-medium mb-2">Emergency Phone</label>
                  <input type="text" value={form.emergency_contact_phone} onChange={e => setForm({ ...form, emergency_contact_phone: e.target.value })} className="input-field" /></div>
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

      {/* Allocate Room Modal */}
      {modal === 'allocate' && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-xl font-bold text-white">Assign Room to Student</h3>
              <button onClick={() => setModal(false)} className="text-navy-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAllocate} className="space-y-4">
              <div><label className="block text-navy-300 text-sm font-medium mb-2">Student *</label>
                <select required value={allocForm.student_id} onChange={e => setAllocForm({ ...allocForm, student_id: e.target.value })} className="input-field">
                  <option value="">Select student</option>
                  {unallocatedStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select></div>
              <div><label className="block text-navy-300 text-sm font-medium mb-2">Room *</label>
                <select required value={allocForm.room_id} onChange={e => setAllocForm({ ...allocForm, room_id: e.target.value })} className="input-field">
                  <option value="">Select available room</option>
                  {availableRooms.map(r => <option key={r.id} value={r.id}>{r.room_number} ({r.type})</option>)}
                </select></div>
              <div><label className="block text-navy-300 text-sm font-medium mb-2">Check-in Date *</label>
                <input type="date" required value={allocForm.checkin_date} onChange={e => setAllocForm({ ...allocForm, checkin_date: e.target.value })} className="input-field" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><UserPlus className="w-4 h-4" /> Assign</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Receive Payment Modal (same as Finances) ── */}
      {modal === 'payment' && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-xl font-bold text-white">Receive Payment</h3>
              <button onClick={() => setModal(false)} className="text-navy-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {/* Student indicator */}
            <div className="mb-5 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/30 rounded-full flex items-center justify-center border border-blue-500/30 shrink-0">
                <span className="text-blue-300 text-sm font-bold">{payForm.student_name?.[0]?.toUpperCase() || '?'}</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{payForm.student_name}</p>
                <p className="text-blue-400/70 text-xs">Recording payment for this student</p>
              </div>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-navy-300 text-sm font-medium mb-2">Amount (Rs.) *</label>
                  <input type="number" min={0} required value={payForm.amount}
                    onChange={e => setPayForm({ ...payForm, amount: e.target.value })}
                    placeholder="e.g. 8000" className="input-field" />
                </div>
                <div>
                  <label className="block text-navy-300 text-sm font-medium mb-2">Month *</label>
                  <input type="text" required value={payForm.month}
                    onChange={e => setPayForm({ ...payForm, month: e.target.value })}
                    placeholder="e.g. May-2026" className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-navy-300 text-sm font-medium mb-2">Payment Method *</label>
                <select value={payForm.payment_method}
                  onChange={e => setPayForm({ ...payForm, payment_method: e.target.value })} className="input-field">
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="wallet">Wallet (Easypaisa/JazzCash)</option>
                </select>
              </div>

              <div>
                <label className="block text-navy-300 text-sm font-medium mb-2">Deposit Into Account *</label>
                <select required value={payForm.account_id}
                  onChange={e => setPayForm({ ...payForm, account_id: e.target.value })} className="input-field">
                  <option value="">Select account</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (Rs. {Number(a.balance).toLocaleString()})</option>
                  ))}
                </select>
              </div>

              {payForm.payment_method === 'bank_transfer' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-navy-300 text-sm font-medium mb-2">Bank Name</label>
                    <input type="text" value={payForm.bank_name}
                      onChange={e => setPayForm({ ...payForm, bank_name: e.target.value })}
                      placeholder="e.g. HBL" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-navy-300 text-sm font-medium mb-2">Transaction ID</label>
                    <input type="text" value={payForm.transaction_id}
                      onChange={e => setPayForm({ ...payForm, transaction_id: e.target.value })}
                      placeholder="e.g. TXN123" className="input-field" />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                  ) : (
                    <><CreditCard className="w-4 h-4" /> Record Payment</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
