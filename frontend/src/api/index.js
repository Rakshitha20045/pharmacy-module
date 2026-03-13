import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE, timeout: 10000 })
api.interceptors.response.use(
  res => res,
  err => {
    console.error('API Error:', err?.response?.data || err.message)
    return Promise.reject(err)
  }
)
// Dashboard
export const getDashboardSummary = () => api.get('/api/dashboard/summary').then(r => r.data)
export const getRecentSales = (limit = 10) => api.get(`/api/dashboard/recent-sales?limit=${limit}`).then(r => r.data)
export const getLowStock = () => api.get('/api/dashboard/low-stock').then(r => r.data)
export const getPurchaseOrders = () => api.get('/api/dashboard/purchase-orders').then(r => r.data)

// Inventory
export const getInventoryOverview = () => api.get('/api/inventory/overview').then(r => r.data)
export const getMedicines = (params = {}) => {
  const q = new URLSearchParams(params).toString()
  return api.get(`/api/inventory?${q}`).then(r => r.data)
}
export const getMedicine = (id) => api.get(`/api/inventory/${id}`).then(r => r.data)
export const addMedicine = (data) => api.post('/api/inventory', data).then(r => r.data)
export const updateMedicine = (id, data) => api.put(`/api/inventory/${id}`, data).then(r => r.data)
export const updateMedicineStatus = (id, status) => api.patch(`/api/inventory/${id}/status?status=${encodeURIComponent(status)}`).then(r => r.data)
export const deleteMedicine = (id) => api.delete(`/api/inventory/${id}`).then(r => r.data)

// Sales
export const createSale = (data) => api.post('/api/sales', data).then(r => r.data)
