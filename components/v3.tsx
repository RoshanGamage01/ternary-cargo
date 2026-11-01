"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Check, AlertTriangle, ArrowRight, Lightbulb, X, HelpCircle, PlayCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { GLOSSARY } from "@/lib/glossary";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Row } from "@/lib/seed";

/* ---------- Jargon explained on hover / focus ---------- */
export function Term({ t, children }: { t: string; children?: React.ReactNode }) {
  const d = GLOSSARY[t]; if (!d) return <>{children ?? t}</>;
  return <Tooltip><TooltipTrigger asChild><span tabIndex={0} className="cursor-help underline decoration-dotted decoration-muted-foreground/60 underline-offset-[3px] outline-none focus-visible:ring-2 focus-visible:ring-ring">{children ?? t}</span></TooltipTrigger><TooltipContent className="max-w-xs text-[13px] leading-snug"><b>{t}</b>: {d} <Link href="/glossary" className="text-primary-foreground/80 underline">Glossary</Link></TooltipContent></Tooltip>;
}
const KEYS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
const RE = new RegExp(`\\b(${KEYS.map(k => k.replace(/[.*+?^${}()|[\]\\&/]/g, "\\$&")).join("|")})\\b`, "g");
/** Wraps every known trade term in a string with a hover explanation (first occurrence of each). */
export function Jargon({ text }: { text?: string }) {
  if (!text) return null; const seen = new Set<string>(); const out: React.ReactNode[] = []; let last = 0;
  text.replace(RE, (m, _g, i: number) => { if (seen.has(m)) return m; seen.add(m); out.push(text.slice(last, i)); out.push(<Term key={i} t={m} />); last = i + m.length; return m; });
  out.push(text.slice(last)); return <>{out}</>;
}

