/** British date display: 26 Oct 2026 (en-GB, d MMM yyyy). */
const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
export function fmtDate(v: unknown): string {
  const m = typeof v === "string" ? ISO_RE.exec(v) : null; if (!m) return String(v ?? "");
  return `${+m[3] < 10 ? "0" + +m[3] : m[3]} ${M[+m[2] - 1]} ${m[1]}`;
}
export const toISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const fromISO = (s: string) => { const m = ISO_RE.exec(s); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : undefined; };
