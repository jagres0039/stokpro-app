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
import type { Invoice, Item, Warehouse } from "../types"

type LineForm = { item_id: string; qty: string; unit_price: string }
const blankLine: LineForm = { item_id: "", qty: "1", unit_price: "0" }

function statusTone(s: Invoice["status"]) {
  if (s === "paid") return "green"
  if (s === "void") return "red"
  if (s === "issued") return "blue"
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

export default function Invoices() {
  const invoices = useList<Invoice>("/invoices")
  const warehouses = useList<Warehouse>("/warehouses")
  const items = useList<Item>("/items")

  const [customer, setCustomer] = useState("")
  const [warehouseId, setWarehouseId] = useState("")
  const [tax, setTax] = useState("0")
  const [lines, setLines] = useState<LineForm[]>([blankLine])
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const whName = (id: number) =>
    warehouses.data.find((w) => w.id === id)?.name ?? `#${id}`

  const subtotal = useMemo(
    () =>
      lines.reduce(
        (sum, l) => sum + Number(l.qty || "0") * Number(l.unit_price || "0"),
        0,
      ),
    [lines],
  )
  const total = subtotal + Number(tax || "0")

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
    if (!customer || !warehouseId) {
      setError("Isi nama pelanggan dan gudang")
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
      await api.post("/invoices", {
        customer_name: customer,
        warehouse_id: Number(warehouseId),
        tax_amount: tax || "0",
        lines: payloadLines,
      })
      setCustomer("")
      setWarehouseId("")
      setTax("0")
      setLines([blankLine])
      setMsg("Invoice dibuat")
      invoices.reload()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal membuat invoice")
    } finally {
      setBusy(false)
    }
  }

  const issue = async (inv: Invoice) => {
    setError(null)
    setMsg(null)
    try {
      await api.post(`/invoices/${inv.id}/issue`, {})
      setMsg(`Invoice ${inv.invoice_no} diterbitkan, stok keluar`)
      invoices.reload()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menerbitkan invoice")
    }
  }

  return (
    <div style={sectionGap}>
      <PageHeader
        title="Penjualan"
        subtitle="Buat invoice dan terbitkan untuk mengeluarkan stok"
      />
      {msg ? <Banner tone="success">{msg}</Banner> : null}

      <Card>
        <form onSubmit={onSubmit}>
          {error ? <Banner tone="error">{error}</Banner> : null}
          <FormGrid columns={3}>
            <Field label="Pelanggan">
              <TextInput
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                required
              />
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
            <Field label="Pajak (Rp)">
              <TextInput
                type="number"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
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
            <div style={totalStyle}>
              Subtotal: {fmtMoney(subtotal)} · Total: {fmtMoney(total)}
            </div>
          </Toolbar>
          <div style={submitWrap}>
            <Button type="submit" disabled={busy}>
              {busy ? "Menyimpan…" : "Buat Invoice"}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        {invoices.loading ? (
          <Loading />
        ) : invoices.error ? (
          <Banner tone="error">{invoices.error}</Banner>
        ) : (
          <Table
            headers={[
              "No Invoice",
              "Pelanggan",
              "Gudang",
              "Tanggal",
              "Total",
              "Status",
              "Aksi",
            ]}
          >
            {invoices.data.map((inv) => (
              <tr key={inv.id}>
                <Td>{inv.invoice_no}</Td>
                <Td>{inv.customer_name}</Td>
                <Td>{whName(inv.warehouse_id)}</Td>
                <Td>{fmtDate(inv.invoice_date)}</Td>
                <Td align="right">{fmtMoney(inv.total_amount)}</Td>
                <Td>
                  <Badge tone={statusTone(inv.status)}>{inv.status}</Badge>
                </Td>
                <Td>
                  {inv.status === "draft" ? (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => issue(inv)}
                    >
                      Terbitkan
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
