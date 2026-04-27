import { useEffect, useState } from 'react'
import { Plus, Trash2, X, Save, Wallet, TrendingUp, TrendingDown, Scale } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const EMPTY = { type: 'income', category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] }

const INCOME_CATEGORIES  = ['Rent Payment', 'Security Deposit', 'Late Fee', 'Mess Fee', 'Other Income']
const EXPENSE_CATEGORIES = ['Maintenance', 'Utilities', 'Salaries', 'Groceries', 'Cleaning', 'Repairs', 'Security', 'Internet', 'Other Expense']

export default function BudgetTracker() {
  const [entries,  setEntries]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [filter,   setFilter]   = useState('all') // 'all' | 'income' | 'expense'

  useEffect(() => { fetchEntries() }, [])

  async function fetchEntries() {
    setLoading(true)
    const { data } = await supabase.from('budget').select('*').order('date', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('budget').insert([{ ...form, amount: Number(form.amount) }])
    setSaving(false)
    setModal(false)
    setForm(EMPTY)
    fetchEntries()
  }

  async function handleDelete(id) {
    setDeleting(id)
    await supabase.from('budget').delete().eq('id', id)
    setDeleting(null)
    fetchEntries()
  }

  const totalIncome  = entries.filter(e => e.type === 'income').reduce((s, e) => s + Number(e.amount), 0)
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + Number(e.amount), 0)
  const netBalance   = totalIncome - totalExpense

  const filtered = filter === 'all' ? entries : entries.filter(e => e.type === filter)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Wallet className="w-6 h-6 text-blue-400" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Budget Tracker</h1>
            <p className="text-navy-400 text-sm">Income & expense management</p>
          </div>
        </div>
        <button onClick={() => { setForm(EMPTY); setModal(true) }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-navy-400 text-xs mb-1">Total Income</p>
            <p className="text-green-400 text-xl font-bold font-heading">Rs. {totalIncome.toLocaleString()}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-navy-400 text-xs mb-1">Total Expenses</p>
            <p className="text-red-400 text-xl font-bold font-heading">Rs. {totalExpense.toLocaleString()}</p>
          </div>
        </div>
        <div className={`card p-5 flex items-center gap-4 ${netBalance >= 0 ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${netBalance >= 0 ? 'bg-blue-500/10' : 'bg-red-500/10'}`}>
            <Scale className={`w-6 h-6 ${netBalance >= 0 ? 'text-blue-400' : 'text-red-400'}`} />
          </div>
          <div>
            <p className="text-navy-400 text-xs mb-1">Net Balance</p>
            <p className={`text-xl font-bold font-heading ${netBalance >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              Rs. {netBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'income', 'expense'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 capitalize ${
              filter === f
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-navy-800 text-navy-300 hover:bg-navy-700 hover:text-white'
            }`}
          >
            {f === 'all' ? 'All Entries' : f === 'income' ? 'Income' : 'Expenses'}
          </button>
        ))}
        <span className="ml-auto text-navy-400 text-sm self-center">{filtered.length} entries</span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header text-left">Date</th>
                <th className="table-header text-left">Type</th>
                <th className="table-header text-left">Category</th>
                <th className="table-header text-left">Description</th>
                <th className="table-header text-right">Amount</th>
                <th className="table-header text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="table-cell text-center text-navy-500 py-12">Loading entries...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="table-cell text-center text-navy-500 py-12">No entries found.</td></tr>
              ) : (
                filtered.map(entry => (
                  <tr key={entry.id} className="hover:bg-navy-800/30 transition-colors">
                    <td className="table-cell text-navy-400 text-xs">
                      {new Date(entry.date).toLocaleDateString('en-PK')}
                    </td>
                    <td className="table-cell">
                      <span className={entry.type === 'income' ? 'badge-income' : 'badge-expense'}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="table-cell text-navy-300">{entry.category}</td>
                    <td className="table-cell text-navy-400 text-sm">{entry.description || '—'}</td>
                    <td className={`table-cell text-right font-semibold ${entry.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {entry.type === 'income' ? '+' : '-'}Rs. {Number(entry.amount).toLocaleString()}
                    </td>
                    <td className="table-cell text-center">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        disabled={deleting === entry.id}
                        className="w-8 h-8 bg-navy-700 hover:bg-red-600/20 rounded-lg flex items-center justify-center transition-colors text-navy-400 hover:text-red-400 disabled:opacity-50 mx-auto"
                      >
                        {deleting === entry.id
                          ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </button>
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
              <h3 className="font-heading text-xl font-bold text-white">Add Budget Entry</h3>
              <button onClick={() => setModal(false)} className="text-navy-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-navy-300 text-sm font-medium mb-2">Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  {['income', 'expense'].map(t => (
                    <button
                      key={t} type="button"
                      onClick={() => setForm({ ...form, type: t, category: '' })}
                      className={`py-2.5 rounded-lg text-sm font-semibold capitalize transition-all border ${
                        form.type === t
                          ? t === 'income'
                            ? 'bg-green-600/20 border-green-500/50 text-green-300'
                            : 'bg-red-600/20 border-red-500/50 text-red-300'
                          : 'bg-navy-800 border-navy-600 text-navy-400 hover:border-navy-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-navy-300 text-sm font-medium mb-2">Category *</label>
                <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
                  <option value="">Select category</option>
                  {(form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-navy-300 text-sm font-medium mb-2">Description</label>
                <input
                  type="text" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional details..." className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-navy-300 text-sm font-medium mb-2">Amount (Rs.) *</label>
                  <input
                    type="number" min={0} required value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="0" className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-navy-300 text-sm font-medium mb-2">Date *</label>
                  <input
                    type="date" required value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                    : <><Save className="w-4 h-4" /> Save Entry</>
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
