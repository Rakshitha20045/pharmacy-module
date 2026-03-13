import { Search, LayoutDashboard, AlignJustify, Activity, Calendar, Users, Shield, Link, Plus, Sliders, Settings } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

const icons = [
  { icon: Search, path: null },
  { icon: LayoutDashboard, path: '/' },
  { icon: AlignJustify, path: '/inventory' },
  { icon: Activity, path: null },
  { icon: Calendar, path: null },
  { icon: Users, path: null },
  { icon: Shield, path: null },
  { icon: Link, path: null },
  { icon: Plus, path: null },
  { icon: Sliders, path: null },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div style={{
      width: 64,
      minHeight: '100vh',
      background: '#ffffff',
      borderRight: '1px solid #e8eaed',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '16px 0',
      gap: 4,
      position: 'fixed',
      left: 0, top: 0, bottom: 0,
      zIndex: 50
    }}>
      {icons.map(({ icon: Icon, path }, i) => {
        const active = path && location.pathname === path
        return (
          <button key={i}
            onClick={() => path && navigate(path)}
            style={{
              width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8,
              border: 'none',
              cursor: path ? 'pointer' : 'default',
              background: active ? '#1a1d23' : 'transparent',
              color: active ? 'white' : path ? '#6b7280' : '#d1d5db',
              transition: 'all 0.15s',
              marginBottom: i === 0 ? 8 : 0
            }}
            onMouseEnter={e => { if (!active && path) e.currentTarget.style.background = '#f5f6fa' }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
          >
            <Icon size={16} />
          </button>
        )
      })}
      <div style={{ flex: 1 }} />
      <button style={{
        width: 36, height: 36,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 8, border: 'none', cursor: 'pointer',
        background: 'transparent', color: '#6b7280'
      }}>
        <Settings size={16} />
      </button>
    </div>
  )
}
