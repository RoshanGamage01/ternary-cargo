"use client";
import { Ship, Plane, Truck, Package, FilePen, CalendarCheck, Navigation, Anchor, ShieldAlert, ShieldCheck, PackageOpen, TriangleAlert, ClipboardCheck, FileCheck, CircleCheck, Lock, CircleSlash, Send, Clock, Layers, Barcode, PackageCheck } from "lucide-react";
import { Badge } from "../ui";
import { toneOf } from "@/lib/entities";
import { predictEta, fmtDate } from "@/lib/eta";
import type { Row } from "@/lib/seed";
import { cn } from "@/lib/cn";
export const modeIcon = (m: string, n = 14) => m?.startsWith("Sea") ? <Ship size={n} /> : m === "Air" ? <Plane size={n} /> : m === "Road" ? <Truck size={n} /> : <Package size={n} />;
export const ModeChip = ({ m }: { m: string }) => <span className="inline-flex items-center gap-1.5 whitespace-nowrap">{modeIcon(m)}{m}</span>;
const ICON: Record<string, typeof Ship> = { Draft: FilePen, Booked: CalendarCheck, Requested: Clock, Confirmed: CalendarCheck, Sailed: Ship, "In transit": Navigation, Arrived: Anchor, "Customs hold": ShieldAlert, Query: ShieldAlert, Due: Clock, Cleared: ShieldCheck, Submitted: Send, Discrepancy: TriangleAlert, Verified: ClipboardCheck, Released: FileCheck, Issued: FileCheck, Delivered: CircleCheck, Paid: CircleCheck, Sent: Send, Overdue: TriangleAlert, "Credit hold": Lock, Cancelled: CircleSlash, Expired: CircleSlash, Accepted: CircleCheck, Active: CircleCheck, Serialised: Barcode, Scanned: Barcode, Palletised: Layers, Packed: PackageCheck, Loaded: PackageCheck, Received: PackageOpen, Shipped: Ship, "Released to production": Clock, Pending: Clock, "Awaiting payment": Clock, Invited: Send };
export const SBadge = ({ s }: { s: string }) => { const I = ICON[s] ?? Clock; return <Badge tone={toneOf(s)}><I size={13} />{s}</Badge>; };
export const riskTone = (r: string) => r === "High" ? "red" : r === "Medium" ? "amber" : "green";
export function EtaCell({ s }: { s: Row }) {
  const p = predictEta(s);
  return <div className="whitespace-nowrap text-xs"><p><span className="text-muted-foreground">Carrier</span> {fmtDate(s.eta)}</p><p className={cn("font-medium tabular-nums", p.delay > 0.5 ? "text-warning" : "text-success")}><span className="font-normal text-muted-foreground">P50</span> {fmtDate(p.predicted)} <span className="font-normal text-muted-foreground">P90 {fmtDate(p.p90).slice(0, 6)}</span></p></div>;
}
export const RiskCell = ({ s }: { s: Row }) => { const p = predictEta(s); return <Badge tone={riskTone(p.risk)}>{p.risk}{p.delay ? ` +${p.delay}d` : ""}</Badge>; };
export const ProtoTag = () => <span title="A rough estimate for this prototype, not a real figure" aria-label="Estimate: a rough prototype figure, not real" className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground"><span aria-hidden>ⓘ</span>Estimate</span>;
export function EtaPanel({ s }: { s: Row }) {
  const p = predictEta(s);
  const total = p.factors.reduce((a, f) => a + Math.abs(f.impact), 0) || 1;
  return <div className="space-y-4">
    <div className="flex items-center justify-between"><p className="font-semibold">Predicted ETA</p><ProtoTag /></div>
    <div className="grid grid-cols-3 gap-3 text-sm"><div className="rounded-lg bg-muted p-3"><p className="text-xs text-muted-foreground">Carrier ETA</p><p className="font-semibold">{fmtDate(s.eta)}</p></div><div className="rounded-lg bg-accent p-3"><p className="text-xs text-primary">Predicted P50 · P90</p><p className="font-semibold text-primary">{fmtDate(p.predicted)}</p><p className="text-[11px] text-primary">P90 {fmtDate(p.p90)} (+{p.p90d} d)</p></div><div className="rounded-lg bg-muted p-3"><p className="text-xs text-muted-foreground">Confidence</p><p className="font-semibold">{p.confidence}%</p><Badge tone={riskTone(p.risk)}>{p.risk} risk</Badge></div></div>
    <div className="relative h-8 rounded-full bg-muted"><div className="absolute top-0 h-8 rounded-full bg-primary/20" style={{ left: `${45 - p.band * 8}%`, width: `${10 + p.band * 16}%` }} /><div className="absolute top-0 h-8 w-0.5 bg-muted0" style={{ left: "40%" }} title="Carrier ETA" /><div className="absolute top-0 h-8 w-1 rounded bg-primary" style={{ left: `${Math.min(90, 40 + p.delay * 8)}%` }} /><span className="absolute -bottom-5 text-[10px] text-muted-foreground" style={{ left: "36%" }}>carrier</span><span className="absolute -bottom-5 text-[10px] text-primary" style={{ left: `${Math.min(88, 38 + p.delay * 8)}%` }}>predicted</span></div>
    <div className="pt-3"><p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Delay-risk factors</p>{p.factors.map(f => <div key={f.name} className="mb-2"><div className="flex justify-between text-sm"><span>{f.name}</span><span className={f.impact > 0 ? "text-warning" : "text-success"}>{f.impact > 0 ? "+" : ""}{f.impact} d</span></div><div className="h-1.5 rounded bg-muted"><div className={cn("h-1.5 rounded", f.impact > 0 ? "bg-warning" : "bg-success")} style={{ width: `${(Math.abs(f.impact) / total) * 100}%` }} /></div><p className="text-[11px] text-muted-foreground">{f.note}</p></div>)}</div>
    <p className="text-[11px] text-muted-foreground">Heuristic: carrier ETA + weighted factor days (mock inputs). Not a trained model; live AIS/port data to be bound later.</p>
  </div>;
}
// GLEC-style estimate: t × km × intensity. Intensities and distances below are PLACEHOLDERS for the prototype.
const KM: Record<string, number> = { "SGSIN-LKCMB": 2900, "AEJEA-LKCMB": 3300, "LKCMB-NLRTM": 11800, "INMAA-LKCMB": 700, "LKCMB-AEJEA": 3300, "BKK-CMB": 2400, "CMB-JFK": 14000, "CMB-SYD": 9000, "Pannala-Kandy": 90 };
const INT: Record<string, number> = { Sea: 10, Air: 600, Road: 80, Courier: 600 };
export function co2(s: Row) {
  const a = s.pol?.split(" ")[0], b = s.pod?.split(" ")[0];
  const km = KM[`${a}-${b}`] ?? 3000; const t = (+s.weight || 500) / 1000;
  const k = s.mode?.startsWith("Sea") ? "Sea" : s.mode;
  return { km, t, intensity: INT[k] ?? 80, kg: Math.round(t * km * (INT[k] ?? 80) / 1000) };
}
export function ddClock(s: Row) {
  // Mock free time: 7 days from carrier ETA for sea imports to Colombo
  if (!s.mode?.startsWith("Sea") || !/LKCMB/.test(s.pod)) return null;
  const end = new Date(s.eta); end.setDate(end.getDate() + 7);
  const now = new Date("2026-10-31T12:00:00");
  const days = Math.ceil((end.getTime() - now.getTime()) / 864e5);
  return { end: end.toISOString().slice(0, 10), days, perDay: 45 };
}

