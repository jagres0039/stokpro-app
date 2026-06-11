import type { CSSProperties } from "react"
import { NavLink } from "react-router-dom"

const items = [
  { to: "/", label: "Dashboard" },
  { to: "/items", label: "Master Item" },
  { to: "/stock-in", label: "Stok Masuk" },
  { to: "/stock-out", label: "Stok Keluar" },
]

const aside: CSSProperties = {
  background: "var(--slate-900)",
  color: "#cbd5e1",
  padding: "16px 12px",
}
const brand: CSSProperties = {
  color: "#fff",
  fontWeight: 700,
  fontSize: 16,
  padding: "8px 10px 16px",
}

const link = (isActive: boolean): CSSProperties => ({
  display: "block",
  padding: "9px 14px",
  margin: "2px 0",
  borderRadius: 8,
  color: isActive ? "#fff" : "#cbd5e1",
  background: isActive ? "var(--primary)" : "transparent",
  textDecoration: "none",
})

export default function Sidebar() {
  return (
    <aside style={aside}>
      <div style={brand}>StokPro</div>
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} style={(s) => link(s.isActive)}>
          {it.label}
        </NavLink>
      ))}
    </aside>
  )
}