/* ---------- Journey steppers ---------- */
type Step = { label: string; hint: string };
export const SHIP_STEPS: Step[] = [{ label: "Booked", hint: "Space is reserved with the carrier" }, { label: "Departed", hint: "Left the origin port or airport" }, { label: "On the way", hint: "At sea, in the air or on the road" }, { label: "Arrived", hint: "Reached the destination port" }, { label: "Customs", hint: "Customs checks the paperwork" }, { label: "Checked", hint: "Cargo counted and checked at the warehouse" }, { label: "Released", hint: "Delivery order issued; cargo can be collected" }, { label: "Delivered", hint: "The receiver has the goods" }];
const SHIP_IDX: Record<string, number> = { Booked: 0, Sailed: 1, "In transit": 2, Arrived: 3, "Customs hold": 4, Verified: 5, Released: 6, Delivered: 7 };
export const ORDER_STEPS: Step[] = [{ label: "Order in", hint: "Buyer's order received" }, { label: "Production", hint: "Being made in the factory" }, { label: "Labelled", hint: "Each carton has a barcode" }, { label: "On pallets", hint: "Cartons stacked and labelled on pallets" }, { label: "Packed", hint: "Packing list issued" }, { label: "Loaded", hint: "Pallets in the container, seal on" }, { label: "Shipped", hint: "Handed to the carrier" }];
const ORDER_IDX: Record<string, number> = { Draft: 0, "Released to production": 1, Serialised: 2, Palletised: 3, Packed: 4, Loaded: 5, Shipped: 6 };
export const shipStage = (s: Row) => SHIP_IDX[s.status] ?? 0;
export const orderStage = (o: Row) => ORDER_IDX[o.status] ?? 0;
export function Journey({ steps, at, blocked, compact, className }: { steps: Step[]; at: number; blocked?: boolean; compact?: boolean; className?: string }) {
  return <ol aria-label={`Progress: step ${at + 1} of ${steps.length}, ${steps[at]?.label}${blocked ? " (blocked)" : ""}`} className={cn("flex w-full items-start", className)}>
    {steps.map((s, i) => { const done = i < at, cur = i === at; return <li key={s.label} className="relative flex min-w-0 flex-1 flex-col items-center text-center">
      {i > 0 && <span aria-hidden className={cn("absolute right-1/2 top-[11px] h-0.5 w-full", i <= at ? "bg-primary" : "bg-border")} style={compact ? { top: 7 } : undefined} />}
      <Tooltip><TooltipTrigger asChild><span className={cn("relative z-10 grid place-items-center rounded-full ring-4 ring-card transition", compact ? "h-4 w-4" : "h-6 w-6", done && "bg-primary text-primary-foreground", cur && !blocked && "bg-primary text-primary-foreground shadow-[0_0_0_4px_hsl(var(--primary)/0.2)]", cur && blocked && "bg-danger text-white shadow-[0_0_0_4px_hsl(var(--danger)/0.2)]", !done && !cur && "border-2 border-border bg-card")}>{done ? <Check size={compact ? 10 : 14} strokeWidth={3} /> : cur && blocked ? <AlertTriangle size={compact ? 9 : 13} /> : cur ? <span className={cn("rounded-full bg-primary-foreground", compact ? "h-1.5 w-1.5" : "h-2 w-2")} /> : null}</span></TooltipTrigger><TooltipContent>{s.hint}</TooltipContent></Tooltip>
      {!compact && <span className={cn("mt-2 break-words px-0.5 text-[10px] leading-tight sm:text-xs", cur ? (blocked ? "font-semibold text-danger" : "font-semibold text-foreground") : done ? "text-foreground/80" : "text-muted-foreground")}>{s.label}</span>}
    </li>; })}
  </ol>;
}
/* ---------- Guided next-best-action ---------- */
export type NBA = { title: string; why: string; href?: string; label: string; run?: () => void; tone?: "primary" | "danger" | "done" };
export function shipNext(s: Row): NBA {
  switch (s.status) {
    case "Booked": return { title: "Get the shipping papers ready", why: "Customs and the carrier need the documents before departure.", href: `/shipments/${s.ref}?tab=Documents`, label: "Check documents" };
    case "Sailed": case "In transit": return { title: "Watch the arrival date", why: "We predict the arrival and warn you if it slips.", href: `/shipments/${s.ref}?tab=Tracking%20%26%20ETA`, label: "See arrival estimate" };
    case "Arrived": return { title: "Unload and count the cargo", why: "Count every package against the list before anything leaves the warehouse.", href: `/unloading?s=${s.ref}`, label: "Start unloading" };
    case "Customs hold": return { title: "Customs has a question", why: "The cargo cannot move until the query is answered.", href: "/customs", label: "Answer customs", tone: "danger" };
    case "Verified": return { title: "Hand over the cargo", why: "Checks are signed off. Issue the delivery order once payment is in.", href: "/release", label: "Release cargo" };
    case "Released": return { title: "Confirm delivery", why: "Close the job once the receiver has the goods.", label: "Mark delivered" };
    default: return { title: "All done", why: "This shipment is delivered. Invoice it if you have not yet.", href: "/billing", label: "Go to invoices", tone: "done" };
  }
}
export function orderNext(o: Row): NBA {
  const so = encodeURIComponent(o.ref);
  switch (o.status) {
    case "Draft": return { title: "Send the order to production", why: "The factory can start once the order is released.", label: "Release to production" };
    case "Released to production": return { title: "Label every carton", why: "Each carton gets a barcode so it can be traced to the buyer.", href: `/manufacturing/serialisation?so=${so}`, label: "Label cartons" };
    case "Serialised": return { title: "Build the pallets", why: "Stack labelled cartons onto pallets; each pallet gets its own label.", href: `/manufacturing/palletising?so=${so}`, label: "Build pallets" };
    case "Palletised": return { title: "Make the packing list", why: "The buyer and customs need a list of everything you are sending.", href: `/manufacturing/packing-lists?so=${so}`, label: "Make packing list" };
    case "Packed": return { title: "Plan and load the container", why: "Check the pallets fit and the weight is safe, then load.", href: `/manufacturing/load-plan?so=${so}`, label: "Plan container" };
    case "Loaded": return { title: "Hand over to the carrier", why: "Link the order to its shipment so the buyer can track it.", href: o.shipment ? `/shipments/${o.shipment}` : "/shipments/new", label: o.shipment ? "Open shipment" : "Create shipment" };
    default: return { title: "Shipped", why: "Follow it to the buyer from the shipment page.", href: o.shipment ? `/shipments/${o.shipment}` : "/shipments", label: "Track it", tone: "done" };
  }
}
export function NextAction({ a, onRun }: { a: NBA; onRun?: () => void }) {
  const btn = cn("inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition", a.tone === "danger" ? "bg-danger text-white hover:bg-danger/90" : a.tone === "done" ? "border border-border bg-card hover:bg-muted" : "bg-primary text-primary-foreground hover:bg-primary/90");
  return <div className={cn("flex flex-wrap items-center gap-4 rounded-2xl border p-4", a.tone === "danger" ? "border-danger/30 bg-danger/5" : "border-primary/20 bg-accent/60")}>
    <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", a.tone === "danger" ? "bg-danger/15 text-danger" : "bg-primary/15 text-primary")}><Lightbulb size={20} /></div>
    <div className="min-w-[200px] flex-1"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">What to do next</p><p className="font-semibold text-foreground">{a.title}</p><p className="text-sm text-muted-foreground">{a.why}</p></div>
    {a.href ? <Link href={a.href} className={btn}>{a.label}<ArrowRight size={16} /></Link> : <button onClick={onRun ?? a.run} className={btn}>{a.label}<ArrowRight size={16} /></button>}
  </div>;
}

