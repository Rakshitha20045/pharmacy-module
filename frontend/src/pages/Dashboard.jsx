import { useState, useEffect } from 'react'
import { ShoppingCart, Package, AlertTriangle, RefreshCw, Plus, Search } from 'lucide-react'
import { getDashboardSummary, getRecentSales } from '../api'
import StatusBadge from '../components/StatusBadge'

function StatCard({ icon: Icon, iconBg, iconColor, badge, badgeBg, badgeColor, value, label, sub, showBadgeBorder = true }) {
  return (
    <div style={{
      background: 'white', border: '1px solid #e8eaed', borderRadius: 12,
      padding: '16px 20px', flex: 1, minWidth: 0
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={iconColor} />
        </div>
        {badge && (
          <span style={{ 
            background: badgeBg, 
            color: badgeColor, 
            fontSize: 11, 
            fontWeight: 600, 
            padding: '4px 10px', 
            borderRadius: 8,
            border: showBadgeBorder ? '1px solid transparent' : 'none' 
          }}>{badge}</span>
        )}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('sales')
  const [showSaleForm, setShowSaleForm] = useState(false)

  const load = async () => {
    try {
      const [s, r] = await Promise.all([getDashboardSummary(), getRecentSales()])
      setSummary(s)
      setSales(r)
    } catch(e) {
      setError('Failed to load dashboard data. Please try again.')
    }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="fade-in">
      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}
      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 13 }}>
          Loading...
        </div>
      )}
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Pharmacy CRM</h1>
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Manage inventory, sales, and purchase orders</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-outline" style={{ fontSize: 12 }}>
            <RefreshCw size={13} /> Export
          </button>
          <button className="btn-primary" style={{ fontSize: 12, background: '#0066ff', border: 'none' }} onClick={() => window.location.href = '/inventory'}>
            <Plus size={13} /> Add Medicine
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <StatCard
          icon={ShoppingCart} iconBg="#d1fae5" iconColor="#10b981"
          badge={`↗ +${summary?.sales_growth}%`} badgeBg="#e6f9f1" badgeColor="#00a86b"
          showBadgeBorder={false}
          value={fmt(summary?.todays_sales || 0)} label="Today's Sales"
        />
        <StatCard
          icon={Package} iconBg="#dbeafe" iconColor="#3b82f6"
          badge={`${summary?.pending_purchase_orders || 0} Orders`} badgeBg="#eff6ff" badgeColor="#3b82f6"
          value={summary?.items_sold_today || 0} label="Items Sold Today"
        />
        <StatCard
          icon={AlertTriangle} iconBg="#fef3c7" iconColor="#f59e0b"
          badge="Action Needed" badgeBg="#fffbeb" badgeColor="#d97706"
          value={summary?.low_stock_items || 0} label="Low Stock Items"
        />
        <StatCard
          icon={RefreshCw} iconBg="#ede9fe" iconColor="#8b5cf6"
          badge={`${summary?.pending_purchase_orders || 0} Pending`} badgeBg="#f5f3ff" badgeColor="#7c3aed"
          value={fmt(summary?.purchase_order_value || 0)} label="Purchase Orders"
        />
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, background: '#f8f9fa', border: '1px solid #eef0f2', borderRadius: 30, padding: 4 }}>
          {[
            { key: 'sales', label: '↗ Sales' },
            { key: 'purchase', label: '⊙ Purchase' },
            { key: 'inventory', label: '⊞ Inventory' }
          ].map(t => (
            <button key={t.key} onClick={() => t.key === 'inventory' ? window.location.href = '/inventory' : setTab(t.key)} style={{
              padding: '8px 16px', border: 'none', borderRadius: 20, cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
              background: tab === t.key ? 'white' : 'transparent',
              color: tab === t.key ? '#1a1d23' : '#6b7280',
              boxShadow: tab === t.key ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              fontFamily: 'DM Sans, sans-serif'
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary" style={{ fontSize: 12, background: '#0066ff', border: 'none' }}>+ New Sale</button>
          <button className="btn-outline" style={{ fontSize: 12 }}>+ New Purchase</button>
        </div>
      </div>

      {/* Sale Box  */}
      {tab === 'sales' && (
        <div style={{ 
          background: '#f0f9ff', 
          border: '1px solid #ccfbf1', 
          borderRadius: 12, 
          padding: '24px', 
          marginBottom: 32 
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#000000', marginBottom: 4 }}>Make a Sale</h3>
          <p style={{ fontSize: 12, color: '#1f2937', marginBottom: 24 }}>Select medicines from inventory</p>
          
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
            {/* Patient Id*/}
            <input className="input-field" placeholder="Patient Id" style={{ width: 130, background: 'white', borderRadius: 8 }} />
            
            {/* Search medicines*/}
            <div style={{ flex: 1, maxWidth: 450, position: 'relative', marginLeft: 10 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input className="input-field" placeholder="Search medicines..." style={{ width: '100%', paddingLeft: 34, background: 'white', borderRadius: 8 }} />
            </div>

            <button className="btn-primary" style={{ background: '#0066ff', border: 'none', fontSize: 12, padding: '10px 24px', borderRadius: 8 }}>Enter</button>
            
            <div style={{ flex: 1 }} />
            
            <button className="btn-primary" style={{ background: '#dc2626', border: 'none', fontSize: 12, padding: '10px 32px', borderRadius: 8 }}>Bill</button>
          </div>

          {/* Table Header Wrapper Box */}
          <div style={{ 
            background: 'white', 
            borderRadius: 10, 
            padding: '4px 0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {['Medicine Name','Generic Name','Batch No','Expiry Date','Quantity','MRP / Price','Supplier','Status','Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Sale items*/}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Sales Section */}
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Recent Sales</h3>
      <div style={{ background: 'white', border: '1px solid #e8eaed', borderRadius: 12, padding: 20 }}>
        {sales.length === 0 && !loading ? (
          <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: 24 }}>No recent sales</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sales.map(sale => {
              const isCompleted = sale.status === 'Completed'
              return (
                <div key={sale.invoice_no} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: 12,
                  border: '1px solid #f1f5f9'
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: isCompleted ? '#10b981' : '#3b82f6', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <ShoppingCart size={15} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{sale.invoice_no}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{sale.patient_name} · {sale.items_count} Items · {sale.payment_method}
</div>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{fmt(sale.total_amount)}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{sale.sale_date.slice(0, 10)}</div>
                  </div>
                  <span style={{ 
                    background: isCompleted ? '#ecfdf5' : '#fff1f2', 
                    color: isCompleted ? '#10b981' : '#f43f5e', 
                    fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 8, minWidth: 80, textAlign: 'center'
                  }}>
                    {sale.status}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}