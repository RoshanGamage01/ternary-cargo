"use client";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useLang, LANGS } from "@/lib/i18n";
import { usePersist } from "@/lib/persist";
import { Command as Cmd } from "cmdk";
import * as D from "@radix-ui/react-dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Home as HomeIcon, LayoutDashboard, Database, Ship, Boxes, FileStack, ShieldCheck, MapPin, Bell, PackageOpen, ClipboardCheck, Truck, Receipt, BarChart3, Settings, Search, Calculator, Factory, Barcode, Layers, ListChecks, Container, PackageCheck, Moon, Sun, Menu, Sparkles, AlertOctagon, Smartphone, ChevronRight, CalendarCheck, Globe, Compass, BookOpen, PanelLeftClose, PanelLeftOpen, SlidersHorizontal, ChevronDown, FileCheck2, MessageCircle, BellRing, Camera, Wallet, Upload, History, BookMarked } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import { PLAIN } from "@/lib/glossary";
import { GuideBanner, Jargon } from "./v3";
export const nav = [
  { group: "", items: [["start", "Start here", Compass], ["dashboard", "Overview", LayoutDashboard], ["exceptions", "Problems to fix", AlertOctagon]] },
  { group: "Make & pack", items: [["manufacturing/orders", "Export orders", Factory], ["manufacturing/serialisation", "Label cartons", Barcode], ["manufacturing/palletising", "Build pallets", Layers], ["manufacturing/packing-lists", "Packing list", ListChecks], ["manufacturing/load-plan", "Plan the container", Container], ["manufacturing/loading", "Load the container", PackageCheck], ["manufacturing/receiving", "Confirm arrival", CalendarCheck]] },
  { group: "Ship", items: [["quotations", "Get a price", Calculator], ["bookings", "Book space", CalendarCheck], ["shipments", "Shipments", Ship], ["consolidation", "Share a container", Boxes], ["documents", "Documents", FileStack], ["customs", "Customs", ShieldCheck], ["customs/pack", "Customs pack", FileCheck2], ["tracking", "Track & arrival time", MapPin], ["arrival", "Tell the receiver", Bell], ["whatsapp", "WhatsApp updates", MessageCircle], ["alerts", "Alerts", BellRing]] },
  { group: "Receive", items: [["unloading", "Unload & count", PackageOpen], ["verification", "Check & sign off", ClipboardCheck], ["scan", "Phone scanner", Smartphone], ["release", "Hand over cargo", Truck], ["evidence", "Photos & claims", Camera]] },
  { group: "Money & setup", items: [["billing", "Invoices", Receipt], ["finance", "Job money", Wallet], ["reports", "Reports", BarChart3], ["master-data", "Lists & contacts", Database], ["import", "Import data", Upload], ["audit", "Audit log", History], ["settings", "Settings", Settings], ["glossary", "Glossary", BookOpen], ["help", "Help booklet", BookMarked], ["portal/TC-SEA-24121", "Customer portal", Globe]] },
] as const;
export const ROLES = ["Everyone", "Forwarder ops", "Exporter", "Warehouse", "Finance"] as const;
const ALWAYS = ["start", "dashboard", "exceptions", "settings", "glossary", "help", "master-data"];
export const ROLE_PAGES: Record<string, string[]> = {
  "Forwarder ops": ["customs/pack", "whatsapp", "alerts", "import", "evidence", "quotations", "bookings", "shipments", "consolidation", "documents", "customs", "tracking", "arrival", "release", "billing"],
  Exporter: ["manufacturing/orders", "manufacturing/serialisation", "manufacturing/palletising", "manufacturing/packing-lists", "manufacturing/load-plan", "manufacturing/loading", "manufacturing/receiving", "quotations", "bookings", "shipments", "documents", "tracking"],
  Warehouse: ["evidence", "manufacturing/receiving", "tracking", "arrival", "unloading", "verification", "scan", "release"],
  Finance: ["finance", "audit", "quotations", "shipments", "billing", "reports", "portal/TC-SEA-24121"],
};
export const showInMenu = (k: string, role: string, expert: boolean) => expert || role === "Everyone" || ALWAYS.includes(k) || (ROLE_PAGES[role] ?? []).includes(k);
const flat = nav.flatMap(g => g.items.map(([k, l]) => ({ k, l, g: g.group || "Home" })));
export function Shell({ active, title, subtitle, actions, children, crumbs }: { active: string; title: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode; crumbs?: [string, string?][] }) {
  const { palette, setPalette, dark, setDark, notifs, markRead, expert, setExpert, role, setRole } = useStore(); const { lang, setLang, t } = useLang();
  const lastFocus = useRef<HTMLElement | null>(null);
  useEffect(() => { const f = (e: FocusEvent) => { const t = e.target as HTMLElement; if (t && t !== document.body && !t.closest?.("[role=dialog]")) lastFocus.current = t; }; document.addEventListener("focusin", f); return () => document.removeEventListener("focusin", f); }, []);
  const wasOpen = useRef(false); useEffect(() => { if (palette) wasOpen.current = true; else if (wasOpen.current) { wasOpen.current = false; const el = lastFocus.current; setTimeout(() => { if (el && document.contains(el)) el.focus(); }, 0); } }, [palette]);
  const router = useRouter(); useEffect(() => { const h = () => setAi(true); window.addEventListener("tc-ask", h); return () => window.removeEventListener("tc-ask", h); }, []);
  const [mob, setMob] = useState(false); const [np, setNp] = useState(false); const [ai, setAi] = useState(false); const [collapsed, setCollapsed] = useState(false);
  useEffect(() => { const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette(true); } if (e.key === "Escape") { setPalette(false); setNp(false); }
      const tg = e.target as HTMLElement; if (tg && (tg.closest("input, textarea, select, [contenteditable=true]"))) return; if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "/") { e.preventDefault(); setPalette(true); } else if (e.key === "?") { window.dispatchEvent(new Event("tc-shortcuts")); } else if (e.key === "n" || e.key === "N") { if (!(window as unknown as { __g?: boolean }).__g) router.push("/shipments/new"); }
      const w = window as unknown as { __g?: boolean; __gt?: ReturnType<typeof setTimeout> }; if (w.__g) { w.__g = false; if (e.key === "s") router.push("/shipments"); if (e.key === "d") router.push("/dashboard"); } else if (e.key === "g") { w.__g = true; clearTimeout(w.__gt); w.__gt = setTimeout(() => { w.__g = false; }, 1200); } }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [setPalette]);
  const group = flat.find(f => f.k === active)?.g;
  const unread = notifs.filter(n => !n.read).length;
  const gk = title === "New shipment" ? "shipments/new" : active;
  const plain = /^(TC-|SO-|Good|Not |Shipment )/.test(title) ? null : PLAIN[gk];
  const T = t(plain?.t ?? title); const sub = subtitle;
  return <div className="flex min-h-screen bg-background">
    <aside className={cn("fixed inset-y-0 z-40 overflow-y-auto border-r border-border bg-sidebar text-sidebar-foreground transition-all lg:translate-x-0", collapsed ? "w-[72px]" : "w-64", mob ? "translate-x-0" : "-translate-x-full")}>
      <div className="flex items-center justify-between px-4 py-5"><Link href="/start" className="flex items-center gap-2.5"><img src="/brand/ternary-mark-colour.svg" alt="Ternary" className="h-9 w-9" />{!collapsed && <div><p className="font-display text-[15px] font-semibold text-foreground">Ternary <span className="font-normal text-primary">Cargo</span></p><p className="text-[11px] text-muted-foreground">Ceylon Freight Lines</p></div>}</Link>
        <button aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed(!collapsed)} className="hidden rounded-lg p-1 text-muted-foreground hover:bg-muted lg:block">{collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}</button></div>
      <nav className="space-y-5 px-3 pb-8">{nav.map(g => ({ ...g, items: g.items.filter(([k]) => showInMenu(k, role, expert) || active === k) })).filter(g => g.items.length).map(g => <div key={g.group || "home"}>{g.group && !collapsed && <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t(g.group)}</p>}<div className="space-y-0.5">{g.items.map(([k, l, I]) => <Link key={k} href={`/${k}`} title={l} aria-current={active === k ? "page" : undefined} onClick={() => setMob(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition", collapsed && "justify-center px-0", active === k ? "relative bg-primary/10 font-semibold text-primary before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-primary" : "text-foreground/75 hover:bg-primary/5 hover:text-foreground")}><I size={18} className={active === k ? "text-primary" : "text-muted-foreground"} />{!collapsed && t(l)}</Link>)}</div></div>)}</nav>
    </aside>
    {mob && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setMob(false)} />}
    <div className={cn("min-w-0 flex-1 print-ml0", collapsed ? "lg:ml-[72px]" : "lg:ml-64")}>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b border-border/70 bg-background/80 px-4 backdrop-blur-md lg:px-8">
        <button aria-label="Open menu" className="rounded p-1.5 hover:bg-muted lg:hidden" onClick={() => setMob(true)}><Menu size={20} /></button>
        <button onClick={() => setPalette(true)} aria-label="Search pages, shipments, orders and pallets" className="flex min-w-0 flex-1 max-w-lg items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm text-muted-foreground shadow-sm hover:border-primary/40"><Search size={16} className="shrink-0" /><span className="flex-1 truncate text-left"><span className="sm:hidden">Search…</span><span className="hidden sm:inline">Search pages, shipments, orders, pallets…</span></span><kbd className="hidden rounded border border-border bg-muted px-1.5 text-[10px] text-muted-foreground sm:inline">Ctrl K</kbd></button>
        <div className="flex shrink-0 items-center gap-0.5 text-sm sm:gap-1.5">
          
          <button onClick={() => setAi(true)} title="Ask Ternary is a helper you can type questions to, e.g. “Where is TC-SEA-24121?” or “Read this invoice”. Demo answers only." aria-describedby="ask-hint" className="hidden items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground sm:flex"><Sparkles size={14} />Ask Ternary</button><span id="ask-hint" className="sr-only">A question helper: ask where a shipment is or have it read an invoice. Demo answers only.</span>
          <Popover><PopoverTrigger asChild><button aria-label="How much to show" title="Choose Simple or Expert, and which job's pages to show" className="mr-1 flex h-9 items-center gap-2 rounded-xl border border-border bg-card px-2 text-xs font-medium hover:bg-muted md:px-3"><SlidersHorizontal size={14} className="text-primary" /><span className="hidden md:inline">{expert ? "Expert" : "Simple"}</span>{role !== "Everyone" && <span className="hidden rounded-md md:inline bg-accent px-1.5 py-0.5 text-[11px] text-primary">{role}</span>}{lang !== "en" && <span className="text-[11px]">{lang === "si" ? "සිං" : "த"}</span>}<ChevronDown size={14} className="hidden md:block" /></button></PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-4"><p className="text-sm font-semibold">How much to show</p><p className="mb-3 text-xs text-muted-foreground">One setting for the menu, table columns and help guides. Nothing is deleted.</p>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1" role="group" aria-label="Detail level">{([[false, "Simple", "Fewer columns, guides on"], [true, "Expert", "All columns, guides off"]] as const).map(([v, l, d]) => <button key={l} aria-pressed={expert === v} onClick={() => setExpert(v)} className={cn("rounded-lg px-2 py-1.5 text-left text-xs", expert === v ? "bg-card font-semibold text-primary shadow-sm" : "text-muted-foreground")}>{l}<span className="block text-[11px] font-normal">{d}</span></button>)}</div>
            <p className="mb-1.5 mt-4 text-xs font-semibold">Menu for my job</p><div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Menu for my job">{ROLES.map(r => <button key={r} aria-pressed={role === r} onClick={() => setRole(r)} className={cn("rounded-lg border px-2 py-1.5 text-xs", role === r ? "border-primary bg-accent font-semibold text-primary" : "border-border hover:bg-muted")}>{r === "Everyone" ? "All jobs" : r}</button>)}</div>
            <p className="mb-1.5 mt-4 text-xs font-semibold">Menu language (beta) · භාෂාව · மொழி</p><div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Menu language (beta)">{LANGS.map(([k, l]) => <button key={k} lang={k} aria-pressed={lang === k} onClick={() => setLang(k)} className={cn("rounded-lg border px-2 py-1.5 text-xs", lang === k ? "border-primary bg-accent font-semibold text-primary" : "border-border hover:bg-muted")}>{l}</button>)}</div><p className="mt-1.5 text-[11px] leading-4 text-muted-foreground" id="lang-note">Beta: translates the menu, page titles and the main buttons. Most page text is still in English.</p>
            <p className="mt-3 text-xs text-muted-foreground">{expert ? "Expert shows every page." : role === "Everyone" ? "Showing all pages." : `Showing ${flat.filter(f => showInMenu(f.k, role, false)).length} of ${flat.length} pages.`}</p></PopoverContent></Popover>
          <button aria-label="Toggle dark mode" onClick={() => setDark(!dark)} className="rounded-full p-2 text-muted-foreground hover:bg-muted">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"} onClick={() => setNp(!np)} className="relative rounded-full p-2 text-muted-foreground hover:bg-muted"><Bell size={18} />{unread > 0 && <span data-testid="notif-badge" className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-background">{unread}</span>}</button>
          <Link href="/settings" aria-label="Account and settings" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-primary">NP</Link>
        </div>
        {np && <div className="absolute right-2 top-16 w-[min(24rem,calc(100vw-1rem))] rounded-2xl border border-border bg-popover shadow-xl"><div className="flex items-center justify-between border-b border-border px-4 py-3"><p className="font-semibold">Notifications</p><button className="text-xs text-primary" onClick={markRead}>Mark all read</button></div><ul className="max-h-96 divide-y divide-border overflow-y-auto">{notifs.map(n => <li key={n.id}><Link href={n.href ?? "/dashboard"} onClick={() => setNp(false)} className="flex gap-3 px-4 py-3 text-sm hover:bg-muted"><span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-border" : "bg-primary")} /><span className="flex-1">{n.text}</span><span className="text-xs text-muted-foreground">{n.at}</span></Link></li>)}</ul></div>}
      </header>
      <main className="mx-auto max-w-[1360px] px-4 pb-24 pt-6 lg:px-10 lg:py-8">
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1 text-xs text-muted-foreground no-print"><Link href="/start" className="hover:text-foreground">Home</Link>{group && group !== "Home" && <><ChevronRight size={12} /><span>{group}</span></>}{(crumbs ?? [[active === "dashboard" ? t("Overview") : T]]).map(([l, h], i) => <span key={i} className="flex items-center gap-1"><ChevronRight size={12} />{h ? <Link href={h} className="hover:text-foreground">{l}</Link> : <span className="text-foreground">{l}</span>}</span>)}</nav>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div className="max-w-3xl"><h1 className="flex flex-wrap items-center gap-3 font-display text-[28px] font-semibold leading-tight tracking-tight text-foreground">{T}{plain?.also && <Popover><PopoverTrigger asChild><button aria-label="Other names for this page" className="grid h-6 w-6 place-items-center rounded-full border border-border text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">?</button></PopoverTrigger><PopoverContent align="start" className="w-72 text-sm"><p className="text-xs font-semibold uppercase text-muted-foreground">Also called</p><p className="mt-1"><Jargon text={plain.also} /></p></PopoverContent></Popover>}</h1>{plain && <p className="mt-1 text-[15px] text-muted-foreground">{plain.d}</p>}{sub && <p className={cn("text-sm text-muted-foreground", plain && "mt-0.5 text-xs")}><Jargon text={sub} /></p>}</div><div className="flex flex-wrap gap-2 no-print">{actions}</div></div>
        {plain && <GuideBanner k={gk} />}
        {children}</main>
    </div>
    <nav aria-label="Quick tabs" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur no-print lg:hidden">{([["start", "Home", HomeIcon], ["shipments", "Shipments", Ship], ["scan", "Scan", Barcode], ["tracking", "Track", MapPin]] as const).map(([k, l, I]) => <Link key={k} href={`/${k}`} aria-current={active === k ? "page" : undefined} className={cn("flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px]", active === k ? "font-semibold text-primary" : "text-muted-foreground")}><I size={20} />{t(l)}</Link>)}<button onClick={() => setMob(true)} aria-label="Open full menu" className="flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] text-muted-foreground"><Menu size={20} />{t("Menu")}</button></nav>
    {palette && <Palette onClose={() => setPalette(false)} />}<Shortcuts />
    {ai && <Assistant onClose={() => setAi(false)} />}
  </div>;
}
const KBD = ({ k }: { k: string }) => <kbd className="rounded border border-border bg-muted px-1.5 font-mono text-[11px] text-muted-foreground">{k}</kbd>;
function Palette({ onClose }: { onClose: () => void }) {
  const { db, setDark, dark, expert, setExpert, setPalette } = useStore(); const router = useRouter(); const [q, setQ] = useState(""); const { setLang } = useLang();
  const [recent, setRecent] = usePersist<{ label: string; href: string }[]>("recent", []);
  const go = (label: string, h: string) => { setRecent(r => [{ label, href: h }, ...r.filter(x => x.href !== h)].slice(0, 5)); onClose(); router.push(h); };
  const mac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  const actions: { label: string; k?: string; run: () => void }[] = [
    { label: "New shipment", k: "N", run: () => go("New shipment", "/shipments/new") },
    { label: "Import a spreadsheet", run: () => go("Import data", "/import") },
    { label: "Open the customs pack for TC-SEA-24121", run: () => go("Customs pack", "/customs/pack?ref=TC-SEA-24121") },
    { label: "Share a WhatsApp update", run: () => go("Share update", "/shipments/TC-SEA-24121") },
    { label: "Start here: what do you want to do?", run: () => go("Start here", "/start") },
    { label: dark ? "Switch to light mode" : "Switch to dark mode", run: () => { setDark(!dark); onClose(); } },
    { label: expert ? "Switch to Simple" : "Switch to Expert", run: () => { setExpert(!expert); onClose(); } },
    { label: "Menu language (beta): English", run: () => { setLang("en"); onClose(); } }, { label: "Menu language (beta): සිංහල (Sinhala)", run: () => { setLang("si"); onClose(); } }, { label: "Menu language (beta): தமிழ் (Tamil)", run: () => { setLang("ta"); onClose(); } },
    { label: "Show keyboard shortcuts", k: "?", run: () => { onClose(); setTimeout(() => window.dispatchEvent(new Event("tc-shortcuts")), 0); } },
  ];
  const recs = [...db.shipments.map(s => ({ label: s.ref, sub: `Shipment · ${s.doc} · ${s.consignee}`, href: `/shipments/${s.ref}` })), ...db.salesOrders.map(s => ({ label: s.ref, sub: `Export order · ${s.buyer}`, href: `/manufacturing/orders/${s.ref}` })), ...db.customers.map(c => ({ label: c.name, sub: `Customer · ${c.code}`, href: "/master-data?tab=customers" })), ...db.pallets.map(p => ({ label: p.sscc, sub: `Pallet barcode · ${p.so}`, href: "/manufacturing/palletising" })), ...db.invoices.map(v => ({ label: v.ref, sub: `Invoice · ${v.customer}`, href: "/billing" }))];
  const item = "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground";
  void setPalette;
  return <D.Root open onOpenChange={o => { if (!o) onClose(); }}><D.Portal><D.Overlay className="fixed inset-0 z-[70] bg-black/50 animate-in fade-in-0 duration-150" /><D.Content aria-describedby={undefined} onCloseAutoFocus={e => e.preventDefault()} className="fixed left-1/2 top-24 z-[71] w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200"><D.Title className="sr-only">Command menu</D.Title>
    <Cmd label="Command menu" loop>
      <div className="flex items-center gap-2 border-b border-border px-4"><Search size={16} className="text-muted-foreground" /><Cmd.Input autoFocus aria-label="Command palette search" value={q} onValueChange={setQ} placeholder="Type a command, a page, or a reference…" className="w-full bg-transparent py-3 text-sm outline-none" /><KBD k="Esc" /></div>
      <Cmd.List className="max-h-[22rem] overflow-y-auto p-1.5">
        <Cmd.Empty className="px-4 py-6 text-center text-sm text-muted-foreground">No match. <button className="text-primary underline" onClick={() => { onClose(); window.dispatchEvent(new CustomEvent("tc-ask", { detail: q })); }}>Ask Ternary “{q}”</button></Cmd.Empty>
        {!q && recent.length > 0 && <Cmd.Group heading="Recent" className="px-1 py-1 text-[11px] font-semibold uppercase text-muted-foreground [&_[cmdk-item]]:normal-case">{recent.map(r => <Cmd.Item key={"r" + r.href} value={"recent " + r.label + r.href} onSelect={() => go(r.label, r.href)} className={item}><span className="font-medium text-foreground">{r.label}</span><span className="text-xs">{r.href}</span></Cmd.Item>)}</Cmd.Group>}
        <Cmd.Group heading="Actions" className="px-1 py-1 text-[11px] font-semibold uppercase text-muted-foreground">{actions.map(a => <Cmd.Item key={a.label} value={a.label} onSelect={a.run} className={item + " normal-case"}><span className="font-medium text-foreground">{a.label}</span>{a.k && <KBD k={a.k} />}</Cmd.Item>)}</Cmd.Group>
        <Cmd.Group heading="Go to" className="px-1 py-1 text-[11px] font-semibold uppercase text-muted-foreground">{flat.map(f => <Cmd.Item key={f.k} value={`${f.l} ${f.g}`} onSelect={() => go(f.l, `/${f.k}`)} className={item + " normal-case"}><span className="font-medium text-foreground">{f.l}</span><span className="text-xs">{f.k === "shipments" ? <KBD k="G S" /> : f.k === "dashboard" ? <KBD k="G D" /> : f.g}</span></Cmd.Item>)}</Cmd.Group>
        {q && <Cmd.Group heading="Records" className="px-1 py-1 text-[11px] font-semibold uppercase text-muted-foreground">{recs.map((r, i) => <Cmd.Item key={r.label + i} value={`${r.label} ${r.sub}`} onSelect={() => go(r.label, r.href)} className={item + " normal-case"}><span className="font-mono text-[13px] font-medium text-foreground">{r.label}</span><span className="truncate text-xs">{r.sub}</span></Cmd.Item>)}</Cmd.Group>}
      </Cmd.List>
      <p className="flex flex-wrap gap-3 border-t border-border px-4 py-2 text-[11px] text-muted-foreground"><span><KBD k="↑↓" /> move</span><span><KBD k="Enter" /> open</span><span><KBD k={mac ? "⌘K" : "Ctrl K"} /> or <KBD k="/" /> open this</span><span><KBD k="?" /> all shortcuts</span></p>
    </Cmd>
  </D.Content></D.Portal></D.Root>;
}
function Shortcuts() {
  const [open, setOpen] = useState(false);
  useEffect(() => { const h = () => setOpen(true); window.addEventListener("tc-shortcuts", h); return () => window.removeEventListener("tc-shortcuts", h); }, []);
  if (!open) return null;
  const rows: [string, string][] = [["Ctrl K, ⌘K or /", "Open the command menu"], ["G then S", "Go to shipments"], ["G then D", "Go to the overview"], ["N", "New shipment"], ["?", "Show this list"], ["Esc", "Close menus and panels"]];
  return <div className="fixed inset-0 z-[75] grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" onClick={() => setOpen(false)}><div className="w-full max-w-sm rounded-xl bg-card p-5 shadow-xl" onClick={e => e.stopPropagation()}><p className="mb-3 font-semibold">Keyboard shortcuts</p><ul className="space-y-2 text-sm">{rows.map(([k, d]) => <li key={k} className="flex justify-between gap-4"><span>{d}</span><KBD k={k} /></li>)}</ul><button className="mt-4 w-full rounded-xl border border-border py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>Close</button></div></div>;
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
