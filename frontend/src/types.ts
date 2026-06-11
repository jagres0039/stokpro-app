export type Category = { id: number; name: string }

export type Supplier = {
  id: number
  name: string
  phone: string | null
  email: string | null
  address: string | null
}

export type Branch = {
  id: number
  code: string
  name: string
  address: string | null
}

export type Warehouse = {
  id: number
  code: string
  name: string
  branch_id: number
}

export type Item = {
  id: number
  sku: string
  name: string
  unit: string
  barcode: string | null
  category_id: number | null
  min_stock: number
  buy_price: string
  sell_price: string
  is_active: boolean
}

export type POStatus = "draft" | "ordered" | "received" | "cancelled"

export type POLine = {
  id: number
  item_id: number
  qty: number
  unit_price: string
}

export type PurchaseOrder = {
  id: number
  po_no: string
  supplier_id: number
  warehouse_id: number
  status: POStatus
  order_date: string
  expected_date: string | null
  note: string | null
  total_amount: string
  lines: POLine[]
}

export type InvoiceStatus = "draft" | "issued" | "paid" | "void"

export type InvoiceLine = {
  id: number
  item_id: number
  qty: number
  unit_price: string
}

export type Invoice = {
  id: number
  invoice_no: string
  customer_name: string
  warehouse_id: number
  status: InvoiceStatus
  invoice_date: string
  due_date: string | null
  note: string | null
  subtotal: string
  tax_amount: string
  total_amount: string
  lines: InvoiceLine[]
}

export type MovementType = "in" | "out" | "transfer" | "opname"

export type Movement = {
  id: number
  doc_no: string
  type: MovementType
  item_id: number
  warehouse_id: number
  qty: number
}

export type StockLevel = {
  item_id: number
  warehouse_id: number
  qty: number
}
