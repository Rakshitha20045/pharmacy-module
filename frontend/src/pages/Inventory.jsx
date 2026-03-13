import { useState, useEffect } from 'react'
import { Search, Filter, Download, Plus, Package, CheckCircle, AlertTriangle, DollarSign, Edit2, Trash2, RefreshCw, ShoppingCart, LayoutGrid } from 'lucide-react'
import { getInventoryOverview, getMedicines, deleteMedicine, getDashboardSummary } from '../api'
import StatusBadge from '../components/StatusBadge'
import MedicineModal from '../components/MedicineModal'

const STATUS_FILTERS = ['All', 'Active', 'Low Stock', 'Expired', 'Out of Stock']


function OverviewCard({ icon: Icon, iconColor, value, label }) {
  return (
    <div style={{ 
      flex: 1, 
      background: 'white', 
      borderRadius: 12, 
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{label}</span>
        <Icon size={16} color={iconColor} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>{value}</div>
    </div>
  )
}

export default function Inventory() {
  const [overview, setOverview] = useState(null)
  const [summary, setSummary] = useState(null)
  const [medicines, setMedicines] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')  
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState(null)
  const [page, setPage] = useState(1)
  const [showFilter, setShowFilter] = useState(false)

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const load = async (currentSearch, currentStatus, currentPage) => {
    setLoading(true)
    try {
      const params = { page: currentPage, limit: 20 }
      if (currentSearch) params.search = currentSearch
      if (currentStatus !== 'All') params.status = currentStatus
      const [ov, inv, sum] = await Promise.all([
        getInventoryOverview(),
        getMedicines(params),
        getDashboardSummary()
      ])
      setOverview(ov)
      setMedicines(inv.data)
      setTotal(inv.total)
      setSummary(sum)
    } catch (e) { 
      console.error(e)
      setError('Failed to load inventory data. Please try again.')
    }
    setLoading(false)
  }

  useEffect(() => { load(search, statusFilter, page) }, [])

  const handleStatusFilter = (s) => {
    setStatusFilter(s)
    setPage(1)
    load(search, s, 1)
    setShowFilter(false) 
  }

  useEffect(() => {
    const timer = setTimeout(() => load(search, statusFilter, page), 400)
    return () => clearTimeout(timer)
  }, [search])

  const handlePage = (newPage) => {
    setPage(newPage)
    load(search, statusFilter, newPage)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this medicine?')) return
    await deleteMedicine(id)
    load(search, statusFilter, page)
  }

  const openAdd = () => { setEditingMedicine(null); setModalOpen(true) }
  const openEdit = (m) => { setEditingMedicine(m); setModalOpen(true) }

  const topCards = summary ? [
    {
      icon: DollarSign, iconBg: '#d1fae5', iconColor: '#10b981',
      badge: `↗ +${summary.sales_growth}%`, badgeBg: '#e6f9f1', badgeColor: '#00a86b',
      value: fmt(summary.todays_sales), label: "Today's Sales"
    },
    {
      icon: ShoppingCart, iconBg: '#dbeafe', iconColor: '#3b82f6',
      badge: `${summary.pending_purchase_orders} Orders`, badgeBg: '#eff6ff', badgeColor: '#3b82f6',
      value: summary.items_sold_today, label: 'Items Sold Today'
    },
    {
      icon: AlertTriangle, iconBg: '#fef3c7', iconColor: '#f59e0b',
      badge: 'Action Needed', badgeBg: '#fffbeb', badgeColor: '#d97706',
      value: summary.low_stock_items, label: 'Low Stock Items'
    },
    {
      icon: RefreshCw, iconBg: '#ede9fe', iconColor: '#8b5cf6',
      badge: `${summary.pending_purchase_orders} Pending`, badgeBg: '#f5f3ff', badgeColor: '#7c3aed',
      value: fmt(summary.purchase_order_value), label: 'Purchase Orders'
    },
  ] : []

  return (
    <div className="fade-in">
      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
        {error}
        </div>
      )}
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Pharmacy CRM</h1>
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Manage inventory, sales, and purchase orders</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-outline" style={{ fontSize: 12 }}><Download size={13} /> Export</button>
          <button className="btn-primary" style={{ fontSize: 12, background: '#0066ff', border: 'none' }} onClick={openAdd}>
            <Plus size={13} /> Add Medicine
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {loading && !summary ? (
          [...Array(4)].map((_, i) => (
            <div key={i} style={{ flex: 1, height: 108, background: '#f5f6fa', borderRadius: 12 }} />
          ))
        ) : topCards.map((c, i) => (
          <div key={i} style={{ background: 'white', border: '1px solid #e8eaed', borderRadius: 12, padding: '16px 20px', flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <c.icon size={18} color={c.iconColor} />
              </div>
              <span style={{ background: c.badgeBg, color: c.badgeColor, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8 }}>{c.badge}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>{c.value}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* MAIN CONTAINER BOX */}
      <div style={{ 
        background: 'white', 
        border: '1px solid #e8eaed', 
        borderRadius: 16, 
        padding: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)' 
      }}>
        
        {/* TABS ROW */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8, background: '#f8f9fa', border: '1px solid #eef0f2', borderRadius: 20, padding: 4 }}>
            {[
              { key: 'sales', label: '↗ Sales' },
              { key: 'purchase', label: '⊙ Purchase' },
              { key: 'inventory', label: '⊞ Inventory' }
            ].map(t => (
              <button 
                key={t.key} 
                onClick={() => t.key !== 'inventory' && (window.location.href = '/')} 
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 16px', border: 'none', borderRadius: 16, cursor: 'pointer',
                  fontSize: 12, fontWeight: 600,
                  background: t.key === 'inventory' ? 'white' : 'transparent',
                  color: t.key === 'inventory' ? '#1a1d23' : '#6b7280',
                  boxShadow: t.key === 'inventory' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  fontFamily: 'DM Sans, sans-serif'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-outline" style={{ fontSize: 12 }} onClick={() => window.location.href = '/'}>+ New Sale</button>
            <button className="btn-outline" style={{ fontSize: 12 }}>+ New Purchase</button>
          </div>
        </div>

        {/* INVENTORY OVERVIEW  */}
        <div style={{ 
          background: '#f0fdfa', 
          border: '1px solid #ccfbf1', 
          borderRadius: 12, 
          padding: '24px', 
          marginBottom: 32 
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#134e4a', marginBottom: 20 }}>Inventory Overview</h3>
          {overview && (
            <div style={{ display: 'flex', gap: 16 }}>
              <OverviewCard icon={Package} iconColor="#0891b2" value={overview.total_items} label="Total Items" />
              <OverviewCard icon={CheckCircle} iconColor="#10b981" value={overview.active_stock} label="Active Stock" />
              <OverviewCard icon={AlertTriangle} iconColor="#f59e0b" value={overview.low_stock} label="Low Stock" />
              <OverviewCard icon={DollarSign} iconColor="#a855f7" value={fmt(overview.total_value)} label="Total Value" />
            </div>
          )}
        </div>

        {/* COMPLETE INVENTORY SECTION */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>Complete Inventory</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  className="input-field"
                  placeholder="Search medicines"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: 220, paddingLeft: 30 }}
                />
              </div>
              <div style={{ position: 'relative' }}>
                <button className="btn-outline" style={{ fontSize: 12, background: showFilter ? '#1a1d23' : 'transparent', color: showFilter ? 'white' : 'inherit' }} 
                  onClick={() => setShowFilter(!showFilter)}>
                  <Filter size={13} /> {statusFilter === 'All' ? 'Filter' : statusFilter}
                </button>
                {showFilter && (
                  <div style={{
                    position: 'absolute', right: 0, top: 36, background: 'white', border: '1px solid #e8eaed',
                    borderRadius: 10, padding: 8, zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 160
                  }}>
                    {STATUS_FILTERS.map(s => (
                      <button key={s} onClick={() => handleStatusFilter(s)}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', borderRadius: 6,
                          cursor: 'pointer', fontSize: 12, background: statusFilter === s ? '#f5f6fa' : 'transparent',
                          fontWeight: statusFilter === s ? 600 : 400, color: statusFilter === s ? '#1a1d23' : '#6b7280'
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="btn-outline" style={{ fontSize: 12 }}><Download size={13} /> Export</button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f0f1f3', background: '#f9fafb' }}>
                  {['Medicine Name', 'Generic Name', 'Category', 'Batch No', 'Expiry Date', 'Quantity', 'Cost Price', 'MRP', 'Supplier', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loading && medicines.map(med => (
                  <tr key={med.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '14px 12px', fontWeight: 600 }}>{med.medicine_name}</td>
                    <td style={{ padding: '14px 12px', color: '#6b7280' }}>{med.generic_name}</td>
                    <td style={{ padding: '14px 12px', color: '#6b7280' }}>{med.category}</td>
                    <td style={{ padding: '14px 12px', fontFamily: 'monospace' }}>{med.batch_no}</td>
                    <td style={{ padding: '14px 12px', color: '#6b7280' }}>{med.expiry_date?.slice(0, 10)}</td>
                    <td style={{ padding: '14px 12px', fontWeight: 600 }}>{med.quantity}</td>
                    <td style={{ padding: '14px 12px', color: '#6b7280' }}>₹{med.cost_price?.toFixed(2)}</td>
                    <td style={{ padding: '14px 12px', fontWeight: 600 }}>₹{med.mrp?.toFixed(2)}</td>
                    <td style={{ padding: '14px 12px', color: '#6b7280' }}>{med.supplier}</td>
                    <td style={{ padding: '14px 12px' }}><StatusBadge status={med.status} /></td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(med)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #e8eaed', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Edit2 size={12} color="#6b7280" />
                        </button>
                        <button onClick={() => handleDelete(med.id)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #fee2e2', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={12} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && medicines.length === 0 && (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: 32, color: '#9ca3af', fontSize: 13 }}>
                     No medicines found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <MedicineModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        medicine={editingMedicine}
        onSaved={() => load(search, statusFilter, page)}
      />
    </div>
  )
}