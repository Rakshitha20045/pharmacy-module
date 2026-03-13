from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import Optional
from datetime import date, datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30))

import sqlite3

app = FastAPI(title="Pharmacy CRM API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "pharmacy.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def now_ist():
    return datetime.now(IST).replace(tzinfo=None)

def today_ist():
    return datetime.now(IST).date()

def init_db():
    conn = get_db()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS medicines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            medicine_name TEXT NOT NULL,
            generic_name TEXT NOT NULL,
            category TEXT NOT NULL,
            batch_no TEXT NOT NULL UNIQUE,
            expiry_date TEXT NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 0,
            cost_price REAL NOT NULL,
            mrp REAL NOT NULL,
            supplier TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Active',
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            invoice_no TEXT NOT NULL UNIQUE,
            patient_name TEXT NOT NULL,
            items_count INTEGER NOT NULL,
            total_amount REAL NOT NULL,
            payment_method TEXT NOT NULL DEFAULT 'Cash',
            status TEXT NOT NULL DEFAULT 'Completed',
            sale_date TEXT DEFAULT (datetime('now'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS sale_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_id INTEGER NOT NULL,
            medicine_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (sale_id) REFERENCES sales(id),
            FOREIGN KEY (medicine_id) REFERENCES medicines(id)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS purchase_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_no TEXT NOT NULL UNIQUE,
            supplier TEXT NOT NULL,
            items_count INTEGER NOT NULL,
            total_amount REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'Pending',
            order_date TEXT DEFAULT (datetime('now'))
        )
    """)

    # Seed data if empty
    c.execute("SELECT COUNT(*) FROM medicines")
    if c.fetchone()[0] == 0:
        medicines = [
            ("Paracetamol 650mg", "Acetaminophen", "Analgesic", "PCM-2024-0892", "2026-08-20", 500, 15.00, 25.00, "MedSupply Co.", "Active"),
            ("Omeprazole 20mg Capsule", "Omeprazole", "Gastric", "OMP-2024-5873", "2025-11-10", 45, 65.00, 95.75, "HealthCare Ltd.", "Low Stock"),
            ("Aspirin 75mg", "Aspirin", "Anticoagulant", "ASP-2023-3421", "2024-09-30", 300, 26.00, 45.00, "GreenMed", "Expired"),
            ("Atorvastatin 10mg", "Atorvastatin Besylate", "Cardiovascular", "AME-2024-0945", "2025-10-15", 0, 145.00, 195.00, "PharmaCorp", "Out of Stock"),
            ("Amoxicillin 500mg", "Amoxicillin", "Antibiotic", "AMX-2024-1201", "2026-03-15", 200, 45.00, 75.00, "MedSupply Co.", "Active"),
            ("Metformin 500mg", "Metformin HCl", "Antidiabetic", "MET-2024-3344", "2026-07-20", 180, 35.00, 55.00, "PharmaCorp", "Active"),
            ("Losartan 50mg", "Losartan Potassium", "Antihypertensive", "LOS-2024-5567", "2026-05-30", 25, 85.00, 120.00, "HealthCare Ltd.", "Low Stock"),
            ("Cetirizine 10mg", "Cetirizine HCl", "Antihistamine", "CET-2024-7788", "2026-09-10", 350, 12.00, 22.00, "GreenMed", "Active"),
            ("Pantoprazole 40mg", "Pantoprazole", "Gastric", "PAN-2024-9900", "2025-12-25", 90, 55.00, 85.00, "MedSupply Co.", "Active"),
            ("Azithromycin 500mg", "Azithromycin", "Antibiotic", "AZI-2024-1123", "2026-02-28", 12, 120.00, 180.00, "PharmaCorp", "Low Stock"),
        ]
        c.executemany(
            "INSERT INTO medicines (medicine_name, generic_name, category, batch_no, expiry_date, quantity, cost_price, mrp, supplier, status) VALUES (?,?,?,?,?,?,?,?,?,?)",
            medicines
        )

        _now = now_ist()
        _yesterday = _now - timedelta(days=1)

        sales = [
            ("INV-2024-1234", "Rajesh Kumar", 3, 340.00, "Card", "Completed", datetime(2024, 11, 10).isoformat()),
            ("INV-2024-1235", "Sarah Smith", 2, 145.00, "Cash", "Completed", datetime(2024, 11, 10).isoformat()),
            ("INV-2024-1236", "Michael Johnson", 5, 525.00, "UPI", "Completed", _now.isoformat()),
            ("INV-2024-1239", "Ravi Kumar", 3, 400.00, "Cash", "Completed", _yesterday.isoformat()),
        ]
        c.executemany(
            "INSERT INTO sales (invoice_no, patient_name, items_count, total_amount, payment_method, status, sale_date) VALUES (?,?,?,?,?,?,?)",
            sales
        )

        orders = [
            ("PO-2024-0001", "MedSupply Co.", 5, 12500.00, "Pending", _now.isoformat()),
            ("PO-2024-0002", "PharmaCorp", 3, 8750.00, "Pending", _now.isoformat()),
            ("PO-2024-0003", "HealthCare Ltd.", 7, 22000.00, "Completed", _now.isoformat()),
            ("PO-2024-0004", "GreenMed", 4, 9600.00, "Pending", _now.isoformat()),
            ("PO-2024-0005", "MedSupply Co.", 6, 15300.00, "Pending", _now.isoformat()),
        ]
        c.executemany(
            "INSERT INTO purchase_orders (order_no, supplier, items_count, total_amount, status, order_date) VALUES (?,?,?,?,?,?)",
            orders
        )

    conn.commit()
    conn.close()

init_db()

#Models 
class MedicineCreate(BaseModel):
    medicine_name: str
    generic_name: str
    category: str
    batch_no: str
    expiry_date: str
    quantity: int
    cost_price: float
    mrp: float
    supplier: str
    status: Optional[str] = "Active"
    @validator('quantity')
    def quantity_non_negative(cls, v):
        if v < 0:
            raise ValueError('Quantity cannot be negative')
        return v

    @validator('cost_price')
    def cost_price_positive(cls, v):
        if v <= 0:
            raise ValueError('Cost price must be greater than 0')
        return v

    @validator('mrp')
    def mrp_positive(cls, v):
        if v <= 0:
            raise ValueError('MRP must be greater than 0')
        return v

class MedicineUpdate(BaseModel):
    medicine_name: Optional[str] = None
    generic_name: Optional[str] = None
    category: Optional[str] = None
    batch_no: Optional[str] = None
    expiry_date: Optional[str] = None
    quantity: Optional[int] = None
    cost_price: Optional[float] = None
    mrp: Optional[float] = None
    supplier: Optional[str] = None
    status: Optional[str] = None
    @validator('quantity')
    def quantity_non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError('Quantity cannot be negative')
        return v

    @validator('cost_price')
    def cost_price_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Cost price must be greater than 0')
        return v

    @validator('mrp')
    def mrp_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError('MRP must be greater than 0')
        return v

class SaleCreate(BaseModel):
    patient_name: str
    items_count: int
    total_amount: float
    payment_method: str = "Cash"

#Dashboard APIs

@app.get("/api/dashboard/summary")
def get_dashboard_summary():
    conn = get_db()
    c = conn.cursor()

    today = today_ist().isoformat()
    yesterday = (today_ist() - timedelta(days=1)).isoformat()

    c.execute("SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE DATE(sale_date) = ?", (today,))
    todays_sales = c.fetchone()[0]

    c.execute("SELECT COALESCE(SUM(items_count), 0) FROM sales WHERE DATE(sale_date) = ?", (today,))
    items_sold_today = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM medicines WHERE status IN ('Low Stock', 'Out of Stock','Expired')")
    low_stock_count = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM purchase_orders WHERE status = 'Pending'")
    pending_orders = c.fetchone()[0]

    c.execute("SELECT COALESCE(SUM(total_amount), 0) FROM purchase_orders WHERE status = 'Pending'")
    purchase_order_value = c.fetchone()[0]

    c.execute("SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE DATE(sale_date) = ?", (yesterday,))
    yesterdays_sales = c.fetchone()[0]

    if yesterdays_sales > 0:
        sales_growth = round(((todays_sales - yesterdays_sales) / yesterdays_sales) * 100, 1)
    else:
        sales_growth = 0.0

    conn.close()

    return {
        "todays_sales": round(todays_sales, 2),
        "items_sold_today": items_sold_today,
        "low_stock_items": low_stock_count,
        "pending_purchase_orders": pending_orders,
        "purchase_order_value": round(purchase_order_value, 2),
        "sales_growth": sales_growth
    }

@app.get("/api/dashboard/recent-sales")
def get_recent_sales(limit: int = 10):
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        SELECT invoice_no, patient_name, items_count, total_amount, payment_method, status, sale_date
        FROM sales ORDER BY sale_date DESC LIMIT ?
    """, (limit,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/dashboard/low-stock")
def get_low_stock():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM medicines WHERE status IN ('Low Stock', 'Out of Stock') ORDER BY quantity ASC")
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/dashboard/purchase-orders")
def get_purchase_orders():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM purchase_orders ORDER BY order_date DESC")
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

#Inventory APIs

@app.get("/api/inventory")
def list_medicines(
    search: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    conn = get_db()
    c = conn.cursor()

    query = "SELECT * FROM medicines WHERE 1=1"
    params = []

    if search:
        query += " AND (medicine_name LIKE ? OR generic_name LIKE ? OR batch_no LIKE ?)"
        s = f"%{search}%"
        params += [s, s, s]
    if status:
        query += " AND status = ?"
        params.append(status)
    if category:
        query += " AND category = ?"
        params.append(category)

    c.execute(f"SELECT COUNT(*) FROM ({query})", params)
    total = c.fetchone()[0]

    query += " ORDER BY id DESC LIMIT ? OFFSET ?"
    params += [limit, (page - 1) * limit]
    c.execute(query, params)
    rows = c.fetchall()
    conn.close()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "data": [dict(r) for r in rows]
    }

@app.get("/api/inventory/overview")
def get_inventory_overview():
    conn = get_db()
    c = conn.cursor()

    c.execute("SELECT COUNT(*) FROM medicines")
    total = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM medicines WHERE status = 'Active'")
    active = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM medicines WHERE status = 'Low Stock'")
    low = c.fetchone()[0]
    c.execute("SELECT COALESCE(SUM(quantity * mrp), 0) FROM medicines")
    total_value = c.fetchone()[0]

    conn.close()
    return {
        "total_items": total,
        "active_stock": active,
        "low_stock": low,
        "total_value": round(total_value, 2)
    }

@app.get("/api/inventory/{medicine_id}")
def get_medicine(medicine_id: int):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM medicines WHERE id = ?", (medicine_id,))
    row = c.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return dict(row)

@app.post("/api/inventory", status_code=201)
def add_medicine(medicine: MedicineCreate):
    conn = get_db()
    c = conn.cursor()

    status = medicine.status
    if medicine.quantity == 0:
        status = "Out of Stock"
    elif medicine.quantity <= 50:
        status = "Low Stock"
    try:
        expiry = date.fromisoformat(medicine.expiry_date)
        if expiry < today_ist():
            status = "Expired"
    except:
        pass

    c.execute("""
        INSERT INTO medicines (medicine_name, generic_name, category, batch_no, expiry_date,
            quantity, cost_price, mrp, supplier, status)
        VALUES (?,?,?,?,?,?,?,?,?,?)
    """, (
        medicine.medicine_name, medicine.generic_name, medicine.category,
        medicine.batch_no, medicine.expiry_date, medicine.quantity,
        medicine.cost_price, medicine.mrp, medicine.supplier, status
    ))
    new_id = c.lastrowid
    conn.commit()
    conn.close()
    return {"id": new_id, "message": "Medicine added successfully", "status": status}

@app.put("/api/inventory/{medicine_id}")
def update_medicine(medicine_id: int, medicine: MedicineUpdate):
    conn = get_db()
    c = conn.cursor()

    c.execute("SELECT * FROM medicines WHERE id = ?", (medicine_id,))
    existing = c.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Medicine not found")

    existing = dict(existing)
    updates = medicine.dict(exclude_unset=True)

    new_qty = updates.get("quantity", existing["quantity"])
    new_expiry = updates.get("expiry_date", existing["expiry_date"])
    computed_status = updates.get("status", existing["status"])

    if "quantity" in updates or "expiry_date" in updates:
        try:
            expiry = date.fromisoformat(new_expiry)
            if expiry < today_ist():
                computed_status = "Expired"
            elif new_qty == 0:
                computed_status = "Out of Stock"
            elif new_qty <= 50:
                computed_status = "Low Stock"
            else:
                computed_status = "Active"
        except:
            pass
        updates["status"] = computed_status

    set_clause = ", ".join(f"{k} = ?" for k in updates)
    params = list(updates.values()) + [medicine_id]
    c.execute(f"UPDATE medicines SET {set_clause} WHERE id = ?", params)
    conn.commit()
    conn.close()
    return {"message": "Medicine updated successfully", "status": computed_status}

@app.patch("/api/inventory/{medicine_id}/status")
def update_medicine_status(medicine_id: int, status: str = Query(..., pattern="^(Active|Low Stock|Expired|Out of Stock)$")):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT id FROM medicines WHERE id = ?", (medicine_id,))
    if not c.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Medicine not found")
    c.execute("UPDATE medicines SET status = ? WHERE id = ?", (status, medicine_id))
    conn.commit()
    conn.close()
    return {"message": f"Status updated to {status}"}

@app.delete("/api/inventory/{medicine_id}")
def delete_medicine(medicine_id: int):
    conn = get_db()
    c = conn.cursor()
    c.execute("DELETE FROM medicines WHERE id = ?", (medicine_id,))
    if c.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Medicine not found")
    conn.commit()
    conn.close()
    return {"message": "Medicine deleted"}

@app.post("/api/sales", status_code=201)
def create_sale(sale: SaleCreate):
    conn = get_db()
    c = conn.cursor()
    today = today_ist().isoformat()
    c.execute("SELECT COUNT(*) FROM sales WHERE DATE(sale_date) = ?", (today,))
    count = c.fetchone()[0] + 1
    _now = now_ist()
    invoice_no = f"INV-{_now.year}-{count:04d}-{_now.microsecond % 1000:03d}"
    c.execute("""
        INSERT INTO sales (invoice_no, patient_name, items_count, total_amount, payment_method, status, sale_date)
        VALUES (?,?,?,?,?,?,?)
    """, (invoice_no, sale.patient_name, sale.items_count, sale.total_amount, sale.payment_method, "Completed", _now.isoformat()))
    new_id = c.lastrowid
    conn.commit()
    conn.close()
    return {"id": new_id, "invoice_no": invoice_no, "message": "Sale recorded"}

@app.get("/api/health")
def health():
    return {"status": "ok", "timestamp": now_ist().isoformat()}