/* ---------- Feature walkthroughs ---------- */
type Guide = { title: string; why: string; steps: string[]; terms?: string[] };
export const GUIDES: Record<string, Guide> = {
  start: { title: "Welcome to Ternary Cargo", why: "Everything from the factory floor to the receiver's door, in one place.", steps: ["Pick a task under “What do you want to do?”", "Follow the steps; each page tells you what comes next", "Hover any dotted word to see what it means"] },
  dashboard: { title: "Your overview", why: "Numbers and alerts for your role. Change the role or the cards with Customise.", steps: ["Pick your role at the top", "Click any card to open the list behind it", "Use Customise to show, hide or reorder cards"], terms: ["ETA", "P50", "P90"] },
  exceptions: { title: "Problems to fix", why: "Anything that needs a person lands here, most urgent first.", steps: ["Read the problem in plain words", "Use Fix to solve it in one click, or Open to see details", "Resolved items disappear from the list"] },
  "manufacturing/orders": { title: "Export orders", why: "Every buyer order starts here and moves through labelling, pallets and loading.", steps: ["Create an order (buyer, product, cartons, ship-by date)", "Open it to see its journey and the next step", "Use saved views to see only what is late or urgent"] },
  "manufacturing/serialisation": { title: "Label cartons", why: "Each carton gets a unique barcode, so you can prove what was shipped.", steps: ["Choose the order", "Click Generate labels", "Scan cartons to confirm the labels print and read"], terms: ["SGTIN", "GTIN", "SSCC"] },
  "manufacturing/palletising": { title: "Build pallets", why: "Cartons go onto pallets; each pallet gets its own label for scanning.", steps: ["Choose the order", "Auto-build all, or one pallet at a time", "Print the pallet labels"], terms: ["SSCC"] },
  "manufacturing/packing-lists": { title: "Packing list", why: "One list of everything you are sending, made from your pallets.", steps: ["Choose the order", "Check the totals", "Issue it; it is also sent to the buyer as an ASN"], terms: ["ASN", "Packing list"] },
  "manufacturing/load-plan": { title: "Plan the container", why: "See how your pallets fit before the truck comes, and if the weight is safe.", steps: ["Pick a container size", "Tick the orders to load", "Drag to turn the view; read the checks underneath"], terms: ["40HC", "Payload", "Centre of gravity", "Hazmat"] },
  "manufacturing/loading": { title: "Load the container", why: "Scan pallets as they go in, then record the seal number as proof.", steps: ["Scan each pallet", "Type the container and seal number", "Confirm loading"], terms: ["Seal"] },
  "manufacturing/receiving": { title: "Confirm arrival", why: "The buyer scans pallets on arrival so any shortage is caught.", steps: ["Scan each pallet", "Missing pallets are flagged", "Confirm receipt"] },
  quotations: { title: "Get a price", why: "Compare carriers side by side, including the full landed cost.", steps: ["Pick a lane and cargo", "Compare price, time and reliability", "Send the quote, then book it in one click"], terms: ["Landed cost", "Incoterm"] },
  bookings: { title: "Book space", why: "Reserve space with a carrier, then turn the booking into a shipment.", steps: ["Create or accept a booking", "Wait for the carrier to confirm", "Create shipment"] },
  shipments: { title: "Your shipments", why: "Every shipment shows where it is and what to do next.", steps: ["Use the cards or switch to a table", "Click a shipment to open its journey", "Save the filters you use often as a view"], terms: ["ETA", "BL", "AWB"] },
  "shipments/new": { title: "Send a shipment", why: "Four short steps. Only the starred fields are required.", steps: ["Choose how it travels and who is involved", "Pick the route; we estimate the arrival", "Describe the cargo, then review"], terms: ["Incoterm", "FCL", "LCL"] },
  consolidation: { title: "Share a container", why: "Put several small shipments in one container or air pallet to save cost.", steps: ["Tick the shipments to combine", "Watch the fill gauge", "Confirm the consolidation"], terms: ["Consolidation", "ULD", "HBL", "MBL"] },
  documents: { title: "Documents", why: "Shipping papers are made from your data, so they always match.", steps: ["Preview any document", "Print or send it", "Missing ones show on each shipment's checklist"], terms: ["Bill of lading", "AWB"] },
  customs: { title: "Customs", why: "Track declarations and manifests to Sri Lanka Customs.", steps: ["See what is due first", "Submit or answer queries", "Cleared items move the shipment on"], terms: ["CUSDEC", "ASYHUB", "Manifest", "CHA"] },
  tracking: { title: "Track & arrival time", why: "Where it is now, and our honest estimate of when it arrives.", steps: ["Pick a shipment", "Compare the carrier date with our estimate", "Read why it may be late"], terms: ["ETA", "P50", "P90"] },
  arrival: { title: "Tell the receiver", why: "Let the receiver know their cargo is arriving and the free days left.", steps: ["Check the notice", "Send it by email", "The free-time countdown starts"], terms: ["Free time", "Demurrage"] },
  unloading: { title: "Unload & count", why: "Count every package and weigh it. Anything out of tolerance is flagged.", steps: ["Tap each package as it comes out", "Type the weight and condition", "Problems go to Check & sign off"], terms: ["Tally", "Devanning", "CFS"] },
  verification: { title: "Check & sign off", why: "Compare what arrived with the paperwork. Open problems need a reason and a second person.", steps: ["Review each check", "Record damage with photos", "Sign off, or sign off with exception"] },
  scan: { title: "Phone scanner", why: "Scan barcodes with a phone. Works offline and syncs later.", steps: ["Scan or type a code", "Green = expected, red = not on the list", "Sync when back online"] },
  release: { title: "Hand over cargo", why: "Release only when customs, checks and payment are all done.", steps: ["Open a delivery order", "Check the three gates", "Release to the receiver or truck"], terms: ["DO"] },
  billing: { title: "Invoices", why: "Bill every job and see who has paid.", steps: ["Create an invoice from a shipment", "Send it", "Mark it paid when the money arrives"] },
  reports: { title: "Reports", why: "Ready-made reports for managers. Export any of them.", steps: ["Pick a report", "Read the chart", "Export to CSV"] },
  "master-data": { title: "Lists & contacts", why: "Customers, carriers, ports and products you reuse everywhere.", steps: ["Pick a list", "Add or edit records (double-click a cell to edit inline)", "Add your own fields in Settings → Custom fields"], terms: ["Custom field"] },
  settings: { title: "Settings", why: "Users, permissions, your own fields, plan and demo data.", steps: ["Invite users and set roles", "Add custom fields for any record type", "Reset the demo whenever you like"], terms: ["Custom field"] },
};
export function GuideBanner({ k }: { k: string }) {
  const { dismissed, dismiss, expert } = useStore(); const g = GUIDES[k]; const [open, setOpen] = useState(false);
  if (!g) return null;
  const hidden = dismissed.includes(k) || expert;
  return <>
    {!hidden && <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-gradient-to-r from-accent/70 to-card p-4 no-print" role="note" aria-label="How this works">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary"><PlayCircle size={20} /></div>
      <p className="shrink-0 text-sm font-semibold">How this page works</p>
      <ol className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">{g.steps.map((s, i) => <li key={s} className="flex max-w-[190px] items-start gap-2 text-xs text-muted-foreground"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-card text-[11px] font-semibold text-primary ring-1 ring-border">{i + 1}</span>{s}</li>)}</ol>
      <div className="flex gap-1"><button onClick={() => setOpen(true)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10">Show me how</button><button aria-label="Hide guide" onClick={() => dismiss(k)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><X size={16} /></button></div>
    </div>}
    {hidden && <button onClick={() => setOpen(true)} className="mb-4 inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground no-print"><HelpCircle size={14} />Need a hand? <span className="font-medium text-primary underline underline-offset-2">Show me how</span></button>}
    <Sheet open={open} onOpenChange={setOpen}><SheetContent className="w-full sm:max-w-md"><SheetHeader><SheetTitle>{g.title}</SheetTitle><SheetDescription>{g.why}</SheetDescription></SheetHeader>
      <ol className="mt-6 space-y-4">{g.steps.map((s, i) => <li key={s} className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{i + 1}</span><p className="pt-1 text-sm">{s}</p></li>)}</ol>
      {g.terms && <div className="mt-8"><p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Words used here</p><dl className="space-y-3">{g.terms.map(t => <div key={t} className="rounded-xl bg-muted/60 p-3"><dt className="text-sm font-semibold">{t}</dt><dd className="text-sm text-muted-foreground">{GLOSSARY[t]}</dd></div>)}</dl></div>}
      <Link href="/glossary" className="mt-6 inline-block text-sm text-primary">Open the full glossary →</Link>
    </SheetContent></Sheet>
  </>;
}
/* ---------- Teaching empty state ---------- */
export function TeachEmpty({ k, title, action }: { k: string; title?: string; action?: React.ReactNode }) {
  const g = GUIDES[k];
  return <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary"><PlayCircle size={26} /></div>
    <p className="text-lg font-semibold">{title ?? `Nothing here yet`}</p>{g && <p className="max-w-md text-sm text-muted-foreground">{g.why}</p>}
    {g && <ol className="mt-2 grid max-w-2xl gap-3 text-left sm:grid-cols-3">{g.steps.map((s, i) => <li key={s} className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground"><span className="mb-1 block text-sm font-semibold text-primary">Step {i + 1}</span>{s}</li>)}</ol>}
    {action}
  </div>;
}

/** Visually separates demo-only controls (fake scanner) from real actions. */
export function DemoBox({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-warning/60 bg-warning/5 p-2.5" role="group" aria-label="Demo only"><p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-warning">Demo only · stands in for a handheld scanner</p>{children}</div>;
}
