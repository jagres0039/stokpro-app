import { useState, type CSSProperties, type FormEvent } from "react"

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
} from "../components/ui"
import { useList } from "../hooks"
import type { Item, Movement, StockLevel, Warehouse } from "../types"

const sectionGap: CSSProperties = { display: "grid", gap: 16 }
const twoCol: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
  alignItems: "start",
}
const titleStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  marginBottom: 12,
}

function moveTone(t: Movement["type"]) {
  if (t === "in") return "green"
  if (t === "out") return "red"
  if (t === "transfer") return "blue"
  return "amber"
}

export default function Stock() {
  const onHand = useList<StockLevel>("/stock/on-hand")
  const movements = useList<Movement>("/stock/movements")
  const items = useList<Item>("/items")
  const warehouses = useList<Warehouse>("/warehouses")

  const itemName = (id: number) =>
    items.data.find((i) => i.id === id)?.name ?? `#${id}`
  const whName = (id: number) =>
    warehouses.data.find((w) => w.id === id)?.name ?? `#${id}`

  const [tForm, setTForm] = useState({
    item_id: "",
    from_warehouse_id: "",
    to_warehouse_id: "",
    qty: "1",
  })
  const [oForm, setOForm] = useState({
    item_id: "",
    warehouse_id: "",
    counted_qty: "0",
  })
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const setT = (k: keyof typeof tForm, v: string) =>
    setTForm((p) => ({ ...p, [k]: v }))
  const setO = (k: keyof typeof oForm, v: string) =>
    setOForm((p) => ({ ...p, [k]: v }))

  const reloadAll = () => {
    onHand.reload()
    movements.reload()
  }

  const submitTransfer = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMsg(null)
    if (!tForm.item_id || !tForm.from_warehouse_id || !tForm.to_warehouse_id) {
      setError("Lengkapi data transfer")
      return
    }
    try {
      await api.post("/stock/transfer", {
        item_id: Number(tForm.item_id),
        from_warehouse_id: Number(tForm.from_warehouse_id),
        to_warehouse_id: Number(tForm.to_warehouse_id),
        qty: Number(tForm.qty),
      })
      setMsg("Transfer berhasil")
      reloadAll()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal transfer")
    }
  }

  const submitOpname = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMsg(null)
    if (!oForm.item_id || !oForm.warehouse_id) {
      setError("Lengkapi data opname")
      return
    }
    try {
      await api.post("/stock/opname", {
        item_id: Number(oForm.item_id),
        warehouse_id: Number(oForm.warehouse_id),
        counted_qty: Number(oForm.counted_qty),
      })
      setMsg("Stock opname tercatat")
      reloadAll()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal opname")
    }
  }

  return (
    <div style={sectionGap}>
      <PageHeader
        title="Stok"
        subtitle="Stok on-hand, transfer antar gudang, dan stock opname"
      />
      {error ? <Banner tone="error">{error}</Banner> : null}
      {msg ? <Banner tone="success">{msg}</Banner> : null}

      <div style={twoCol}>
        <Card>
          <div style={titleStyle}>Transfer Antar Gudang</div>
          <form onSubmit={submitTransfer}>
            <Field label="Item">
              <Select
                value={tForm.item_id}
                onChange={(e) => setT("item_id", e.target.value)}
                required
              >
                <option value="">— Pilih item —</option>
                {items.data.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.sku} · {i.name}
                  </option>
                ))}
              </Select>
            </Field>
            <FormGrid columns={2}>
              <Field label="Dari Gudang">
                <Select
                  value={tForm.from_warehouse_id}
                  onChange={(e) => setT("from_warehouse_id", e.target.value)}
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
              <Field label="Ke Gudang">
                <Select
                  value={tForm.to_warehouse_id}
                  onChange={(e) => setT("to_warehouse_id", e.target.value)}
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
            </FormGrid>
            <Field label="Qty">
              <TextInput
                type="number"
                value={tForm.qty}
                onChange={(e) => setT("qty", e.target.value)}
              />
            </Field>
            <Button type="submit">Transfer</Button>
          </form>
        </Card>

        <Card>
          <div style={titleStyle}>Stock Opname</div>
          <form onSubmit={submitOpname}>
            <Field label="Item">
              <Select
                value={oForm.item_id}
                onChange={(e) => setO("item_id", e.target.value)}
                required
              >
                <option value="">— Pilih item —</option>
                {items.data.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.sku} · {i.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Gudang">
              <Select
                value={oForm.warehouse_id}
                onChange={(e) => setO("warehouse_id", e.target.value)}
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
            <Field label="Jumlah Fisik (hasil hitung)">
              <TextInput
                type="number"
                value={oForm.counted_qty}
                onChange={(e) => setO("counted_qty", e.target.value)}
              />
            </Field>
            <Button type="submit">Simpan Opname</Button>
          </form>
        </Card>
      </div>

      <Card>
        <div style={titleStyle}>Stok On-Hand</div>
        {onHand.loading ? (
          <Loading />
        ) : (
          <Table headers={["Item", "Gudang", "Qty"]}>
            {onHand.data.map((s) => (
              <tr key={`${s.item_id}-${s.warehouse_id}`}>
                <Td>{itemName(s.item_id)}</Td>
                <Td>{whName(s.warehouse_id)}</Td>
                <Td align="right">{s.qty}</Td>
              </tr>
            ))}
            {onHand.data.length === 0 ? (
              <tr>
                <Td>{"—"}</Td>
                <Td>Belum ada stok</Td>
                <Td>{"—"}</Td>
              </tr>
            ) : null}
          </Table>
        )}
      </Card>

      <Card>
        <div style={titleStyle}>Pergerakan Terakhir</div>
        {movements.loading ? (
          <Loading />
        ) : (
          <Table headers={["No Dok", "Tipe", "Item", "Gudang", "Qty"]}>
            {movements.data.map((m) => (
              <tr key={m.id}>
                <Td>{m.doc_no}</Td>
                <Td>
                  <Badge tone={moveTone(m.type)}>{m.type}</Badge>
                </Td>
                <Td>{itemName(m.item_id)}</Td>
                <Td>{whName(m.warehouse_id)}</Td>
                <Td align="right">{m.qty}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  )
}
