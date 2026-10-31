"use client";
import Link from "next/link";
import { LayoutDashboard, Database, Ship, Boxes, FileStack, ShieldCheck, MapPin, Bell, PackageOpen, ClipboardCheck, Truck, Receipt, BarChart3, Settings, Search, ChevronDown, Calculator } from "lucide-react";
import { cn } from "@/lib/cn";
export const nav = [
  { group: "Overview", items: [["dashboard", "Dashboard", LayoutDashboard]] },
  { group: "Setup", items: [["master-data", "Master data", Database]] },
  { group: "Operations", items: [["quotations", "Quotations & booking", Calculator], ["shipments", "Shipments", Ship], ["consolidation", "Consolidation / ULD", Boxes], ["documents", "Documents", FileStack], ["customs", "Customs", ShieldCheck], ["tracking", "Tracking", MapPin], ["arrival", "Arrival notices", Bell]] },
  { group: "Warehouse", items: [["unloading", "Unloading & tally", PackageOpen], ["verification", "Verification", ClipboardCheck], ["release", "Delivery orders", Truck]] },
  { group: "Finance & admin", items: [["billing", "Billing", Receipt], ["reports", "Reports", BarChart3], ["settings", "Settings", Settings]] },
] as const;
export function Shell({ active, title, subtitle, actions, children }: { active: string; title: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return <div className="flex min-h-screen">
    <aside className="fixed inset-y-0 w-60 bg-slate-900 text-slate-300">
      <div className="flex items-center gap-2 px-5 py-4"><div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500 font-bold text-white">T</div><div><p className="text-sm font-semibold text-white">Ternary Cargo</p><p className="text-[11px] text-slate-400">Cargo operations cloud</p></div></div>
      <nav className="space-y-3 px-3 pb-6">{nav.map(g => <div key={g.group}><p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{g.group}</p>{g.items.map(([k, l, I]) => <Link key={k} href={`/${k}`} className={cn("flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px]", active === k ? "bg-slate-800 text-white" : "hover:bg-slate-800/60 hover:text-white")}><I size={16} />{l}</Link>)}</div>)}</nav>
    </aside>
    <div className="ml-60 flex-1">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur">
        <div className="flex w-96 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400"><Search size={15} />Search BL, AWB, container, customer…</div>
        <div className="flex items-center gap-4 text-sm"><span className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-slate-700">Ceylon Freight Lines <ChevronDown size={14} /></span><Bell size={18} className="text-slate-500" /><div className="grid h-8 w-8 place-items-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">NP</div></div>
      </header>
      <main className="p-6"><div className="mb-5 flex items-end justify-between"><div><h1 className="text-xl font-semibold text-slate-900">{title}</h1>{subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}</div><div className="flex gap-2">{actions}</div></div>{children}</main>
    </div>
  </div>;
}
