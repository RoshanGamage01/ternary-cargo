"use client";
import { useLang } from "@/lib/i18n";
import Link from "next/link";
import { useState } from "react";
import { Calculator, Ship, Factory, Container, PackageOpen, Truck, Receipt, Search, ArrowRight, AlertTriangle, Plus, Trash2, Sparkles, ClipboardCheck, MapPin } from "lucide-react";
import { Shell } from "../shell";
import { Card, Button, Badge } from "../ui";
import { useStore, type CustomField } from "@/lib/store";
import { entities, toneOf } from "@/lib/entities";
import { GLOSSARY } from "@/lib/glossary";
import { predictEta, fmtDate } from "@/lib/eta";
import { Journey, SHIP_STEPS, ORDER_STEPS, shipStage, orderStage, shipNext, orderNext, Term } from "../v3";
import { cn } from "@/lib/utils";

const TASKS = [
  { k: "price", icon: Calculator, t: "Get a price", d: "Compare carriers and the full cost to the door", href: "/quotations", who: "Exporter · Forwarder", c: "from-teal-500/15" },
  { k: "ship", icon: Ship, t: "Send a shipment", d: "Four short steps: how, where, what, check", href: "/shipments/new", who: "Forwarder", c: "from-indigo-500/15" },
  { k: "order", icon: Factory, t: "Prepare an export order", d: "Label cartons, build pallets, make the packing list", href: "/manufacturing/orders", who: "Manufacturer", c: "from-amber-500/15" },
  { k: "plan", icon: Container, t: "Plan a container", d: "See in 3D how your pallets fit, and if it is safe", href: "/manufacturing/load-plan", who: "Manufacturer", c: "from-orange-500/15" },
  { k: "track", icon: MapPin, t: "Find out where my cargo is", d: "Live position and an honest arrival estimate", href: "/tracking", who: "Everyone", c: "from-sky-500/15" },
  { k: "receive", icon: PackageOpen, t: "Receive a container", d: "Unload, count and check against the paperwork", href: "/unloading", who: "Warehouse", c: "from-emerald-500/15" },
  { k: "release", icon: Truck, t: "Hand over cargo", d: "Release when customs, checks and payment are done", href: "/release", who: "Warehouse", c: "from-lime-500/15" },
  { k: "bill", icon: Receipt, t: "Bill a customer", d: "Invoice the job and see who has paid", href: "/billing", who: "Finance", c: "from-rose-500/15" },
];
export function Start() {
  const { db, update, toast } = useStore(); const [q, setQ] = useState(""); const { t, lang } = useLang();
  const moving = db.shipments.filter(s => s.status !== "Delivered").slice(0, 4);
  const orders = db.salesOrders.filter(o => !["Shipped", "Cancelled"].includes(o.status)).slice(0, 3);
  const today = [
    ...db.shipments.filter(s => s.status === "Customs hold").map(s => ({ t: `Customs has a question about ${s.ref}`, d: "The cargo cannot move until it is answered.", href: "/customs", tone: "red" })),
    ...db.shipments.map(s => ({ s, e: predictEta(s) })).filter(x => x.e.risk === "High" && x.s.status !== "Delivered").map(({ s, e }) => ({ t: `${s.ref} will probably arrive ${e.delay} days late`, d: `${e.factors[0]?.name ?? "Carrier delay"}. Tell the receiver early.`, href: `/shipments/${s.ref}?tab=Tracking%20%26%20ETA`, tone: "amber" })),
    ...db.invoices.filter(i => i.status === "Overdue").map(i => ({ t: `${i.customer} has not paid ${i.ref}`, d: "Send a reminder or call them.", href: "/billing", tone: "amber" })),
    { t: "Package PKG-007 arrived damaged (TC-SEA-24121)", d: "Sign off needs a reason and a second person.", href: "/verification", tone: "red" },
  ].slice(0, 5);
  const hits = q.trim() ? TASKS.filter(t => (t.t + t.d + t.who).toLowerCase().includes(q.toLowerCase())) : TASKS;
  return <Shell active="start" title="Start here">
    <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-accent via-card to-card p-8 lg:p-10">
      <p className="text-sm font-medium text-primary">Good afternoon, Nimal</p>
      <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight lg:text-4xl">{t("What do you want to do?")}</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">{t("Pick a task. Each one walks you through the steps and tells you what comes next.")} {lang === "en" && "Not sure? Type it in your own words."}</p>
      <div className="mt-5 flex max-w-xl items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm"><Search size={18} className="text-muted-foreground" /><input aria-label="Describe what you want to do" value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. ship tiles to Germany, find my container, pay…" className="w-full bg-transparent outline-none" /></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{hits.map(({ k, icon: I, t, d, href, who, c }) => <Link key={k} href={href} className={cn("group flex flex-col rounded-2xl border border-border bg-gradient-to-br to-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg", c)}>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-card text-primary shadow-sm"><I size={22} /></span><span className="mt-4 font-semibold">{t}</span><span className="mt-1 flex-1 text-sm text-muted-foreground">{d}</span><span className="mt-4 flex items-center justify-between text-xs text-muted-foreground">{who}<ArrowRight size={16} className="text-primary transition group-hover:translate-x-1" /></span></Link>)}
        {hits.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">Nothing matches “{q}”. Try “price”, “ship”, “container”, “receive” or ask the assistant (<Sparkles size={13} className="inline" /> Ask Ternary).</div>}</div>
    </section>
    <div className="mt-8 grid gap-6 lg:grid-cols-5">
      <section className="lg:col-span-2"><h3 className="mb-3 font-display text-lg font-semibold">Needs you today</h3><Card className="divide-y divide-border">{today.map(x => <Link key={x.t} href={x.href} className="flex items-start gap-3 p-4 hover:bg-muted/40"><span className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full", x.tone === "red" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning")}><AlertTriangle size={16} /></span><span className="flex-1"><span className="block text-sm font-medium">{x.t}</span><span className="text-xs text-muted-foreground">{x.d}</span></span><ArrowRight size={16} className="mt-1 text-muted-foreground" /></Link>)}</Card></section>
      <section className="lg:col-span-3"><div className="mb-3 flex items-center justify-between"><h3 className="font-display text-lg font-semibold">On the move</h3><Link href="/shipments" className="text-sm text-primary">All shipments →</Link></div><div className="space-y-3">{moving.map(s => { const a = shipNext(s); return <Card key={s.id} className="p-5"><div className="flex flex-wrap items-center justify-between gap-2"><Link href={`/shipments/${s.ref}`} className="font-mono font-semibold text-primary">{s.ref}</Link><span className="text-sm text-muted-foreground">{s.pol.split(" ").slice(1).join(" ")} → {s.pod.split(" ").slice(1).join(" ")} · <Term t="ETA" /> {fmtDate(predictEta(s).predicted)}</span></div><Journey className="mt-4" steps={SHIP_STEPS} at={shipStage(s)} blocked={s.status === "Customs hold"} /><div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-muted/50 px-4 py-2.5 text-sm"><span><span className="text-muted-foreground">Next: </span><b>{a.title}</b></span>{a.href ? <Link href={a.href} className="font-medium text-primary">{a.label} →</Link> : <button className="font-medium text-primary" onClick={() => { update("shipments", s.id, { status: "Delivered" }); toast(`${s.ref} marked delivered`); }}>{a.label} →</button>}</div></Card>; })}</div>
        <h3 className="mb-3 mt-8 font-display text-lg font-semibold">Export orders in progress</h3><div className="grid gap-3 md:grid-cols-3">{orders.map(o => <Link key={o.id} href={`/manufacturing/orders/${o.ref}`} className="rounded-2xl border border-border bg-card p-4 hover:border-primary/40"><p className="font-mono text-sm font-semibold text-primary">{o.ref}</p><p className="text-xs text-muted-foreground">{o.buyer} · {o.cartons} cartons</p><Journey compact className="mt-3" steps={ORDER_STEPS} at={orderStage(o)} /><p className="mt-2 text-xs">Next: <b>{orderNext(o).title}</b></p></Link>)}</div></section>
    </div>
  </Shell>;
}
export function Glossary() {
  const [q, setQ] = useState(""); const list = Object.entries(GLOSSARY).filter(([k, v]) => (k + v).toLowerCase().includes(q.toLowerCase())).sort(([a], [b]) => a.localeCompare(b));
  return <Shell active="glossary" title="Glossary"><div className="mb-5 flex max-w-md items-center gap-2 rounded-xl border border-input bg-card px-3 py-2"><Search size={16} className="text-muted-foreground" /><input aria-label="Search glossary" value={q} onChange={e => setQ(e.target.value)} placeholder="Search a word, e.g. demurrage" className="w-full bg-transparent text-sm outline-none" /></div>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{list.map(([k, v]) => <Card key={k} className="p-5"><p className="font-display font-semibold">{k}</p><p className="mt-1 text-sm text-muted-foreground">{v}</p></Card>)}</div>{list.length === 0 && <p className="text-sm text-muted-foreground">No word matches “{q}”.</p>}</Shell>;
}
const TYPES: CustomField["type"][] = ["text", "number", "date", "select", "yes/no"];
export function CustomFieldsEditor() {
  const { customFields, setCustomFields, toast } = useStore(); const [ent, setEnt] = useState("shipments"); const [f, setF] = useState<{ label: string; type: CustomField["type"]; options: string }>({ label: "", type: "text", options: "" }); const [err, setErr] = useState("");
  const list = customFields[ent] ?? [];
  const addF = () => { if (f.label.trim().length < 2) return setErr("Give the field a name (2+ letters)"); if (list.length >= 20) return setErr("Up to 20 custom fields per record type"); if (f.type === "select" && !f.options.includes(",")) return setErr("List at least two choices, separated by commas"); const k = "cf_" + f.label.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 30); if (list.some(x => x.k === k)) return setErr("A field with this name already exists"); setCustomFields(ent, [...list, { k, label: f.label.trim(), type: f.type, options: f.options }]); toast(`Field “${f.label}” added to ${entities[ent].title.toLowerCase()}`); setF({ label: "", type: "text", options: "" }); setErr(""); };
  return <div className="grid gap-6 p-6 lg:grid-cols-5"><div className="lg:col-span-2 space-y-4"><p className="text-sm text-muted-foreground">Add your own boxes of information to any record, with no IT help. They appear under “More details” in every form and in the record panel. Don’t store passwords or card numbers here.</p>
    <label className="block text-sm"><span className="mb-1.5 block text-[13px] font-medium">Record type</span><select aria-label="Record type" value={ent} onChange={e => setEnt(e.target.value)} className="h-10 w-full rounded-xl border border-input bg-card px-3">{Object.values(entities).map(d => <option key={d.key} value={d.key}>{d.title}</option>)}</select></label>
    <label className="block text-sm"><span className="mb-1.5 block text-[13px] font-medium">Field name</span><input aria-label="Field name" value={f.label} onChange={e => setF({ ...f, label: e.target.value })} placeholder="e.g. Buyer PO number" className="h-10 w-full rounded-xl border border-input bg-card px-3" /></label>
    <div className="text-sm"><span className="mb-1.5 block text-[13px] font-medium">Type</span><div className="flex flex-wrap gap-1.5">{TYPES.map(t => <button key={t} onClick={() => setF({ ...f, type: t })} className={cn("rounded-full px-3 py-1.5 text-xs ring-1 ring-inset", f.type === t ? "bg-primary text-primary-foreground ring-primary" : "ring-border hover:bg-muted")}>{t}</button>)}</div></div>
    {f.type === "select" && <label className="block text-sm"><span className="mb-1.5 block text-[13px] font-medium">Choices (comma separated)</span><input aria-label="Field choices" value={f.options} onChange={e => setF({ ...f, options: e.target.value })} placeholder="Gold, Silver, Bronze" className="h-10 w-full rounded-xl border border-input bg-card px-3" /></label>}
    {err && <p className="text-sm text-danger" role="alert">{err}</p>}<Button onClick={addF}><Plus size={15} />Add field</Button></div>
    <div className="lg:col-span-3"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{entities[ent].title}: {list.length} custom field{list.length === 1 ? "" : "s"}</p>{list.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No custom fields yet for {entities[ent].title.toLowerCase()}.</div> : <ul className="divide-y divide-border rounded-2xl border border-border">{list.map(c => <li key={c.k} className="flex items-center justify-between px-4 py-3 text-sm"><span><b>{c.label}</b> <Badge tone="slate">{c.type}</Badge>{c.options && <span className="ml-2 text-xs text-muted-foreground">{c.options}</span>}</span><button aria-label={`Remove field ${c.label}`} onClick={() => { setCustomFields(ent, list.filter(x => x.k !== c.k)); toast(`Field “${c.label}” removed`); }} className="rounded-lg p-1.5 text-danger hover:bg-danger/10"><Trash2 size={15} /></button></li>)}</ul>}</div></div>;
}
export { toneOf, ClipboardCheck };
