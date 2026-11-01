/** British date display: 26 Oct 2026 (en-GB, d MMM yyyy). */
const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
export function fmtDate(v: unknown): string {
  const m = typeof v === "string" ? ISO_RE.exec(v) : null; if (!m) return String(v ?? "");
  return `${+m[3] < 10 ? "0" + +m[3] : m[3]} ${M[+m[2] - 1]} ${m[1]}`;
}
/** Date-time in Asia/Colombo for audit logs: "01 Nov 2026 14:05". */
export const TZ_LABEL = "Asia/Colombo, UTC+5:30";
export function fmtColombo(iso: string): string {
  const d = new Date(iso); if (isNaN(+d)) return iso;
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(d).map(x => [x.type, x.value]));
  return `${p.day} ${p.month} ${p.year} ${p.hour}:${p.minute}`;
}
export const toISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const fromISO = (s: string) => { const m = ISO_RE.exec(s); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : undefined; };
