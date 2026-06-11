import type { CSSProperties } from "react"
import { NavLink } from "react-router-dom"

import { useAuth } from "../auth"

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/items", label: "Master Item", end: false },
  { to: "/master", label: "Master Data", end: false },
  { to: "/purchase-orders", label: "Pembelian", end: false },
  { to: "/invoices", label: "Penjualan", end: false },
  { to: "/stock", label: "Stok", end: false },
]

const aside: CSSProperties = {
  background: "var(--slate-900)",
  color: "#cbd5e1",
  padding: "16px 12px",
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
}
const brand: CSSProperties = {
  color: "#fff",
  fontWeight: 700,
  fontSize: 16,
  padding: "8px 10px 16px",
}
const navWrap: CSSProperties = { flex: 1 }
const signOutStyle: CSSProperties = {
  background: "transparent",
  color: "#94a3b8",
  border: "1px solid #334155",
  borderRadius: 8,
  padding: "9px 14px",
  cursor: "pointer",
  fontSize: 13,
  width: "100%",
}

function linkStyle(isActive: boolean): CSSProperties {
  return {
    display: "block",
    padding: "9px 14px",
    margin: "2px 0",
    borderRadius: 8,
    color: isActive ? "#fff" : "#cbd5e1",
    background: isActive ? "var(--primary)" : "transparent",
    textDecoration: "none",
    fontSize: 14,
  }
}

export default function Sidebar() {
  const { signOut } = useAuth()
  return (
    <aside style={aside}>
      <div style={brand}>StokPro</div>
      <nav style={navWrap}>
        {links.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            style={(s) => linkStyle(s.isActive)}
          >
            {it.label}
          </NavLink>
        ))}
      </nav>
      <button style={signOutStyle} onClick={signOut}>
        Keluar
      </button>
    </aside>
  )
}
