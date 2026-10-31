import { cn } from "@/lib/cn";
import React from "react";
export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-slate-200 bg-white shadow-sm", className)} {...p} />;
}
export function CardHeader({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4"><div><h3 className="font-semibold text-slate-900">{title}</h3>{desc && <p className="text-sm text-slate-500">{desc}</p>}</div>{action}</div>;
}
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" | "danger" | "success" };
export function Button({ className, variant = "primary", ...p }: BtnProps) {
  const v = { primary: "bg-indigo-600 text-white hover:bg-indigo-700", outline: "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700", ghost: "hover:bg-slate-100 text-slate-700", danger: "bg-rose-600 text-white hover:bg-rose-700", success: "bg-emerald-600 text-white hover:bg-emerald-700" }[variant];
  return <button className={cn("inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:opacity-50", v, className)} {...p} />;
}
const tones: Record<string, string> = { green: "bg-emerald-50 text-emerald-700 ring-emerald-200", blue: "bg-sky-50 text-sky-700 ring-sky-200", amber: "bg-amber-50 text-amber-800 ring-amber-200", red: "bg-rose-50 text-rose-700 ring-rose-200", slate: "bg-slate-100 text-slate-700 ring-slate-200", violet: "bg-violet-50 text-violet-700 ring-violet-200" };
export function Badge({ tone = "slate", children }: { tone?: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", tones[tone])}>{children}</span>;
}
export function Table({ cols, rows }: { cols: string[]; rows: React.ReactNode[][] }) {
  return <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs uppercase tracking-wide text-slate-500">{cols.map(c => <th key={c} className="px-4 py-2.5 font-medium">{c}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">{r.map((c, j) => <td key={j} className="px-4 py-2.5 text-slate-700">{c}</td>)}</tr>)}</tbody></table></div>;
}
export function Field({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>{children ?? <input defaultValue={value} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />}</label>;
}
export function Select({ label, options }: { label: string; options: string[] }) {
  return <Field label={label}><select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">{options.map(o => <option key={o}>{o}</option>)}</select></Field>;
}
export function Stat({ label, value, sub, tone = "text-slate-900" }: { label: string; value: string; sub?: string; tone?: string }) {
  return <Card className="p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><p className={cn("mt-1 text-2xl font-semibold", tone)}>{value}</p>{sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}</Card>;
}
export function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return <div className="flex gap-1 border-b border-slate-200">{tabs.map(t => <button key={t} onClick={() => onChange(t)} className={cn("-mb-px border-b-2 px-3 py-2 text-sm font-medium", active === t ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800")}>{t}</button>)}</div>;
}
