import { useState, type CSSProperties, type FormEvent } from "react"

import { api } from "../api/client"
import {
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
import type { Branch, Category, Supplier, Warehouse } from "../types"

const sectionGap: CSSProperties = { display: "grid", gap: 16 }
const twoCol: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
  alignItems: "start",
}
const sectionTitle: CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  marginBottom: 12,
}
const tableWrap: CSSProperties = { marginTop: 14 }

function Categories() {
  const list = useList<Category>("/categories")
  const [name, setName] = useState("")
  const [err, setErr] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErr(null)
    try {
      await api.post("/categories", { name })
      setName("")
      list.reload()
    } catch (e2: unknown) {
      setErr(e2 instanceof Error ? e2.message : "Gagal menyimpan")
    }
  }

  return (
    <Card>
      <div style={sectionTitle}>Kategori</div>
      {err ? <Banner tone="error">{err}</Banner> : null}
      <form onSubmit={submit}>
        <Field label="Nama Kategori">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>
        <Button type="submit">Tambah Kategori</Button>
      </form>
      <div style={tableWrap}>
        {list.loading ? (
          <Loading />
        ) : (
          <Table headers={["Nama"]}>
            {list.data.map((c) => (
              <tr key={c.id}>
                <Td>{c.name}</Td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </Card>
  )
}

function Suppliers() {
  const list = useList<Supplier>("/suppliers")
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  })
  const [err, setErr] = useState<string | null>(null)
  const set = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErr(null)
    try {
      await api.post("/suppliers", {
        name: form.name,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
      })
      setForm({ name: "", phone: "", email: "", address: "" })
      list.reload()
    } catch (e2: unknown) {
      setErr(e2 instanceof Error ? e2.message : "Gagal menyimpan")
    }
  }

  return (
    <Card>
      <div style={sectionTitle}>Supplier</div>
      {err ? <Banner tone="error">{err}</Banner> : null}
      <form onSubmit={submit}>
        <FormGrid columns={2}>
          <Field label="Nama">
            <TextInput
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </Field>
          <Field label="Telepon">
            <TextInput
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label="Email">
            <TextInput
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field label="Alamat">
            <TextInput
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </Field>
        </FormGrid>
        <Button type="submit">Tambah Supplier</Button>
      </form>
      <div style={tableWrap}>
        {list.loading ? (
          <Loading />
        ) : (
          <Table headers={["Nama", "Telepon", "Email"]}>
            {list.data.map((s) => (
              <tr key={s.id}>
                <Td>{s.name}</Td>
                <Td>{s.phone ?? "—"}</Td>
                <Td>{s.email ?? "—"}</Td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </Card>
  )
}

function Branches() {
  const list = useList<Branch>("/branches")
  const [form, setForm] = useState({ code: "", name: "", address: "" })
  const [err, setErr] = useState<string | null>(null)
  const set = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErr(null)
    try {
      await api.post("/branches", {
        code: form.code,
        name: form.name,
        address: form.address || null,
      })
      setForm({ code: "", name: "", address: "" })
      list.reload()
    } catch (e2: unknown) {
      setErr(e2 instanceof Error ? e2.message : "Gagal menyimpan")
    }
  }

  return (
    <Card>
      <div style={sectionTitle}>Cabang</div>
      {err ? <Banner tone="error">{err}</Banner> : null}
      <form onSubmit={submit}>
        <FormGrid columns={2}>
          <Field label="Kode">
            <TextInput
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
              required
            />
          </Field>
          <Field label="Nama">
            <TextInput
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </Field>
          <Field label="Alamat">
            <TextInput
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </Field>
        </FormGrid>
        <Button type="submit">Tambah Cabang</Button>
      </form>
      <div style={tableWrap}>
        {list.loading ? (
          <Loading />
        ) : (
          <Table headers={["Kode", "Nama", "Alamat"]}>
            {list.data.map((b) => (
              <tr key={b.id}>
                <Td>{b.code}</Td>
                <Td>{b.name}</Td>
                <Td>{b.address ?? "—"}</Td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </Card>
  )
}

function Warehouses() {
  const list = useList<Warehouse>("/warehouses")
  const branches = useList<Branch>("/branches")
  const [form, setForm] = useState({ code: "", name: "", branch_id: "" })
  const [err, setErr] = useState<string | null>(null)
  const set = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }))

  const branchName = (id: number) =>
    branches.data.find((b) => b.id === id)?.name ?? `#${id}`

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!form.branch_id) {
      setErr("Pilih cabang")
      return
    }
    try {
      await api.post("/warehouses", {
        code: form.code,
        name: form.name,
        branch_id: Number(form.branch_id),
      })
      setForm({ code: "", name: "", branch_id: "" })
      list.reload()
    } catch (e2: unknown) {
      setErr(e2 instanceof Error ? e2.message : "Gagal menyimpan")
    }
  }

  return (
    <Card>
      <div style={sectionTitle}>Gudang</div>
      {err ? <Banner tone="error">{err}</Banner> : null}
      <form onSubmit={submit}>
        <FormGrid columns={2}>
          <Field label="Kode">
            <TextInput
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
              required
            />
          </Field>
          <Field label="Nama">
            <TextInput
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </Field>
          <Field label="Cabang">
            <Select
              value={form.branch_id}
              onChange={(e) => set("branch_id", e.target.value)}
              required
            >
              <option value="">— Pilih —</option>
              {branches.data.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </Field>
        </FormGrid>
        <Button type="submit">Tambah Gudang</Button>
      </form>
      <div style={tableWrap}>
        {list.loading ? (
          <Loading />
        ) : (
          <Table headers={["Kode", "Nama", "Cabang"]}>
            {list.data.map((w) => (
              <tr key={w.id}>
                <Td>{w.code}</Td>
                <Td>{w.name}</Td>
                <Td>{branchName(w.branch_id)}</Td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </Card>
  )
}

export default function Master() {
  return (
    <div style={sectionGap}>
      <PageHeader
        title="Master Data"
        subtitle="Kategori, supplier, cabang, dan gudang"
      />
      <div style={twoCol}>
        <Categories />
        <Suppliers />
        <Branches />
        <Warehouses />
      </div>
    </div>
  )
}
