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
import { fmtMoney } from "../format"
import { useList } from "../hooks"
import type { Category, Item } from "../types"

const sectionGap: CSSProperties = { display: "grid", gap: 16 }

const emptyForm = {
  sku: "",
  name: "",
  unit: "pcs",
  category_id: "",
  buy_price: "",
  sell_price: "",
  min_stock: "0",
}

export default function Items() {
  const items = useList<Item>("/items")
  const categories = useList<Category>("/categories")
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const setField = (key: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const catName = (id: number | null): string => {
    if (id === null) return "\u2014"
    const found = categories.data.find((c) => c.id === id)
    return found ? found.name : "\u2014"
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api.post("/items", {
        sku: form.sku,
        name: form.name,
        unit: form.unit || "pcs",
        category_id: form.category_id ? Number(form.category_id) : null,
        buy_price: form.buy_price || "0",
        sell_price: form.sell_price || "0",
        min_stock: Number(form.min_stock || "0"),
      })
      setForm(emptyForm)
      items.reload()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan item")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={sectionGap}>
      <PageHeader title="Master Item" subtitle="Kelola daftar produk / barang" />

      <Card>
        <form onSubmit={onSubmit}>
          {error ? <Banner tone="error">{error}</Banner> : null}
          <FormGrid columns={3}>
            <Field label="SKU">
              <TextInput
                value={form.sku}
                onChange={(e) => setField("sku", e.target.value)}
                required
              />
            </Field>
            <Field label="Nama">
              <TextInput
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                required
              />
            </Field>
            <Field label="Satuan">
              <TextInput
                value={form.unit}
                onChange={(e) => setField("unit", e.target.value)}
              />
            </Field>
            <Field label="Kategori">
              <Select
                value={form.category_id}
                onChange={(e) => setField("category_id", e.target.value)}
              >
                <option value="">— Tanpa kategori —</option>
                {categories.data.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Harga Beli">
              <TextInput
                type="number"
                value={form.buy_price}
                onChange={(e) => setField("buy_price", e.target.value)}
              />
            </Field>
            <Field label="Harga Jual">
              <TextInput
                type="number"
                value={form.sell_price}
                onChange={(e) => setField("sell_price", e.target.value)}
              />
            </Field>
          </FormGrid>
          <Button type="submit" disabled={busy}>
            {busy ? "Menyimpan\u2026" : "Tambah Item"}
          </Button>
        </form>
      </Card>

      <Card>
        {items.loading ? (
          <Loading />
        ) : items.error ? (
          <Banner tone="error">{items.error}</Banner>
        ) : (
          <Table
            headers={[
              "SKU",
              "Nama",
              "Kategori",
              "Satuan",
              "Harga Beli",
              "Harga Jual",
              "Status",
            ]}
          >
            {items.data.map((it) => (
              <tr key={it.id}>
                <Td>{it.sku}</Td>
                <Td>{it.name}</Td>
                <Td>{catName(it.category_id)}</Td>
                <Td>{it.unit}</Td>
                <Td align="right">{fmtMoney(it.buy_price)}</Td>
                <Td align="right">{fmtMoney(it.sell_price)}</Td>
                <Td>
                  <Badge tone={it.is_active ? "green" : "gray"}>
                    {it.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </Td>
              </tr>
            ))}
            {items.data.length === 0 ? (
              <tr>
                <Td>{"\u2014"}</Td>
                <Td>Belum ada item</Td>
                <Td>{"\u2014"}</Td>
                <Td>{"\u2014"}</Td>
                <Td>{"\u2014"}</Td>
                <Td>{"\u2014"}</Td>
                <Td>{"\u2014"}</Td>
              </tr>
            ) : null}
          </Table>
        )}
      </Card>
    </div>
  )
}
