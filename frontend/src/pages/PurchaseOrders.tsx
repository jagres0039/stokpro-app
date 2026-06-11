import { useMemo, useState, type CSSProperties, type FormEvent } from "react"

import { api } from "../api/client"
import {
  Badge,
  Banner,
  Button,
  Card,
  Field,
  FormGrid,
  Loading,
  PageHeader,
  Select,
  Table,
  Td,
  TextInput,
  Toolbar,
} from "../components/ui"
import { fmtDate, fmtMoney } from "../format"
import { useList } from "../hooks"
import type { Item, PurchaseOrder, Supplier, Warehouse } from "../types"

type LineForm = { item_id: string; qty: string; unit_price: string }
const blankLine: LineForm = { item_id: "", qty: "1", unit_price: "0" }

function statusTone(s: PurchaseOrder["status"]) {
  if (s === "received") return "green"
  if (s === "cancelled") return "red"
  if (s === "ordered") return "blue"
  return "gray"
}

const sectionGap: CSSProperties = { display: "grid", gap: 16 }
const lineHeader: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "var(--slate-700)",
  margin: "6px 0 8px",
}
const lineRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr auto",
  gap: 8,
  marginBottom: 8,
  alignItems: "center",
}
const totalStyle: CSSProperties = { fontWeight: 700, fontSize: 15 }
const submitWrap: CSSProperties = { marginTop: 14 }

export default function PurchaseOrders() {
  const pos = useList<PurchaseOrder>("/purchase-orders")
  const suppliers = useList<Supplier>("/suppliers")
  const warehouses = useList<Warehouse>("/warehouses")
  const items = useList<Item>("/items")

  const [supplierId, setSupplierId] = useState("")
  const [warehouseId, setWarehouseId] = useState("")
  const [note, setNote] = useState("")
  const [lines, setLines] = useState<LineForm[]>([blankLine])
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const supplierName = (id: number) =>
    suppliers.data.find((s) => s.id === id)?.name ?? `#${id}`
  const whName = (id: number) =>
    warehouses.data.find((w) => w.id === id)?.name ?? `#${id}`

  const total = useMemo(
    () =>
      lines.reduce(
        (sum, l) => sum + Number(l.qty || "0") * Number(l.unit_price || "0"),
        0,
      ),
    [lines],
  )

  const setLine = (idx: number, key: keyof LineForm, value: string) => {
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, [key]: value } : l)),
    )
  }
  const addLine = () => setLines((prev) => [...prev, blankLine])
  const removeLine = (idx: number) =>
    setLines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMsg(null)
    if (!supplierId || !warehouseId) {
      setError("Pilih supplier dan gudang")
      return
    }
    const payloadLines = lines
      .filter((l) => l.item_id)
      .map((l) => ({
        item_id: Number(l.item_id),
        qty: Number(l.qty),
        unit_price: l.unit_price || "0",
      }))
    if (payloadLines.length === 0) {
      setError("Minimal 1 baris item")
      return
    }
    setBusy(true)
    try {
      await api.post("/purchase-orders", {
        supplier_id: Number(supplierId),
        warehouse_id: Number(warehouseId),
        note: note || null,
        lines: payloadLines,
      })
      setSupplierId("")
      setWarehouseId("")
      setNote("")
      setLines([blankLine])
      setMsg("Purchase order dibuat")
      pos.reload()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal membuat PO")
    } finally {
      setBusy(false)
    }
  }

  const receive = async (po: PurchaseOrder) => {
    setError(null)
    setMsg(null)
    try {
      await api.post(`/purchase-orders/${po.id}/receive`, {})
      setMsg(`PO ${po.po_no} diterima, stok masuk`)
      pos.reload()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menerima PO")
    }
  }

  return (
    <div style={sectionGap}>
      <PageHeader
        title="Pembelian"
        subtitle="Buat purchase order dan terima barang ke gudang"
      />
      {msg ? <Banner tone="success">{msg}</Banner> : null}

      <Card>
        <form onSubmit={onSubmit}>
          {error ? <Banner tone="error">{error}</Banner> : null}
          <FormGrid columns={3}>
            <Field label="Supplier">
              <Select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                required
              >
                <option value="">— Pilih —</option>
                {suppliers.data.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Gudang">
              <Select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                required
              >
                <option value="">— Pilih —</option>
                {warehouses.data.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Catatan">
              <TextInput
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Field>
          </FormGrid>

          <div style={lineHeader}>Item</div>
          {lines.map((l, idx) => (
            <div key={idx} style={lineRow}>
              <Select
                value={l.item_id}
                onChange={(e) => setLine(idx, "item_id", e.target.value)}
              >
                <option value="">— Pilih item —</option>
                {items.data.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.sku} · {i.name}
                  </option>
                ))}
              </Select>
              <TextInput
                type="number"
                value={l.qty}
                onChange={(e) => setLine(idx, "qty", e.target.value)}
                placeholder="Qty"
              />
              <TextInput
                type="number"
                value={l.unit_price}
                onChange={(e) => setLine(idx, "unit_price", e.target.value)}
                placeholder="Harga"
              />
              <Button
                type="button"
                variant="subtle"
                onClick={() => removeLine(idx)}
              >
                Hapus
              </Button>
            </div>
          ))}
          <Toolbar>
            <Button type="button" variant="ghost" onClick={addLine}>
              + Baris
            </Button>
            <div style={totalStyle}>Total: {fmtMoney(total)}</div>
          </Toolbar>
          <div style={submitWrap}>
            <Button type="submit" disabled={busy}>
              {busy ? "Menyimpan…" : "Buat PO"}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        {pos.loading ? (
          <Loading />
        ) : pos.error ? (
          <Banner tone="error">{pos.error}</Banner>
        ) : (
          <Table
            headers={[
              "No PO",
              "Supplier",
              "Gudang",
              "Tanggal",
              "Total",
              "Status",
              "Aksi",
            ]}
          >
            {pos.data.map((po) => (
              <tr key={po.id}>
                <Td>{po.po_no}</Td>
                <Td>{supplierName(po.supplier_id)}</Td>
                <Td>{whName(po.warehouse_id)}</Td>
                <Td>{fmtDate(po.order_date)}</Td>
                <Td align="right">{fmtMoney(po.total_amount)}</Td>
                <Td>
                  <Badge tone={statusTone(po.status)}>{po.status}</Badge>
                </Td>
                <Td>
                  {po.status === "draft" || po.status === "ordered" ? (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => receive(po)}
                    >
                      Terima
                    </Button>
                  ) : (
                    <span>—</span>
                  )}
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  )
}
