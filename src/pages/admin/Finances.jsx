import { useEffect, useState } from 'react'
import { Plus, X, Save, Wallet, TrendingUp, TrendingDown, Scale, CreditCard, Receipt, Landmark, ArrowDownUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const EXPENSE_CATEGORIES = ['Electricity', 'Water', 'Internet', 'Maintenance', 'Salaries', 'Groceries', 'Cleaning', 'Security', 'Repairs', 'Other']

export default function Finances() {
  const [accounts, setAccounts] = useState([])
  const [students, setStudents] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview') // overview | payment | expense | ledger
  const [modal, setModal] = useState(false) // 'payment' | 'expense' | 'account'
  const [saving, setSaving] = useState(false)

  const [payForm, setPayForm] = useState({ student_id: '', amount: '', month: '', payment_method: 'cash', account_id: '', transaction_id: '', bank_name: '' })
  const [expForm, setExpForm] = useState({ category: '', description: '', amount: '', account_id: '', date: new Date().toISOString().split('T')[0] })
  const [accForm, setAccForm] = useState({ name: '', type: 'cash' })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: a }, { data: s }, { data: t }] = await Promise.all([
      supabase.from('accounts').select('*').order('name'),
      supabase.from('students').select('id, name').eq('is_active', true).order('name'),
      supabase.from('transactions').select('*, accounts(name)').order('created_at', { ascending: false }).limit(50),
    ])
    setAccounts(a || []); setStudents(s || []); setTransactions(t || [])
    setLoading(false)
  }

  const totalBalance = accounts.reduce((s, a) => s + Number(a.balance), 0)
  const totalCredit = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0)
  const totalDebit = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + Number(t.amount), 0)

  async function handlePayment(e) {
    e.preventDefault(); setSaving(true)
    const payload = { student_id: payForm.student_id, amount: Number(payForm.amount), month: payForm.month, payment_method: payForm.payment_method, account_id: payForm.account_id, status: 'paid', payment_date: new Date().toISOString().split('T')[0] }
    if (payForm.payment_method === 'bank_transfer') { payload.transaction_id = payForm.transaction_id; payload.bank_name = payForm.bank_name }
    const { error } = await supabase.from('payments').insert([payload])
    if (error) alert('Error: ' + error.message)
    setSaving(false); setModal(false); fetchAll()
  }

  async function handleExpense(e) {
    e.preventDefault(); setSaving(true)
    const { error } = await supabase.from('expenses').insert([{ category: expForm.category, description: expForm.description, amount: Number(expForm.amount), account_id: expForm.account_id, date: expForm.date }])
    if (error) alert('Error: ' + error.message)
    setSaving(false); setModal(false); fetchAll()
  }

  async function handleAddAccount(e) {
    e.preventDefault(); setSaving(true)
    await supabase.from('accounts').insert([{ name: accForm.name, type: accForm.type, balance: 0 }])
    setSaving(false); setModal(false); setAccForm({ name: '', type: 'cash' }); fetchAll()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Wallet className="w-6 h-6 text-blue-400" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">Finance Management</h1>
            <p className="text-navy-400 text-sm">Accounts, Payments & Expenses</p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => { setAccForm({ name: '', type: 'cash' }); setModal('account') }} className="btn-outline flex items-center gap-2 text-sm"><Landmark className="w-4 h-4" /> Add Account</button>
          <button onClick={() => { setExpForm({ category: '', description: '', amount: '', account_id: '', date: new Date().toISOString().split('T')[0] }); setModal('expense') }} className="btn-outline flex items-center gap-2 text-sm text-red-300 border-red-500/30 hover:bg-red-600/10"><TrendingDown className="w-4 h-4" /> Log Expense</button>
          <button onClick={() => { setPayForm({ student_id: '', amount: '', month: '', payment_method: 'cash', account_id: '', transaction_id: '', bank_name: '' }); setModal('payment') }} className="btn-primary flex items-center gap-2 text-sm"><CreditCard className="w-4 h-4" /> Receive Payment</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0"><Scale className="w-6 h-6 text-blue-400" /></div>
          <div><p className="text-navy-400 text-xs mb-1">Total Balance</p><p className="text-blue-400 text-xl font-bold font-heading">Rs. {totalBalance.toLocaleString()}</p></div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0"><TrendingUp className="w-6 h-6 text-green-400" /></div>
          <div><p className="text-navy-400 text-xs mb-1">Total Credits</p><p className="text-green-400 text-xl font-bold font-heading">Rs. {totalCredit.toLocaleString()}</p></div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center shrink-0"><TrendingDown className="w-6 h-6 text-red-400" /></div>
          <div><p className="text-navy-400 text-xs mb-1">Total Debits</p><p className="text-red-400 text-xl font-bold font-heading">Rs. {totalDebit.toLocaleString()}</p></div>
        </div>
      </div>

      {/* Accounts Grid */}
      <div>
        <h3 className="font-heading text-lg font-semibold text-white mb-3">Accounts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(acc => (
            <div key={acc.id} className="card p-5 card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{acc.name}</p>
                  <p className="text-navy-500 text-xs capitalize">{acc.type}</p>
                </div>
              </div>
              <p className={`text-2xl font-bold font-heading ${Number(acc.balance) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                Rs. {Number(acc.balance).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="card">
        <div className="flex items-center gap-3 p-5 border-b border-navy-700/50">
          <ArrowDownUp className="w-5 h-5 text-blue-400" />
          <h3 className="font-heading text-lg font-semibold text-white">Transaction Ledger</h3>
          <span className="text-navy-500 text-sm ml-auto">{transactions.length} entries</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-navy-500">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-navy-500">No transactions yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th className="table-header text-left">Date</th>
                <th className="table-header text-left">Account</th>
                <th className="table-header text-center">Type</th>
                <th className="table-header text-left">Reference</th>
                <th className="table-header text-right">Amount</th>
              </tr></thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-navy-800/30 transition-colors">
                    <td className="table-cell text-navy-400 text-xs">{new Date(tx.created_at).toLocaleDateString('en-PK')}</td>
                    <td className="table-cell text-navy-300 text-sm">{tx.accounts?.name || '—'}</td>
                    <td className="table-cell text-center">
                      <span className={tx.type === 'credit' ? 'bg-green-500/20 text-green-300 border border-green-500/30 text-xs font-semibold px-2 py-1 rounded-full' : 'bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold px-2 py-1 rounded-full'}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="table-cell text-navy-400 text-sm capitalize">{tx.reference}</td>
                    <td className={`table-cell text-right font-semibold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'credit' ? '+' : '-'}Rs. {Number(tx.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {modal === 'payment' && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-xl font-bold text-white">Receive Payment</h3>
              <button onClick={() => setModal(false)} className="text-navy-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handlePayment} className="space-y-4">
              <div><label className="block text-navy-300 text-sm font-medium mb-2">Student *</label>
                <select required value={payForm.student_id} onChange={e => setPayForm({ ...payForm, student_id: e.target.value })} className="input-field">
                  <option value="">Select student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-navy-300 text-sm font-medium mb-2">Amount (Rs.) *</label>
                  <input type="number" min={0} required value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} className="input-field" /></div>
                <div><label className="block text-navy-300 text-sm font-medium mb-2">Month *</label>
                  <input type="text" required value={payForm.month} onChange={e => setPayForm({ ...payForm, month: e.target.value })} placeholder="e.g. Jan-2026" className="input-field" /></div>
              </div>
              <div><label className="block text-navy-300 text-sm font-medium mb-2">Payment Method *</label>
                <select value={payForm.payment_method} onChange={e => setPayForm({ ...payForm, payment_method: e.target.value })} className="input-field">
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="wallet">Wallet (Easypaisa/JazzCash)</option>
                </select></div>
              <div><label className="block text-navy-300 text-sm font-medium mb-2">Deposit Into Account *</label>
                <select required value={payForm.account_id} onChange={e => setPayForm({ ...payForm, account_id: e.target.value })} className="input-field">
                  <option value="">Select account</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (Rs. {Number(a.balance).toLocaleString()})</option>)}
                </select></div>
              {payForm.payment_method === 'bank_transfer' && (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-navy-300 text-sm font-medium mb-2">Bank Name</label>
                    <input type="text" value={payForm.bank_name} onChange={e => setPayForm({ ...payForm, bank_name: e.target.value })} className="input-field" /></div>
                  <div><label className="block text-navy-300 text-sm font-medium mb-2">Transaction ID</label>
                    <input type="text" value={payForm.transaction_id} onChange={e => setPayForm({ ...payForm, transaction_id: e.target.value })} className="input-field" /></div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Record Payment</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {modal === 'expense' && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-xl font-bold text-white">Log Expense</h3>
              <button onClick={() => setModal(false)} className="text-navy-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleExpense} className="space-y-4">
              <div><label className="block text-navy-300 text-sm font-medium mb-2">Category *</label>
                <select required value={expForm.category} onChange={e => setExpForm({ ...expForm, category: e.target.value })} className="input-field">
                  <option value="">Select category</option>
                  {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select></div>
              <div><label className="block text-navy-300 text-sm font-medium mb-2">Description</label>
                <input type="text" value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} className="input-field" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-navy-300 text-sm font-medium mb-2">Amount (Rs.) *</label>
                  <input type="number" min={0} required value={expForm.amount} onChange={e => setExpForm({ ...expForm, amount: e.target.value })} className="input-field" /></div>
                <div><label className="block text-navy-300 text-sm font-medium mb-2">Date *</label>
                  <input type="date" required value={expForm.date} onChange={e => setExpForm({ ...expForm, date: e.target.value })} className="input-field" /></div>
              </div>
              <div><label className="block text-navy-300 text-sm font-medium mb-2">Deduct From Account *</label>
                <select required value={expForm.account_id} onChange={e => setExpForm({ ...expForm, account_id: e.target.value })} className="input-field">
                  <option value="">Select account</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (Rs. {Number(a.balance).toLocaleString()})</option>)}
                </select></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><Receipt className="w-4 h-4" /> Log Expense</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {modal === 'account' && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-xl font-bold text-white">Add Account</h3>
              <button onClick={() => setModal(false)} className="text-navy-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div><label className="block text-navy-300 text-sm font-medium mb-2">Account Name *</label>
                <input type="text" required value={accForm.name} onChange={e => setAccForm({ ...accForm, name: e.target.value })} placeholder="e.g. Meezan Bank" className="input-field" /></div>
              <div><label className="block text-navy-300 text-sm font-medium mb-2">Type *</label>
                <select value={accForm.type} onChange={e => setAccForm({ ...accForm, type: e.target.value })} className="input-field">
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                  <option value="wallet">Wallet</option>
                </select></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Create</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
