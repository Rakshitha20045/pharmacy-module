import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { addMedicine, updateMedicine } from '../api'

const CATEGORIES = ['Analgesic','Antibiotic','Antidiabetic','Antihistamine','Antihypertensive','Anticoagulant','Cardiovascular','Gastric','Other']

const defaultForm = {
  medicine_name: '', generic_name: '', category: 'Analgesic',
  batch_no: '', expiry_date: '', quantity: '',
  cost_price: '', mrp: '', supplier: '', status: 'Active'
}

export default function MedicineModal({ open, onClose, medicine, onSaved }) {
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (medicine) {
      setForm({ ...medicine, expiry_date: medicine.expiry_date?.slice(0,10) })
    } else {
      setForm(defaultForm)
    }
    setError('')
  }, [medicine, open])

  if (!open) return null

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.medicine_name || !form.generic_name || !form.batch_no || !form.expiry_date || !form.supplier) {
      setError('Please fill in all required fields.'); return
    }
    setSaving(true); setError('')
    try {
      const payload = { ...form, quantity: Number(form.quantity), cost_price: Number(form.cost_price), mrp: Number(form.mrp) }
      if (medicine?.id) await updateMedicine(medicine.id, payload)
      else await addMedicine(payload)
      onSaved()
      onClose()
    } catch (e) {
      const detail = e.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg).join(', '))
      } else {
        setError(detail || e.message || 'Failed to save. Please try again.')
      }
    } finally { setSaving(false) }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fade-in" style={{
        background: 'white', borderRadius: 16, padding: 28,
        width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>{medicine ? 'Update Medicine' : 'Add New Medicine'}</h2>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Fill in the medicine details below</p>
          </div>
          <button onClick={onClose} style={{ background: '#f5f6fa', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color="#6b7280" />
          </button>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { label: 'Medicine Name *', key: 'medicine_name' },
            { label: 'Generic Name *', key: 'generic_name' },
            { label: 'Batch No *', key: 'batch_no' },
            { label: 'Supplier *', key: 'supplier' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>{label}</label>
              <input className="input-field" value={form[key]} onChange={e => set(key, e.target.value)} placeholder={label.replace(' *','')} />
            </div>
          ))}

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Category</label>
            <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Expiry Date *</label>
            <input className="input-field" type="date" value={form.expiry_date} onChange={e => set('expiry_date', e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Quantity</label>
            <input className="input-field" type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="0" min="0" />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Cost Price (₹)</label>
            <input className="input-field" type="number" value={form.cost_price} onChange={e => set('cost_price', e.target.value)} placeholder="0.00" min="0" />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>MRP (₹)</label>
            <input className="input-field" type="number" value={form.mrp} onChange={e => set('mrp', e.target.value)} placeholder="0.00" min="0" />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', display: 'block', marginBottom: 6 }}>Status</label>
            <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
              {['Active','Low Stock','Expired','Out of Stock'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : medicine ? 'Update Medicine' : 'Add Medicine'}
          </button>
        </div>
      </div>
    </div>
  )
}
