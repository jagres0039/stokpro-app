import type { CSSProperties } from "react"
import { Route, Routes } from "react-router-dom"

import Sidebar from "./components/Sidebar"
import Dashboard from "./pages/Dashboard"

const layout: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "236px 1fr",
  minHeight: "100vh",
}
const mainStyle: CSSProperties = { padding: "22px 24px" }

export default function App() {
  return (
    <div style={layout}>
      <Sidebar />
      <main style={mainStyle}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}
