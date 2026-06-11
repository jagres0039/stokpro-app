import type { CSSProperties } from "react"

const h1Style: CSSProperties = { fontSize: 20 }
const pStyle: CSSProperties = { color: "var(--muted)", marginTop: 8 }

export default function Dashboard() {
  return (
    <div>
      <h1 style={h1Style}>Dashboard</h1>
      <p style={pStyle}>
        Selamat datang di StokPro. Scaffold siap — hubungkan ke API backend.
      </p>
    </div>
  )
}
