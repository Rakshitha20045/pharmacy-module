# Pharmacy CRM — SwasthiQ Intern Assignment

A full-stack Pharmacy Management System with a Dashboard and Inventory module, built with FastAPI (Python) and React.

---

## Live Demo

- **Frontend:** https://pharmacy-module-xi.vercel.app
- **Health Check:** https://pharmacy-module.onrender.com/api/health
- **Backend API:** https://pharmacy-module.onrender.com

---

## Project Structure

```
pharmacy-module/
├── backend/
│   ├── main.py           # FastAPI application, all routes and models
│   ├── requirements.txt  # Python dependencies
│   └── pharmacy.db       # SQLite database (auto-created with seed data)
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── index.js
    │   ├── components/
    │   │   ├── MedicineModal.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── StatusBadge.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   └── Inventory.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.js
    ├── tailwind.config.js
    └── vite.config.js
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI 0.111.0 |
| Database | SQLite |
| Frontend | React 18, Vite |
| Styling | Tailwind CSS |
| HTTP Client | Axios |
| Icons | Lucide React |

---

## How to Run Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`

API docs available at: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

### Environment Variable

Create a `.env` file inside the `frontend/` folder:

```
VITE_API_URL=http://localhost:8000
```

For production, set this to your Render backend URL.

---

## REST API Structure

### Dashboard Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | Today's sales, items sold, low stock count, purchase order summary |
| GET | `/api/dashboard/recent-sales` | List of recent sales transactions |
| GET | `/api/dashboard/low-stock` | Medicines with Low Stock or Out of Stock status |
| GET | `/api/dashboard/purchase-orders` | All purchase orders |

### Inventory Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/inventory` | List all medicines with search, filter, pagination |
| GET | `/api/inventory/overview` | Total items, active stock, low stock count, total value |
| GET | `/api/inventory/{id}` | Get single medicine by ID |
| POST | `/api/inventory` | Add new medicine |
| PUT | `/api/inventory/{id}` | Update medicine details |
| PATCH | `/api/inventory/{id}/status` | Update medicine status only |
| DELETE | `/api/inventory/{id}` | Delete a medicine |

### Sales Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/sales` | Record a new sale |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | API health status |

---

## API Request / Response Examples

### GET /api/dashboard/summary

```json
{
  "todays_sales": 1010.00,
  "items_sold_today": 8,
  "low_stock_items": 5,
  "pending_purchase_orders": 4,
  "purchase_order_value": 46150.00,
  "sales_growth": 12.5
}
```

### POST /api/inventory

Request:
```json
{
  "medicine_name": "Paracetamol 650mg",
  "generic_name": "Acetaminophen",
  "category": "Analgesic",
  "batch_no": "PCM-2024-0892",
  "expiry_date": "2026-08-20",
  "quantity": 500,
  "cost_price": 15.00,
  "mrp": 25.00,
  "supplier": "MedSupply Co."
}
```

Response:
```json
{
  "id": 1,
  "message": "Medicine added successfully",
  "status": "Active"
}
```

### GET /api/inventory?search=para&status=Active&page=1&limit=20

```json
{
  "total": 1,
  "page": 1,
  "limit": 20,
  "data": [...]
}
```

---

## Data Consistency on Update

When a medicine is updated via `PUT /api/inventory/{id}`, the backend automatically computes and updates the status based on the new values:

```
if expiry_date < today      → status = "Expired"
elif quantity == 0          → status = "Out of Stock"
elif quantity <= 50         → status = "Low Stock"
else                        → status = "Active"
```

This logic runs server-side on every update — the frontend never sends a status directly. This ensures the status is always consistent with the actual quantity and expiry date, preventing stale or incorrect status values.

The same logic applies when adding a new medicine via `POST /api/inventory`.

---

## Features

**Dashboard Page**
- Today's sales total with growth percentage vs yesterday
- Items sold today
- Low stock items count
- Purchase orders summary with pending count and total value
- Recent sales list with invoice number, patient, amount, payment method

**Inventory Page**
- Inventory overview — total items, active stock, low stock, total value
- Complete medicine table with all details
- Add new medicine with full form validation
- Edit existing medicine
- Delete medicine
- Status badges — Active, Low Stock, Expired, Out of Stock
- Search by medicine name, generic name, batch number
- Filter by status
- Pagination

---

## Database

SQLite database with 4 tables:

- `medicines` — medicine inventory
- `sales` — sales transactions
- `sale_items` — items within each sale
- `purchase_orders` — purchase order records

The database is auto-initialized with seed data on first run.
