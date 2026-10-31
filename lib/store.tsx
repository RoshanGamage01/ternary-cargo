"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { seed, DB, Row } from "./seed";
type Toast = { id: number; msg: string; tone: "ok" | "err" | "info" };
export type Ev = { id: number; ref: string; text: string; at: string; actor: string; source: string };
type Notif = { id: number; text: string; at: string; read: boolean; href?: string };
type Ctx = {
  db: DB; ready: boolean;
  add: (k: keyof DB, row: Omit<Row, "id">) => Row; update: (k: keyof DB, id: string, patch: Partial<Row>) => void; remove: (k: keyof DB, id: string) => void;
  setMany: (k: keyof DB, rows: Row[]) => void;
  reset: () => void; toast: (msg: string, tone?: Toast["tone"]) => void; toasts: Toast[];
  notifs: Notif[]; notify: (text: string, href?: string) => void; markRead: () => void;
  events: Ev[]; log: (ref: string, text: string, source?: string) => void;
  dark: boolean; setDark: (d: boolean) => void; palette: boolean; setPalette: (b: boolean) => void;
};
const C = createContext<Ctx>(null as unknown as Ctx);
const KEY = "ternary-cargo-v2";
const seedNotifs = (): Notif[] => [
  { id: 1, text: "TC-AIR-08812 on customs hold: HS 3004.90 permit query", at: "13:42", read: false, href: "/shipments/TC-AIR-08812" },
  { id: 2, text: "ASYHUB manifest for TC-SEA-24118 due in 18 h", at: "12:10", read: false, href: "/customs" },
  { id: 3, text: "TC-SEA-24121 arrived at Peliyagoda CFS", at: "11:45", read: false, href: "/unloading" },
  { id: 4, text: "TC-SEA-24126: predicted ETA 2 days later than carrier", at: "09:30", read: true, href: "/shipments/TC-SEA-24126" },
];
const seedEvents = (): Ev[] => [
  ["TC-SEA-24121", "Booking BK-2026-0611 confirmed by Maersk", "2026-10-22T04:42:00Z", "carrier"], ["TC-SEA-24121", "HBL CFL-HB-55120 issued under MBL MAEU240993310", "2026-10-26T05:10:00Z", "user"], ["TC-SEA-24121", "Loaded on MAERSK KENSINGTON 442W (DEP)", "2026-10-26T16:00:00Z", "carrier"], ["TC-SEA-24121", "ASYHUB manifest line lodged (mock)", "2026-10-27T02:30:00Z", "asyhub"], ["TC-SEA-24121", "Discharged at Colombo JCT (ARR)", "2026-10-31T00:50:00Z", "carrier"], ["TC-SEA-24121", "Gate-in Peliyagoda CFS, seal ML-4412098 intact", "2026-10-31T06:15:00Z", "user"],
].map(([ref, text, at, source], i) => ({ id: i + 1, ref, text, at, actor: source === "user" ? "Ruwan Silva" : source, source }));
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB>(seed);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [notifs, setNotifs] = useState<Notif[]>(seedNotifs);
  const [dark, setDarkS] = useState(false);
  const [events, setEvents] = useState<Ev[]>(seedEvents);
  const [palette, setPalette] = useState(false);
  useEffect(() => {
    try { const s = localStorage.getItem(KEY); if (s) { const p = JSON.parse(s); setDb({ ...seed(), ...p.db }); if (p.notifs) setNotifs(p.notifs); if (p.events) setEvents(p.events); setDarkS(!!p.dark); } } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify({ db, notifs, dark, events })); }, [db, notifs, dark, events, ready]);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);
  const toast = useCallback((msg: string, tone: Toast["tone"] = "ok") => { const id = Date.now() + Math.random(); setToasts(t => [...t, { id, msg, tone }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200); }, []);
  const notify = useCallback((text: string, href?: string) => setNotifs(n => [{ id: Date.now(), text, at: new Date().toTimeString().slice(0, 5), read: false, href }, ...n]), []);
  const log = useCallback((ref: string, text: string, source = "user") => setEvents(e => [{ id: Date.now() + Math.random(), ref, text, at: new Date().toISOString(), actor: "Nimal Perera", source }, ...e].slice(0, 500)), []);
  const add = (k: keyof DB, row: Omit<Row, "id">) => { const nr = { ...row, id: `${Date.now()}${Math.floor(Math.random() * 1000)}` } as Row; setDb(d => ({ ...d, [k]: [nr, ...d[k]] })); log(String(row.ref ?? row.code ?? row.shipment ?? row.name ?? k), `Created ${String(k)} ${String(row.ref ?? row.code ?? row.name ?? "")}`); return nr; };
  const update = (k: keyof DB, id: string, patch: Partial<Row>) => { const r = (db[k] as Row[]).find(x => x.id === id); if (r) log(r.ref ?? r.code ?? r.name ?? String(k), `${String(k)} ${r.ref ?? r.code ?? r.name ?? ""} updated: ${Object.entries(patch).map(([a, b]) => `${a}=${b}`).join(", ")}`); setDb(d => ({ ...d, [k]: d[k].map(r => r.id === id ? { ...r, ...patch } as Row : r) })); };
  const remove = (k: keyof DB, id: string) => setDb(d => ({ ...d, [k]: d[k].filter(r => r.id !== id) }));
  const setMany = (k: keyof DB, rows: Row[]) => setDb(d => ({ ...d, [k]: rows }));
  const reset = () => { localStorage.removeItem(KEY); setDb(seed()); setNotifs(seedNotifs()); setEvents(seedEvents()); toast("Demo data reset"); };
  return <C.Provider value={{ db, ready, add, update, remove, setMany, reset, toast, toasts, notifs, notify, events, log, markRead: () => setNotifs(n => n.map(x => ({ ...x, read: true }))), dark, setDark: setDarkS, palette, setPalette }}>{children}<div className="fixed bottom-4 right-4 z-[60] space-y-2" aria-live="polite">{toasts.map(t => <div key={t.id} role="status" className={t.tone === "err" ? "rounded-lg bg-danger px-4 py-2.5 text-sm text-white shadow-lg" : t.tone === "info" ? "rounded-lg bg-foreground px-4 py-2.5 text-sm text-background shadow-lg" : "rounded-lg bg-success px-4 py-2.5 text-sm text-white shadow-lg"}>{t.msg}</div>)}</div></C.Provider>;
}
export const useStore = () => useContext(C);
export function downloadCSV(name: string, rows: Record<string, string>[], cols: string[]) {
  const esc = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(","), ...rows.map(r => cols.map(c => esc(r[c])).join(","))].join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = `${name}.csv`; a.click();
}
