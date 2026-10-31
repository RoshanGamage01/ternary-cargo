"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, Database, Ship, Boxes, FileStack, ShieldCheck, MapPin, Bell, PackageOpen, ClipboardCheck, Truck, Receipt, BarChart3, Settings, Search, Calculator, Factory, Barcode, Layers, ListChecks, Container, PackageCheck, Moon, Sun, Menu, Sparkles, AlertOctagon, Smartphone, ChevronRight, CalendarCheck, Globe } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
export const nav = [
  { group: "Home", items: [["dashboard", "Dashboard", LayoutDashboard], ["exceptions", "Exceptions", AlertOctagon]] },
  { group: "Manufacturing", items: [["manufacturing/orders", "Sales orders", Factory], ["manufacturing/serialisation", "Serialisation", Barcode], ["manufacturing/palletising", "Palletising", Layers], ["manufacturing/packing-lists", "Packing lists", ListChecks], ["manufacturing/load-plan", "Load planner 3D", Container], ["manufacturing/loading", "Loading confirmation", PackageCheck], ["manufacturing/receiving", "Unloading confirmation", CalendarCheck]] },
  { group: "Freight operations", items: [["quotations", "Quotations", Calculator], ["bookings", "Bookings", CalendarCheck], ["shipments", "Shipments", Ship], ["consolidation", "Consolidation / ULD", Boxes], ["documents", "Documents", FileStack], ["customs", "Customs", ShieldCheck], ["tracking", "Tracking & ETA", MapPin], ["arrival", "Arrival notices", Bell]] },
  { group: "Warehouse", items: [["unloading", "Unloading & tally", PackageOpen], ["verification", "Verification", ClipboardCheck], ["scan", "Mobile scan", Smartphone], ["release", "Delivery orders", Truck]] },
  { group: "Finance & admin", items: [["billing", "Billing", Receipt], ["reports", "Reports", BarChart3], ["master-data", "Master data", Database], ["settings", "Settings", Settings], ["portal/TC-SEA-24121", "Customer portal", Globe]] },
] as const;
const flat = nav.flatMap(g => g.items.map(([k, l]) => ({ k, l, g: g.group })));
export function Shell({ active, title, subtitle, actions, children, crumbs }: { active: string; title: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode; crumbs?: [string, string?][] }) {
  const { palette, setPalette, dark, setDark, notifs, markRead } = useStore();
  const [mob, setMob] = useState(false); const [np, setNp] = useState(false); const [ai, setAi] = useState(false);
  useEffect(() => { const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette(true); } if (e.key === "Escape") { setPalette(false); setNp(false); } }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [setPalette]);
  const group = flat.find(f => f.k === active)?.g;
  const unread = notifs.filter(n => !n.read).length;
  return <div className="flex min-h-screen">
    <aside className={cn("fixed inset-y-0 z-40 w-60 overflow-y-auto bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0", mob ? "translate-x-0" : "-translate-x-full")}>
      <Link href="/dashboard" className="flex items-center gap-2 px-5 py-4"><img src="/brand/ternary-mark-reversed.svg" alt="Ternary" className="h-8 w-8" /><div><p className="font-display text-sm font-semibold text-white">Ternary <span className="font-normal text-[#4DB6AC]">Cargo</span></p><p className="text-[11px] text-muted-foreground">Factory → consignee</p></div></Link>
      <nav className="space-y-3 px-3 pb-6">{nav.map(g => <div key={g.group}><p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{g.group}</p>{g.items.map(([k, l, I]) => <Link key={k} href={`/${k}`} onClick={() => setMob(false)} className={cn("flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px]", active === k ? "bg-sidebar-active/20 text-white ring-1 ring-inset ring-white/10" : "hover:bg-white/5 hover:text-white")}><I size={16} />{l}</Link>)}</div>)}</nav>
    </aside>
    {mob && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMob(false)} />}
    <div className="flex-1 lg:ml-60 print-ml0">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-card/90 px-4 backdrop-blur lg:px-6">
        <button aria-label="Open menu" className="rounded p-1.5 hover:bg-muted lg:hidden" onClick={() => setMob(true)}><Menu size={20} /></button>
        <button onClick={() => setPalette(true)} className="flex w-full max-w-md items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5 text-sm text-muted-foreground"><Search size={15} /><span className="flex-1 text-left">Search shipments, orders, SSCC, customers…</span><kbd className="rounded border border-border bg-card px-1.5 text-[10px] text-muted-foreground">Ctrl K</kbd></button>
        <div className="flex items-center gap-1.5 text-sm">
          <button onClick={() => setAi(true)} className="hidden items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white sm:flex"><Sparkles size={14} />Ask Ternary</button>
          <button aria-label="Toggle dark mode" onClick={() => setDark(!dark)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button aria-label="Notifications" onClick={() => setNp(!np)} className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted"><Bell size={18} />{unread > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-danger/100 px-1 text-[10px] text-white">{unread}</span>}</button>
          <Link href="/settings" className="grid h-8 w-8 place-items-center rounded-full bg-accent text-xs font-semibold text-primary">NP</Link>
        </div>
        {np && <div className="absolute right-4 top-14 w-96 rounded-xl border border-border bg-card shadow-xl"><div className="flex items-center justify-between border-b border-border px-4 py-3"><p className="font-semibold">Notifications</p><button className="text-xs text-primary" onClick={markRead}>Mark all read</button></div><ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">{notifs.map(n => <li key={n.id}><Link href={n.href ?? "/dashboard"} onClick={() => setNp(false)} className="flex gap-3 px-4 py-3 text-sm hover:bg-muted"><span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-border" : "bg-primary")} /><span className="flex-1">{n.text}</span><span className="text-xs text-muted-foreground">{n.at}</span></Link></li>)}</ul></div>}
      </header>
      <main className="p-4 lg:p-6">
        <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1 text-xs text-muted-foreground no-print"><Link href="/dashboard" className="hover:text-foreground">Home</Link>{group && group !== "Home" && <><ChevronRight size={12} /><span>{group}</span></>}{(crumbs ?? [[title]]).map(([l, h], i) => <span key={i} className="flex items-center gap-1"><ChevronRight size={12} />{h ? <Link href={h} className="hover:text-foreground">{l}</Link> : <span className="text-foreground">{l}</span>}</span>)}</nav>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">{title}</h1>{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}</div><div className="flex flex-wrap gap-2 no-print">{actions}</div></div>{children}</main>
    </div>
    {palette && <Palette onClose={() => setPalette(false)} />}
    {ai && <Assistant onClose={() => setAi(false)} />}
  </div>;
}
function Palette({ onClose }: { onClose: () => void }) {
  const { db } = useStore(); const router = useRouter(); const [q, setQ] = useState(""); const [i, setI] = useState(0);
  const items = useMemo(() => {
    const pages = flat.map(f => ({ label: f.l, sub: f.g, href: `/${f.k}` }));
    const recs = [...db.shipments.map(s => ({ label: s.ref, sub: `Shipment · ${s.doc} · ${s.consignee}`, href: `/shipments/${s.ref}` })), ...db.salesOrders.map(s => ({ label: s.ref, sub: `Sales order · ${s.buyer}`, href: `/manufacturing/orders/${s.ref}` })), ...db.customers.map(c => ({ label: c.name, sub: `Customer · ${c.code}`, href: "/master-data?tab=customers" })), ...db.pallets.map(p => ({ label: p.sscc, sub: `Pallet SSCC · ${p.so}`, href: "/manufacturing/palletising" })), ...db.invoices.map(v => ({ label: v.ref, sub: `Invoice · ${v.customer}`, href: "/billing" }))];
    const actions = [{ label: "New shipment", sub: "Action", href: "/shipments/new" }, { label: "New sales order", sub: "Action", href: "/manufacturing/orders?new=1" }, { label: "Open 3D load planner", sub: "Action", href: "/manufacturing/load-plan" }, { label: "Onboard a new tenant", sub: "Action", href: "/onboarding" }];
    const all = [...actions, ...pages, ...recs];
    return q ? all.filter(x => (x.label + x.sub).toLowerCase().includes(q.toLowerCase())).slice(0, 12) : all.slice(0, 10);
  }, [q, db]);
  const go = (h: string) => { onClose(); router.push(h); };
  return <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 pt-24" onClick={onClose}><div className="w-full max-w-xl overflow-hidden rounded-xl bg-card shadow-2xl" onClick={e => e.stopPropagation()}>
    <div className="flex items-center gap-2 border-b border-border px-4"><Search size={16} className="text-muted-foreground" /><input autoFocus aria-label="Command palette search" value={q} onChange={e => { setQ(e.target.value); setI(0); }} onKeyDown={e => { if (e.key === "ArrowDown") setI(Math.min(i + 1, items.length - 1)); if (e.key === "ArrowUp") setI(Math.max(i - 1, 0)); if (e.key === "Enter" && items[i]) go(items[i].href); }} placeholder="Type a command or search…" className="w-full py-3 text-sm outline-none bg-transparent" /></div>
    <ul className="max-h-80 overflow-y-auto py-1">{items.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted-foreground">No results for “{q}”</li>}{items.map((x, j) => <li key={x.label + j}><button onMouseEnter={() => setI(j)} onClick={() => go(x.href)} className={cn("flex w-full items-center justify-between px-4 py-2 text-left text-sm", j === i && "bg-accent")}><span className="font-medium">{x.label}</span><span className="text-xs text-muted-foreground">{x.sub}</span></button></li>)}</ul>
    <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">↑↓ to navigate · Enter to open · Esc to close</p></div></div>;
}
function Assistant({ onClose }: { onClose: () => void }) {
  const { db } = useStore();
  const [msgs, setMsgs] = useState<{ me: boolean; t: string }[]>([{ me: false, t: "Hi Nimal. Ask me where a shipment is, or drop a commercial invoice to extract its fields. (Prototype: canned logic, no real AI.)" }]);
  const [q, setQ] = useState("");
  const answer = (text: string) => {
    const s = db.shipments.find(x => text.toUpperCase().includes(x.ref) || text.toLowerCase().includes(x.consignee.toLowerCase().split(" ")[0]));
    if (s) return `${s.ref} (${s.mode}, ${s.doc}) is “${s.status}”. ${s.pol} → ${s.pod}. Carrier ETA ${s.eta}. Open /shipments/${s.ref} for the predicted ETA and risks.`;
    if (/late|delay|risk/i.test(text)) return "Highest delay risk right now: TC-SEA-24126 (ONE, Chennai → Colombo, customs risk high) and TC-SEA-24109 (transhipment). See Exceptions.";
    return "I can answer “where is TC-SEA-24121?”, “which shipments are at risk?”, or extract an invoice. Try one of those.";
  };
  const send = (t = q) => { if (!t.trim()) return; setMsgs(m => [...m, { me: true, t }, { me: false, t: answer(t) }]); setQ(""); };
  const extract = () => setMsgs(m => [...m, { me: true, t: "📎 CI-SNG-88124.pdf" }, { me: false, t: "Extracted (mock): Seller Shenzhen Brightway Co. · Buyer Singer Sri Lanka PLC · Incoterm FOB Shenzhen · 2 lines, HS 8528.72 · 12 cartons · 340.0 kg · Total USD 6,800.00. Confidence 94%. [Create shipment from this]" }]);
  return <div className="fixed inset-y-0 right-0 z-[65] flex w-full max-w-sm flex-col border-l border-border bg-card shadow-2xl"><div className="flex items-center justify-between border-b border-border px-4 py-3"><p className="flex items-center gap-2 font-semibold"><Sparkles size={16} className="text-primary" />Ternary assistant <span className="rounded bg-warning/10 px-1.5 text-[10px] text-warning">MOCK</span></p><button aria-label="Close assistant" onClick={onClose}>✕</button></div>
    <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">{msgs.map((m, i) => <div key={i} className={cn("max-w-[85%] rounded-xl px-3 py-2", m.me ? "ml-auto bg-primary text-white" : "bg-muted")}>{m.t}</div>)}</div>
    <div className="flex flex-wrap gap-1.5 px-4 pb-2">{["Where is TC-SEA-24121?", "Which shipments are at risk?"].map(s => <button key={s} onClick={() => send(s)} className="rounded-full border border-border px-2.5 py-1 text-xs hover:bg-muted">{s}</button>)}<button onClick={extract} className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary">Extract invoice (demo)</button></div>
    <form className="flex gap-2 border-t border-border p-3" onSubmit={e => { e.preventDefault(); send(); }}><input aria-label="Ask the assistant" value={q} onChange={e => setQ(e.target.value)} placeholder="Ask about a shipment…" className="flex-1 rounded-lg border border-border px-3 py-2 text-sm" /><button className="rounded-lg bg-primary px-3 text-sm text-white">Send</button></form></div>;
}
