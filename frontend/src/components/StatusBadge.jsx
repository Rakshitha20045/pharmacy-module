export default function StatusBadge({ status }) {
  const styles = {
    'Active':       { bg: '#d1fae5', color: '#059669' },
    'Low Stock':    { bg: '#fef3c7', color: '#d97706' },
    'Expired':      { bg: '#fee2e2', color: '#dc2626' },
    'Out of Stock': { bg: '#f3f4f6', color: '#6b7280' },
    'Completed':    { bg: '#dbeafe', color: '#2563eb' },
    'Pending':      { bg: '#fef3c7', color: '#d97706' },
  }
  const s = styles[status] || { bg: '#f3f4f6', color: '#6b7280' }
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      letterSpacing: 0.2
    }}>{status}</span>
  )
}
