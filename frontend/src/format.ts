const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

export function fmtMoney(value: string | number): string {
  const n = Number(value)
  return Number.isNaN(n) ? String(value) : idr.format(n)
}

export function fmtDate(value: string | null): string {
  if (!value) return "\u2014"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}
