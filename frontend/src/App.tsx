import type { CSSProperties } from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { useAuth } from "./auth"
import Sidebar from "./components/Sidebar"
import Dashboard from "./pages/Dashboard"
import Invoices from "./pages/Invoices"
import Items from "./pages/Items"
import Login from "./pages/Login"
import Master from "./pages/Master"
import PurchaseOrders from "./pages/PurchaseOrders"
import Stock from "./pages/Stock"

const layout: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "236px 1fr",
  minHeight: "100vh",
}
const mainStyle: CSSProperties = { padding: "22px 28px", maxWidth: 1120 }

export default function App() {
  const { token } = useAuth()

  if (!token) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  return (
    <div style={layout}>
      <Sidebar />
      <main style={mainStyle}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/items" element={<Items />} />
          <Route path="/master" element={<Master />} />
          <Route path="/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