// Equirectangular placement for the placeholder map (lon 40–160E, lat 45S–45N)
export const GEO: Record<string, [number, number]> = { LKCMB: [79.85, 6.93], CMB: [79.88, 7.18], SGSIN: [103.82, 1.26], AEJEA: [55.03, 25.01], INMAA: [80.3, 13.1], BKK: [100.75, 13.69], NLRTM: [4.4, 51.9], JFK: [-73.8, 40.6], SYD: [151.2, -33.9], Pannala: [80.02, 7.33], Kandy: [80.63, 7.29] };
export function RouteMap({ from, to }: { from: string; to: string }) {
  const a = GEO[from.split(" ")[0]], b = GEO[to.split(" ")[0]];
  const pts = [a, b].filter(Boolean) as [number, number][];
  const lons = pts.map(p => p[0]), lats = pts.map(p => p[1]);
  const pad = 12; const minX = Math.min(...lons, 60) - pad, maxX = Math.max(...lons, 105) + pad, minY = Math.min(...lats, -5) - pad, maxY = Math.max(...lats, 25) + pad;
  const W = 300, H = 200; const X = (lon: number) => ((lon - minX) / (maxX - minX)) * W; const Y = (lat: number) => ((maxY - lat) / (maxY - minY)) * H;
  const label = (k: string) => k.split(" ").slice(1).join(" ") || k;
  return <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={`Route ${from} to ${to}`}>
    <rect width={W} height={H} className="fill-muted" />
    {/* simplified land hints: India + Sri Lanka + Malay peninsula */}
    <path d={`M${X(68)} ${Y(24)} L${X(88)} ${Y(22)} L${X(80)} ${Y(9)} Z`} className="fill-border" />
    <ellipse cx={X(80.7)} cy={Y(7.8)} rx={3} ry={5} className="fill-border" />
    <path d={`M${X(98)} ${Y(16)} L${X(101)} ${Y(13)} L${X(104)} ${Y(1.3)} L${X(100.5)} ${Y(4)} Z`} className="fill-border" />
    <path d={`M${X(51)} ${Y(30)} L${X(60)} ${Y(24)} L${X(56)} ${Y(17)} L${X(43)} ${Y(13)} Z`} className="fill-border" />
    {a && b && <path d={`M${X(a[0])} ${Y(a[1])} Q${(X(a[0]) + X(b[0])) / 2} ${Math.min(Y(a[1]), Y(b[1])) - 30} ${X(b[0])} ${Y(b[1])}`} stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" strokeDasharray="6 4" />}
    {a && <><circle cx={X(a[0])} cy={Y(a[1])} r="5" fill="hsl(var(--mode-sea))" /><text x={X(a[0]) + 7} y={Y(a[1]) + 4} fontSize="10" className="fill-foreground">{label(from)}</text></>}
    {b && <><circle cx={X(b[0])} cy={Y(b[1])} r="6" fill="hsl(var(--highlight))" /><text x={X(b[0]) + 7} y={Y(b[1]) + 4} fontSize="10" className="fill-foreground">{label(to)}</text></>}
    <text x="6" y={H - 6} fontSize="8" className="fill-muted-foreground">Schematic, to scale by lat/long · basemap later (MapLibre)</text>
  </svg>;
}
