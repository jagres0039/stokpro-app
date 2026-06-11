import type { CSSProperties } from "react"

import { Card, PageHeader } from "../components/ui"
import { useList } from "../hooks"
import type { Invoice, Item, PurchaseOrder, StockLevel } from "../types"

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 14,
}
const statLabel: CSSProperties = {
  color: "var(--muted)",
  fontSize: 12,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.4,
}
const statValue: CSSProperties = {
  fontSize: 26,
  fontWeight: 800,
  marginTop: 6,
  color: "var(--slate-900)",
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <div style={statLabel}>{label}</div>
      <div style={statValue}>{value}</div>
    </Card>
  )
}

export default function Dashboard() {
  const items = useList<Item>("/items")
  const pos = useList<PurchaseOrder>("/purchase-orders")
  const invoices = useList<Invoice>("/invoices")
  const stock = useList<StockLevel>("/stock/on-hand")

  const totalUnits = stock.data.reduce((sum, s) => sum + s.qty, 0)

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Ringkasan operasional gudang" />
      <div style={grid}>
        <Stat label="Item" value={items.data.length} />
        <Stat label="Purchase Order" value={pos.data.length} />
        <Stat label="Invoice" value={invoices.data.length} />
        <Stat label="Total Unit Stok" value={totalUnits} />
      </div>
    </div>
  )
}
