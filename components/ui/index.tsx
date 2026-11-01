import { cn } from "@/lib/cn";
import { fmtDate } from "@/lib/date";
import React from "react";
export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-border/80 bg-card shadow-[0_1px_2px_hsl(var(--foreground)/0.04),0_4px_16px_-8px_hsl(var(--foreground)/0.08)]", className)} {...p} />;
}
export function CardHeader({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return <div className="flex items-start justify-between px-6 pb-2 pt-5"><div><h3 className="font-display text-base font-semibold text-foreground">{title}</h3>{desc && <p className="text-sm text-muted-foreground">{desc}</p>}</div>{action}</div>;
}
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" | "danger" | "success" };
export function Button({ className, variant = "primary", ...p }: BtnProps) {
  const v = { primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90", outline: "border border-border bg-card hover:bg-muted text-foreground", ghost: "hover:bg-muted text-foreground", danger: "bg-danger text-white hover:bg-danger/90", success: "bg-success text-white hover:bg-success/90" }[variant];
  return <button className={cn("inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition duration-[120ms] active:scale-[.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20 disabled:opacity-50", v, className)} {...p} />;
}
const tones: Record<string, string> = { green: "bg-success/10 text-success ring-success/25", blue: "bg-info/10 text-info ring-info/25", amber: "bg-warning/10 text-warning ring-warning/25", red: "bg-danger/10 text-danger ring-danger/25", slate: "bg-muted text-muted-foreground ring-border", violet: "bg-primary/10 text-primary ring-primary/25", teal: "bg-primary/10 text-primary ring-primary/25", saffron: "bg-highlight/15 text-foreground ring-highlight/40" };
export function Badge({ tone = "slate", children }: { tone?: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-medium ring-1 ring-inset", tones[tone])}>{children}</span>;
}
export function Table({ cols, rows }: { cols: string[]; rows: React.ReactNode[][] }) {
  return <div className="relative overflow-x-auto" tabIndex={0}><table className="w-full text-sm"><thead><tr className="border-y border-border bg-muted/40 text-left text-xs text-muted-foreground">{cols.map(c => <th key={c} className="px-5 py-3 font-medium">{c}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i} className="border-b border-border last:border-0 hover:bg-muted">{r.map((c, j) => <td key={j} className="px-5 py-3 text-foreground tabular-nums">{typeof c === "string" ? fmtDate(c) : c}</td>)}</tr>)}</tbody></table></div>;
}
export function Field({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>{children ?? <input defaultValue={value} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" />}</label>;
}
export function Select({ label, options }: { label: string; options: string[] }) {
  return <Field label={label}><select className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm">{options.map(o => <option key={o}>{o}</option>)}</select></Field>;
}
export function trendFor(label: string): number[] { let h = 7; for (const ch of label) h = (h * 31 + ch.charCodeAt(0)) % 9973; return Array.from({ length: 8 }, (_, i) => { h = (h * 17 + 11) % 9973; return 40 + (h % 30) + i * ((label.length % 3) - 1) * 3; }); }
export function Spark({ data, label }: { data: number[]; label: string }) {
  const mx = Math.max(...data), mn = Math.min(...data), r = mx - mn || 1; const pts = data.map((v, i) => `${(i / (data.length - 1)) * 96},${30 - ((v - mn) / r) * 26}`).join(" ");
  return <svg viewBox="0 0 96 32" className="h-8 w-24 text-primary" role="img" aria-label={`${label}: sample trend, last 8 weeks (demo data)`}><polyline points={pts} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" /></svg>;
}
export function Stat({ label, value, sub, tone = "text-foreground", trend, href, goodUp = true }: { label: string; value: string; sub?: string; tone?: string; trend?: number[]; href?: string; goodUp?: boolean }) {
  if (trend || href) { const d = trend ? Math.round(((trend[trend.length - 1] - trend[trend.length - 2]) / trend[trend.length - 2]) * 100) : 0; const good = d === 0 ? null : (d > 0) === goodUp; const chg = d === 0 ? "no change on last week" : `${d > 0 ? "up" : "down"} ${Math.abs(d)}% on last week`; const srText = `${label} ${value}${trend ? `, ${chg}${good === null ? "" : good ? " (good)" : " (needs a look)"}, sample trend` : ""}${sub ? `, ${sub}` : ""}. Open`;
    const inner = <Card className="h-full p-5 transition duration-[160ms] hover:-translate-y-px hover:border-primary/40 hover:shadow-sm"><p className="text-[13px] font-medium text-muted-foreground">{label}</p><div className="mt-2 flex items-end justify-between gap-2"><p className={cn("font-display text-[30px] font-semibold leading-8 tabular-nums", tone)}>{value}</p>{trend && <div className="flex flex-col items-end"><Spark data={trend} label={label} /><span className="text-[10px] text-muted-foreground">Sample trend</span></div>}</div><div className="mt-1 flex flex-wrap items-center gap-2">{trend && <span data-testid="kpi-delta" className={cn("rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums", good === null ? "bg-muted text-muted-foreground" : good ? "bg-success/10 text-success" : "bg-danger/10 text-danger")}><span aria-hidden>{d > 0 ? "▲ " : d < 0 ? "▼ " : "• "}</span>{chg}</span>}{sub && <span className="text-xs text-muted-foreground">{sub}</span>}</div></Card>;
    return href ? <a href={href} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2" aria-label={srText}>{inner}</a> : inner; }
  return <Card className="p-5"><p className="text-[13px] font-medium text-muted-foreground">{label}</p><p className={cn("mt-2 font-display text-[30px] font-semibold leading-8 tabular-nums", tone)}>{value}</p>{sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}</Card>;
}
export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return <div className="relative flex gap-1 overflow-x-auto border-b border-border">{tabs.map(t => <button key={t} aria-pressed={active === t} onClick={() => onChange(t)} className={cn("-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium", active === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{t}</button>)}</div>;
}
export function Drawer({ open, title, onClose, children, footer, wide }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-label={title} onKeyDown={e => e.key === "Escape" && onClose()}>
    <div className="absolute inset-0 bg-black/50" onClick={onClose} />
    <div className={cn("relative flex h-full w-full flex-col bg-card shadow-2xl", wide ? "max-w-3xl" : "max-w-lg")}>
      <div className="flex items-center justify-between border-b border-border px-5 py-4"><h2 className="font-semibold">{title}</h2><button aria-label="Close" onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-muted">✕</button></div>
      <div className="flex-1 overflow-y-auto p-5">{children}</div>{footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-3">{footer}</div>}
    </div></div>;
}
export function Modal({ open, title, onClose, children, footer }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-label={title}><div className="absolute inset-0 bg-black/50" onClick={onClose} /><div className="relative w-full max-w-md rounded-xl bg-card shadow-2xl"><div className="border-b border-border px-5 py-4 font-semibold">{title}</div><div className="p-5 text-sm">{children}</div><div className="flex justify-end gap-2 border-t border-border px-5 py-3">{footer}</div></div></div>;
}
/** Pulli Grid 3×3 dot loader: dots light in kolam order. */
export function DotLoader({ label = "Loading" }: { label?: string }) {
  const order = [0, 1, 2, 5, 8, 7, 6, 3, 4];
  return <span role="status" aria-label={label} className="inline-grid grid-cols-3 gap-1">{Array.from({ length: 9 }).map((_, i) => <span key={i} className="tc-dot h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: `${order.indexOf(i) * 100}ms` }} />)}</span>;
}
export function Skeleton({ rows = 6 }: { rows?: number }) {
  return <div className="space-y-2 p-5" data-testid="skeleton"><div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground"><DotLoader />Loading…</div>{Array.from({ length: rows }).map((_, i) => <div key={i} className="h-9 animate-pulse rounded bg-muted" />)}</div>;
}
export function Empty({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return <div className="flex flex-col items-center gap-2 px-6 py-14 text-center"><div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-xl">∅</div><p className="font-medium">{title}</p>{hint && <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>}{action}</div>;
}
