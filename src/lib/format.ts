export function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | number): string {
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: typeof value === "number" ? "short" : undefined,
  }).format(date);
}
