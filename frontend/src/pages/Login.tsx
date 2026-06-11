import { useState, type CSSProperties, type FormEvent } from "react"

import { useAuth } from "../auth"
import { Banner, Button, Field, TextInput } from "../components/ui"

const wrap: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--slate-900)",
  padding: 20,
}
const cardStyle: CSSProperties = {
  background: "#fff",
  borderRadius: 14,
  padding: 30,
  width: 360,
  boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
}
const brand: CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  color: "var(--primary-d)",
  marginBottom: 4,
}
const sub: CSSProperties = {
  color: "var(--muted)",
  fontSize: 13,
  marginBottom: 20,
}
const hint: CSSProperties = {
  color: "var(--muted)",
  fontSize: 12,
  marginTop: 14,
  textAlign: "center",
}
const fullWidth: CSSProperties = { width: "100%" }

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState("admin@stokpro.local")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await signIn(email, password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login gagal")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={wrap}>
      <form style={cardStyle} onSubmit={onSubmit}>
        <div style={brand}>StokPro</div>
        <div style={sub}>Sistem Manajemen Gudang</div>
        {error ? <Banner tone="error">{error}</Banner> : null}
        <Field label="Email">
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </Field>
        <Field label="Password">
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </Field>
        <Button type="submit" disabled={busy} style={fullWidth}>
          {busy ? "Memproses\u2026" : "Masuk"}
        </Button>
        <div style={hint}>Demo: admin@stokpro.local / admin12345</div>
      </form>
    </div>
  )
}
