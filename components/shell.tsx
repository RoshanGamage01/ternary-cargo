"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, Database, Ship, Boxes, FileStack, ShieldCheck, MapPin, Bell, PackageOpen, ClipboardCheck, Truck, Receipt, BarChart3, Settings, Search, Calculator, Factory, Barcode, Layers, ListChecks, Container, PackageCheck, Moon, Sun, Menu, Sparkles, AlertOctagon, Smartphone, ChevronRight, CalendarCheck, Globe, Compass, BookOpen, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import { PLAIN } from "@/lib/glossary";
import { GuideBanner, Jargon } from "./v3";
import { Switch } from "./ui/switch";
export const nav = [
  { group: "", items: [["start", "Start here", Compass], ["dashboard", "Overview", LayoutDashboard], ["exceptions", "Problems to fix", AlertOctagon]] },
  { group: "Make & pack", items: [["manufacturing/orders", "Export orders", Factory], ["manufacturing/serialisation", "Label cartons", Barcode], ["manufacturing/palletising", "Build pallets", Layers], ["manufacturing/packing-lists", "Packing list", ListChecks], ["manufacturing/load-plan", "Plan the container", Container], ["manufacturing/loading", "Load the container", PackageCheck], ["manufacturing/receiving", "Confirm arrival", CalendarCheck]] },
  { group: "Ship", items: [["quotations", "Get a price", Calculator], ["bookings", "Book space", CalendarCheck], ["shipments", "Shipments", Ship], ["consolidation", "Share a container", Boxes], ["documents", "Documents", FileStack], ["customs", "Customs", ShieldCheck], ["tracking", "Track & arrival time", MapPin], ["arrival", "Tell the receiver", Bell]] },
  { group: "Receive", items: [["unloading", "Unload & count", PackageOpen], ["verification", "Check & sign off", ClipboardCheck], ["scan", "Phone scanner", Smartphone], ["release", "Hand over cargo", Truck]] },
  { group: "Money & setup", items: [["billing", "Invoices", Receipt], ["reports", "Reports", BarChart3], ["master-data", "Lists & contacts", Database], ["settings", "Settings", Settings], ["glossary", "Glossary", BookOpen], ["portal/TC-SEA-24121", "Customer portal", Globe]] },
] as const;
export const ROLES = ["Everyone", "Forwarder ops", "Exporter", "Warehouse", "Finance"] as const;
const ALWAYS = ["start", "dashboard", "exceptions", "settings", "glossary", "master-data"];
export const ROLE_PAGES: Record<string, string[]> = {
  "Forwarder ops": ["quotations", "bookings", "shipments", "consolidation", "documents", "customs", "tracking", "arrival", "release", "billing"],
  Exporter: ["manufacturing/orders", "manufacturing/serialisation", "manufacturing/palletising", "manufacturing/packing-lists", "manufacturing/load-plan", "manufacturing/loading", "manufacturing/receiving", "quotations", "bookings", "shipments", "documents", "tracking"],
  Warehouse: ["manufacturing/receiving", "tracking", "arrival", "unloading", "verification", "scan", "release"],
  Finance: ["quotations", "shipments", "billing", "reports", "portal/TC-SEA-24121"],
};
export const showInMenu = (k: string, role: string, expert: boolean) => expert || role === "Everyone" || ALWAYS.includes(k) || (ROLE_PAGES[role] ?? []).includes(k);
const flat = nav.flatMap(g => g.items.map(([k, l]) => ({ k, l, g: g.group || "Home" })));
export function Shell({ active, title, subtitle, actions, children, crumbs }: { active: string; title: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode; crumbs?: [string, string?][] }) {
  const { palette, setPalette, dark, setDark, notifs, markRead, expert, setExpert, role, setRole } = useStore();
  const [mob, setMob] = useState(false); const [np, setNp] = useState(false); const [ai, setAi] = useState(false); const [collapsed, setCollapsed] = useState(false);
  useEffect(() => { const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette(true); } if (e.key === "Escape") { setPalette(false); setNp(false); } }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [setPalette]);
  const group = flat.find(f => f.k === active)?.g;
  const unread = notifs.filter(n => !n.read).length;
  const gk = title === "New shipment" ? "shipments/new" : active;
  const plain = /^(TC-|SO-|Good|Not |Shipment )/.test(title) ? null : PLAIN[gk];
  const T = plain?.t ?? title; const sub = subtitle;
  return <div className="flex min-h-screen bg-background">
    <aside className={cn("fixed inset-y-0 z-40 overflow-y-auto border-r border-border bg-sidebar text-sidebar-foreground transition-all lg:translate-x-0", collapsed ? "w-[72px]" : "w-64", mob ? "translate-x-0" : "-translate-x-full")}>
      <div className="flex items-center justify-between px-4 py-5"><Link href="/start" className="flex items-center gap-2.5"><img src="/brand/ternary-mark-colour.svg" alt="Ternary" className="h-9 w-9" />{!collapsed && <div><p className="font-display text-[15px] font-semibold text-foreground">Ternary <span className="font-normal text-primary">Cargo</span></p><p className="text-[11px] text-muted-foreground">Ceylon Freight Lines</p></div>}</Link>
        <button aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed(!collapsed)} className="hidden rounded-lg p-1 text-muted-foreground hover:bg-muted lg:block">{collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}</button></div>
      {!collapsed && <div className="px-4 pb-3"><label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Show menu for<select aria-label="Menu for role" value={role} onChange={e => setRole(e.target.value)} className="mt-1 h-9 w-full rounded-xl border border-input bg-card px-2 text-sm font-normal normal-case tracking-normal text-foreground">{ROLES.map(r => <option key={r}>{r}</option>)}</select></label>{role !== "Everyone" && !expert && <p className="mt-1.5 text-xs text-muted-foreground">Showing {flat.filter(f => showInMenu(f.k, role, false)).length} of {flat.length} pages. <button className="font-medium text-primary underline underline-offset-2" onClick={() => setExpert(true)}>Show all (Expert)</button></p>}</div>}
      <nav className="space-y-5 px-3 pb-8">{nav.map(g => ({ ...g, items: g.items.filter(([k]) => showInMenu(k, role, expert) || active === k) })).filter(g => g.items.length).map(g => <div key={g.group || "home"}>{g.group && !collapsed && <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{g.group}</p>}<div className="space-y-0.5">{g.items.map(([k, l, I]) => <Link key={k} href={`/${k}`} title={l} onClick={() => setMob(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition", collapsed && "justify-center px-0", active === k ? "bg-card font-semibold text-primary shadow-sm ring-1 ring-border" : "text-foreground/75 hover:bg-card/70 hover:text-foreground")}><I size={18} className={active === k ? "text-primary" : "text-muted-foreground"} />{!collapsed && l}</Link>)}</div></div>)}</nav>
    </aside>
    {mob && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setMob(false)} />}
    <div className={cn("min-w-0 flex-1 print-ml0", collapsed ? "lg:ml-[72px]" : "lg:ml-64")}>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b border-border/70 bg-background/80 px-4 backdrop-blur-md lg:px-8">
        <button aria-label="Open menu" className="rounded p-1.5 hover:bg-muted lg:hidden" onClick={() => setMob(true)}><Menu size={20} /></button>
        <button onClick={() => setPalette(true)} aria-label="Search pages, shipments, orders and pallets" className="flex min-w-0 flex-1 max-w-lg items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm text-muted-foreground shadow-sm hover:border-primary/40"><Search size={16} className="shrink-0" /><span className="flex-1 truncate text-left"><span className="sm:hidden">Search…</span><span className="hidden sm:inline">Search pages, shipments, orders, pallets…</span></span><kbd className="hidden rounded border border-border bg-muted px-1.5 text-[10px] text-muted-foreground sm:inline">Ctrl K</kbd></button>
        <div className="flex shrink-0 items-center gap-0.5 text-sm sm:gap-1.5">
          <label className="mr-1 hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs md:flex" title="Simple mode hides advanced columns and settings. Nothing is removed."><span className={cn(!expert && "font-semibold text-primary")}>Simple</span><Switch aria-label="Expert mode" checked={expert} onCheckedChange={setExpert} /><span className={cn(expert && "font-semibold text-primary")}>Expert</span></label>
          <button onClick={() => setAi(true)} title="Ask where a shipment is, or pull the fields out of an invoice (demo)" className="hidden items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground sm:flex"><Sparkles size={14} />Ask Ternary</button>
          <button aria-label="Toggle dark mode" onClick={() => setDark(!dark)} className="rounded-full p-2 text-muted-foreground hover:bg-muted">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button aria-label="Notifications" onClick={() => setNp(!np)} className="relative rounded-full p-2 text-muted-foreground hover:bg-muted"><Bell size={18} />{unread > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] text-white">{unread}</span>}</button>
          <Link href="/settings" aria-label="Account and settings" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-primary">NP</Link>
        </div>
        {np && <div className="absolute right-2 top-16 w-[min(24rem,calc(100vw-1rem))] rounded-2xl border border-border bg-popover shadow-xl"><div className="flex items-center justify-between border-b border-border px-4 py-3"><p className="font-semibold">Notifications</p><button className="text-xs text-primary" onClick={markRead}>Mark all read</button></div><ul className="max-h-96 divide-y divide-border overflow-y-auto">{notifs.map(n => <li key={n.id}><Link href={n.href ?? "/dashboard"} onClick={() => setNp(false)} className="flex gap-3 px-4 py-3 text-sm hover:bg-muted"><span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-border" : "bg-primary")} /><span className="flex-1">{n.text}</span><span className="text-xs text-muted-foreground">{n.at}</span></Link></li>)}</ul></div>}
      </header>
      <main className="mx-auto max-w-[1360px] px-4 py-6 lg:px-10 lg:py-8">
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1 text-xs text-muted-foreground no-print"><Link href="/start" className="hover:text-foreground">Home</Link>{group && group !== "Home" && <><ChevronRight size={12} /><span>{group}</span></>}{(crumbs ?? [[T]]).map(([l, h], i) => <span key={i} className="flex items-center gap-1"><ChevronRight size={12} />{h ? <Link href={h} className="hover:text-foreground">{l}</Link> : <span className="text-foreground">{l}</span>}</span>)}</nav>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div className="max-w-3xl"><h1 className="flex flex-wrap items-center gap-3 font-display text-[28px] font-semibold leading-tight tracking-tight text-foreground">{T}{plain?.also && <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-normal text-muted-foreground">also called <Jargon text={plain.also} /></span>}</h1>{plain && <p className="mt-1 text-[15px] text-muted-foreground">{plain.d}</p>}{sub && <p className={cn("text-sm text-muted-foreground", plain && "mt-0.5 text-xs")}><Jargon text={sub} /></p>}</div><div className="flex flex-wrap gap-2 no-print">{actions}</div></div>
        {plain && <GuideBanner k={gk} />}
        {children}</main>
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
    const actions = [{ label: "Start here: what do you want to do?", sub: "Action", href: "/start" }, { label: "Open glossary", sub: "Help", href: "/glossary" }, { label: "New shipment", sub: "Action", href: "/shipments/new" }, { label: "New sales order", sub: "Action", href: "/manufacturing/orders?new=1" }, { label: "Open 3D load planner", sub: "Action", href: "/manufacturing/load-plan" }, { label: "Onboard a new tenant", sub: "Action", href: "/onboarding" }];
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
