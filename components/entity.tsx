"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, flexRender, type ColumnDef, type SortingState, type RowSelectionState, type VisibilityState } from "@tanstack/react-table";
import { useStore, downloadCSV, type SavedView, type CustomField } from "@/lib/store";
import { entities, EntityDef, toneOf, FieldDef } from "@/lib/entities";
import { moreOf } from "@/lib/more";
import type { Row, DB } from "@/lib/seed";
import { Card, Button, Modal, Skeleton, Badge } from "./ui";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { Jargon, Journey, NextAction, SHIP_STEPS, ORDER_STEPS, shipStage, orderStage, shipNext, orderNext, TeachEmpty } from "./v3";
import { cn } from "@/lib/utils";
import { Plus, Download, Printer, Pencil, Trash2, ArrowUpDown, Search, SlidersHorizontal, LayoutGrid, Rows3, ChevronDown, ChevronUp, Bookmark, X, Tag, UserPlus, PanelRightOpen, Paperclip, StickyNote, ShieldAlert, Undo2 } from "lucide-react";

export function nextId(def: EntityDef, rows: Row[]) {
  if (!def.prefix) return "";
  const nums = rows.map(r => parseInt((r[def.idField] ?? "").replace(/\D/g, "").slice(-4)) || 0);
  return def.prefix + String(Math.max(0, ...nums) + 1).padStart(4, "0");
}
const optsOf = (f: FieldDef, db: DB) => typeof f.options === "function" ? f.options(db) : f.options ?? [];
const cfAsField = (c: CustomField): FieldDef => ({ k: c.k, label: c.label, type: c.type === "yes/no" ? "select" : c.type === "select" ? "select" : c.type, options: c.type === "yes/no" ? ["", "Yes", "No"] : c.type === "select" ? ["", ...(c.options ?? "").split(",").map(s => s.trim()).filter(Boolean)] : undefined });
export function validate(def: EntityDef, v: Record<string, string>, rows: Row[], editingId?: string, extraFields: FieldDef[] = []) {
  const e: Record<string, string> = {};
  for (const f of [...def.fields, ...extraFields]) {
    const val = (v[f.k] ?? "").trim();
    if (f.required && !val) e[f.k] = `${f.label} is required`;
    else if (val && f.pattern && !f.pattern.test(val)) e[f.k] = f.patternMsg ?? "Invalid format";
    else if (val && f.type === "number" && isNaN(+val)) e[f.k] = "Must be a number";
  }
  const idv = v[def.idField];
  if (idv && rows.some(r => r[def.idField] === idv && r.id !== editingId)) e[def.idField] = `${idv} already exists`;
  return e;
}
function FieldInput({ f, v, setV, err, db, first }: { f: FieldDef; v: Record<string, string>; setV: (v: Record<string, string>) => void; err?: string; db: DB; first?: boolean }) {
  const base = cn("h-10 w-full rounded-xl border bg-card px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10", err ? "border-danger/60" : "border-input");
  return <label className={cn("block", (f.k === "name" || f.k === "address" || f.k === "description") && "sm:col-span-2")}>
    <span className="mb-1.5 block text-[13px] font-medium text-foreground/80"><Jargon text={f.label} />{f.required && <span className="text-danger"> *</span>}</span>
    {f.type === "select" ? <select name={f.k} autoFocus={first} value={v[f.k] ?? ""} onChange={e => setV({ ...v, [f.k]: e.target.value })} className={base}>{optsOf(f, db).map(o => <option key={o} value={o}>{o || "—"}</option>)}</select>
      : <input name={f.k} autoFocus={first} type={f.type === "date" ? "date" : "text"} inputMode={f.type === "number" ? "decimal" : undefined} value={v[f.k] ?? ""} onChange={e => setV({ ...v, [f.k]: e.target.value })} className={base} />}
    {err ? <span className="mt-1 block text-xs text-danger" role="alert">{err}</span> : f.hint && <span className="mt-1 block text-xs text-muted-foreground">{f.hint}</span>}
  </label>;
}
/** Full edit form: essentials first, "More details" and custom fields on request. */
export function RecordFields({ def, v, setV, err, startOpen }: { def: EntityDef; v: Record<string, string>; setV: (v: Record<string, string>) => void; err: Record<string, string>; startOpen?: boolean }) {
  const { db, customFields } = useStore(); const more = moreOf(def.key); const cfs = (customFields[def.key] ?? []).map(cfAsField);
  const [open, setOpen] = useState(!!startOpen || [...more, ...cfs].some(f => err[f.k]));
  return <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2">{def.fields.map((f, i) => <FieldInput key={f.k} f={f} v={v} setV={setV} err={err[f.k]} db={db} first={i === 0} />)}</div>
    <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between rounded-xl border border-dashed border-border px-4 py-3 text-sm font-medium text-primary hover:bg-accent/50">
      <span>{open ? "Hide extra details" : `More details (optional) · ${more.length + cfs.length} fields`}</span>{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
    {open && <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2">{more.map(f => <FieldInput key={f.k} f={f} v={v} setV={setV} err={err[f.k]} db={db} />)}</div>
      <div><p className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your custom fields<Link href="/settings?tab=Custom%20fields" className="normal-case text-primary">Manage</Link></p>{cfs.length ? <div className="grid gap-4 sm:grid-cols-2">{cfs.map(f => <FieldInput key={f.k} f={f} v={v} setV={setV} err={err[f.k]} db={db} />)}</div> : <p className="text-sm text-muted-foreground">None yet. Add your own fields in Settings → Custom fields.</p>}</div></div>}
  </div>;
}
export function EntityForm({ def, open, onClose, initial, onSaved }: { def: EntityDef; open: boolean; onClose: () => void; initial?: Row | Partial<Row>; onSaved?: (r: Row) => void }) {
  const { db, add, update, toast, notify, customFields } = useStore();
  const rows = db[def.key] as Row[];
  const editing = initial && "id" in initial && initial.id ? (initial as Row) : undefined;
  const blank = () => Object.fromEntries(def.fields.map(f => [f.k, f.type === "select" ? optsOf(f, db)[0] ?? "" : ""]));
  const [v, setV] = useState<Record<string, string>>({}); const [err, setErr] = useState<Record<string, string>>({});
  useEffect(() => { if (open) { setV({ ...blank(), [def.idField]: nextId(def, rows), ...(initial ?? {}) } as Record<string, string>); setErr({}); } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const Name = def.singular[0].toUpperCase() + def.singular.slice(1);
  const save = () => {
    const e = validate(def, v, rows, editing?.id, [...moreOf(def.key), ...(customFields[def.key] ?? []).map(cfAsField)]); setErr(e);
    if (Object.keys(e).length) { toast("Please fix the highlighted fields", "err"); return; }
    if (editing) { update(def.key, editing.id, v); toast(`${Name} ${v[def.idField] ?? ""} updated`); onSaved?.({ ...editing, ...v }); }
    else { const r = add(def.key, v); toast(`${Name} ${v[def.idField] ?? ""} created`); notify(`New ${def.singular} ${v[def.idField] ?? v.name ?? ""} created`); onSaved?.(r); }
    onClose();
  };
  return <Sheet open={open} onOpenChange={o => !o && onClose()}><SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl" aria-label={editing ? `Edit ${def.singular}` : `New ${def.singular}`}>
    <SheetHeader className="border-b border-border px-6 py-5"><SheetTitle>{editing ? `Edit ${def.singular}` : `New ${def.singular}`}</SheetTitle><SheetDescription>Fields with <span className="text-danger">*</span> are required. Everything else can be added later.</SheetDescription></SheetHeader>
    <form className="flex-1 overflow-y-auto px-6 py-5" onSubmit={e => { e.preventDefault(); save(); }}><RecordFields def={def} v={v} setV={setV} err={err} /><button type="submit" className="hidden" /></form>
    <div className="flex justify-end gap-2 border-t border-border px-6 py-4"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} data-testid="save">Save {def.singular}</Button></div>
  </SheetContent></Sheet>;
}

/* ---------- Record side-sheet: details, override, notes, files, history ---------- */
export function RecordSheet({ def, row, onClose }: { def: EntityDef; row: Row | null; onClose: () => void }) {
  const { db, update, toast, getExtra, patchExtra, events, log, customFields } = useStore();
  const live = row ? (db[def.key] as Row[]).find(r => r.id === row.id) ?? row : null;
  const [tab, setTab] = useState("Details"); const [v, setV] = useState<Record<string, string>>({}); const [err, setErr] = useState<Record<string, string>>({});
  const [note, setNote] = useState(""); const [ov, setOv] = useState({ k: "", to: "", reason: "" }); const [ovErr, setOvErr] = useState(""); const [tag, setTag] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (row) { setV({ ...row }); setErr({}); setTab("Details"); } }, [row]);
  if (!live) return <Sheet open={false} />;
  const key = `${def.key}:${live[def.idField]}`; const ex = getExtra(key); const id = live[def.idField];
  const hist = events.filter(e => e.ref === id || e.text.includes(id)).slice(0, 40);
  const allFields = [...def.fields, ...moreOf(def.key), ...(customFields[def.key] ?? []).map(cfAsField)];
  const save = () => { const e = validate(def, v, db[def.key] as Row[], live.id, allFields.slice(def.fields.length)); setErr(e); if (Object.keys(e).length) { toast("Please fix the highlighted fields", "err"); return; } const patch = Object.fromEntries(Object.entries(v).filter(([k, x]) => k !== "id" && x !== live[k])); if (!Object.keys(patch).length) { toast("No changes to save", "info"); return; } update(def.key, live.id, patch); toast(`${id} saved`); };
  const applyOv = () => { if (!ov.k) return setOvErr("Pick the field to override"); if (!ov.to.trim()) return setOvErr("Enter the new value"); if (ov.reason.trim().length < 10) return setOvErr("Give a reason of at least 10 characters (it is kept on record)"); const from = live[ov.k] ?? ""; update(def.key, live.id, { [ov.k]: ov.to }); patchExtra(key, e => ({ ...e, overrides: { ...e.overrides, [ov.k]: { from: e.overrides[ov.k]?.from ?? from, to: ov.to, reason: ov.reason, by: "Nimal Perera", at: new Date().toISOString() } } })); log(id, `Override ${ov.k}: "${from}" → "${ov.to}" (reason: ${ov.reason})`); toast(`Override saved on ${id}`); setOv({ k: "", to: "", reason: "" }); setOvErr(""); setV(x => ({ ...x, [ov.k]: ov.to })); };
  const revert = (k: string) => { const o = ex.overrides[k]; update(def.key, live.id, { [k]: o.from }); patchExtra(key, e => { const n = { ...e.overrides }; delete n[k]; return { ...e, overrides: n }; }); log(id, `Override on ${k} reverted to "${o.from}"`); toast(`Reverted ${k}`); };
  const isShip = def.key === "shipments", isOrder = def.key === "salesOrders";
  const tabs = ["Details", `Override${Object.keys(ex.overrides).length ? ` (${Object.keys(ex.overrides).length})` : ""}`, `Notes (${ex.notes.length})`, `Files (${ex.files.length})`, "History"];
  const t = tab.split(" ")[0];
  return <Sheet open={!!row} onOpenChange={o => !o && onClose()}><SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl" aria-label={`${def.singular} ${id}`}>
    <SheetHeader className="space-y-3 border-b border-border px-6 py-5">
      <div className="flex items-center gap-3"><SheetTitle className="font-mono text-lg">{id}</SheetTitle>{live.status && <Badge tone={toneOf(live.status)}>{live.status}</Badge>}{Object.keys(ex.overrides).length > 0 && <Badge tone="amber"><ShieldAlert size={12} />Overridden</Badge>}</div>
      <SheetDescription>{def.singular[0].toUpperCase() + def.singular.slice(1)}{live.name ? ` · ${live.name}` : ""}{live.consignee ? ` · to ${live.consignee}` : ""}{live.buyer ? ` · for ${live.buyer}` : ""}</SheetDescription>
      <div className="flex flex-wrap items-center gap-1.5">{ex.tags.map(g => <span key={g} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs">{g}<button aria-label={`Remove tag ${g}`} onClick={() => patchExtra(key, e => ({ ...e, tags: e.tags.filter(x => x !== g) }))}><X size={11} /></button></span>)}<form onSubmit={e => { e.preventDefault(); if (tag.trim()) { patchExtra(key, x => ({ ...x, tags: Array.from(new Set([...x.tags, tag.trim()])) })); setTag(""); } }}><input aria-label="Add tag" value={tag} onChange={e => setTag(e.target.value)} placeholder="+ tag" className="w-20 rounded-full border border-dashed border-border bg-transparent px-2.5 py-0.5 text-xs outline-none focus:w-32" /></form></div>
      {(isShip || isOrder) && <div className="pt-2"><Journey steps={isShip ? SHIP_STEPS : ORDER_STEPS} at={isShip ? shipStage(live) : orderStage(live)} blocked={live.status === "Customs hold"} /></div>}
    </SheetHeader>
    <div className="relative flex gap-1 overflow-x-auto border-b border-border px-6">{tabs.map(x => <button key={x} onClick={() => setTab(x)} aria-pressed={tab === x} className={cn("-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium", t === x.split(" ")[0] ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{x}</button>)}</div>
    <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
      {(isShip || isOrder) && t === "Details" && <NextAction a={isShip ? shipNext(live) : orderNext(live)} onRun={() => { const to = isShip ? "Delivered" : "Released to production"; update(def.key, live.id, { status: to }); toast(`${id} → ${to}`); }} />}
      {t === "Details" && <><RecordFields def={def} v={v} setV={setV} err={err} />{def.link && <Link href={def.link(live)} className="inline-block text-sm text-primary">Open full page →</Link>}</>}
      {t === "Override" && <div className="space-y-4"><p className="text-sm text-muted-foreground">Replace a value with your own when the system or a partner got it wrong. We keep the original value, your reason and your name, and you can undo it any time.</p>
        <div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm"><span className="mb-1.5 block text-[13px] font-medium">Field</span><select aria-label="Override field" value={ov.k} onChange={e => setOv({ ...ov, k: e.target.value, to: live[e.target.value] ?? "" })} className="h-10 w-full rounded-xl border border-input bg-card px-3"><option value="">Choose…</option>{allFields.filter(f => f.k !== def.idField).map(f => <option key={f.k} value={f.k}>{f.label}</option>)}</select></label><label className="block text-sm"><span className="mb-1.5 block text-[13px] font-medium">New value</span><input aria-label="Override value" value={ov.to} onChange={e => setOv({ ...ov, to: e.target.value })} className="h-10 w-full rounded-xl border border-input bg-card px-3" /></label></div>
        <label className="block text-sm"><span className="mb-1.5 block text-[13px] font-medium">Reason <span className="text-danger">*</span></span><textarea aria-label="Override reason" value={ov.reason} onChange={e => setOv({ ...ov, reason: e.target.value })} rows={2} placeholder="e.g. Carrier emailed a new arrival date" className="w-full rounded-xl border border-input bg-card px-3 py-2" /></label>
        {ovErr && <p className="text-sm text-danger" role="alert">{ovErr}</p>}<Button onClick={applyOv}><ShieldAlert size={15} />Apply override</Button>
        {Object.entries(ex.overrides).length > 0 && <ul className="space-y-2">{Object.entries(ex.overrides).map(([k, o]) => <li key={k} className="flex items-start justify-between gap-3 rounded-xl border border-warning/30 bg-warning/5 p-3 text-sm"><div><p className="font-medium">{allFields.find(f => f.k === k)?.label ?? k}: <span className="line-through opacity-60">{o.from || "—"}</span> → {o.to}</p><p className="text-xs text-muted-foreground">“{o.reason}” · {o.by} · {new Date(o.at).toLocaleString("en-GB")}</p></div><Button variant="outline" className="py-1 text-xs" onClick={() => revert(k)}><Undo2 size={13} />Revert</Button></li>)}</ul>}</div>}
      {t === "Notes" && <div className="space-y-3"><form className="space-y-2" onSubmit={e => { e.preventDefault(); if (!note.trim()) { toast("Write a note first", "err"); return; } patchExtra(key, x => ({ ...x, notes: [{ id: Date.now(), text: note, at: new Date().toISOString(), by: "Nimal Perera" }, ...x.notes] })); log(id, `Note added: ${note.slice(0, 60)}`); setNote(""); toast("Note added"); }}><textarea aria-label="New note" value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Write a note for your team…" className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm" /><Button type="submit"><StickyNote size={15} />Add note</Button></form>
        {ex.notes.length === 0 ? <p className="text-sm text-muted-foreground">No notes yet. Notes are visible to your team, not the customer.</p> : ex.notes.map(n => <div key={n.id} className="rounded-xl bg-muted/60 p-3 text-sm"><p>{n.text}</p><p className="mt-1 flex justify-between text-xs text-muted-foreground">{n.by} · {new Date(n.at).toLocaleString("en-GB")}<button aria-label="Delete note" onClick={() => patchExtra(key, x => ({ ...x, notes: x.notes.filter(y => y.id !== n.id) }))} className="text-danger">Delete</button></p></div>)}</div>}
      {t === "Files" && <div className="space-y-3"><input ref={fileRef} type="file" multiple className="hidden" aria-label="Choose files" onChange={e => { const fs = Array.from(e.target.files ?? []); if (!fs.length) return; patchExtra(key, x => ({ ...x, files: [...fs.map((f, i) => ({ id: Date.now() + i, name: f.name, size: `${Math.max(1, Math.round(f.size / 1024))} KB`, at: new Date().toISOString() })), ...x.files] })); log(id, `Attached ${fs.map(f => f.name).join(", ")}`); toast(`${fs.length} file(s) attached (demo: kept in this browser only as names)`); e.target.value = ""; }} />
        <div className="flex gap-2"><Button onClick={() => fileRef.current?.click()}><Paperclip size={15} />Attach files</Button><Button variant="outline" onClick={() => { patchExtra(key, x => ({ ...x, files: [{ id: Date.now(), name: `photo-${id}-${x.files.length + 1}.jpg`, size: "412 KB", at: new Date().toISOString() }, ...x.files] })); toast("Sample photo attached"); }}>Add sample photo</Button></div>
        {ex.files.length === 0 ? <p className="text-sm text-muted-foreground">No files yet. Attach invoices, photos or emails so everything about this record is in one place.</p> : <ul className="divide-y divide-border rounded-xl border border-border">{ex.files.map(f => <li key={f.id} className="flex items-center justify-between px-3 py-2 text-sm"><span className="flex items-center gap-2"><Paperclip size={14} className="text-muted-foreground" />{f.name}<span className="text-xs text-muted-foreground">{f.size}</span></span><button aria-label={`Remove ${f.name}`} onClick={() => patchExtra(key, x => ({ ...x, files: x.files.filter(y => y.id !== f.id) }))} className="text-xs text-danger">Remove</button></li>)}</ul>}</div>}
      {t === "History" && (hist.length === 0 ? <p className="text-sm text-muted-foreground">No changes recorded yet. Every edit, override, note and file will appear here.</p> : <ol className="relative space-y-4 border-l border-border pl-5">{hist.map(e => <li key={e.id} className="text-sm"><span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-primary" /><p>{e.text}</p><p className="text-xs text-muted-foreground">{e.actor} · {new Date(e.at).toLocaleString("en-GB")} · {e.source}</p></li>)}</ol>)}
    </div>
    {t === "Details" && <div className="flex justify-end gap-2 border-t border-border px-6 py-4"><Button variant="outline" onClick={onClose}>Close</Button><Button onClick={save} data-testid="sheet-save">Save changes</Button></div>}
  </SheetContent></Sheet>;
}

/* ---------- Data grid ---------- */
const TONE: Record<string, string> = { green: "bg-success/10 text-success ring-success/25", blue: "bg-info/10 text-info ring-info/25", amber: "bg-warning/10 text-warning ring-warning/25", red: "bg-danger/10 text-danger ring-danger/25", slate: "bg-muted text-muted-foreground ring-border" };
function InlineCell({ value, onSave, mono }: { value: string; onSave: (v: string) => void; mono?: boolean }) {
  const [ed, setEd] = useState(false); const [v, setV] = useState(value);
  if (ed) return <input autoFocus aria-label="Edit cell" value={v} onChange={e => setV(e.target.value)} onBlur={() => { setEd(false); if (v !== value) onSave(v); }} onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") { setV(value); setEd(false); } }} className="h-8 w-full min-w-[90px] rounded-lg border border-primary bg-card px-2 text-sm outline-none ring-4 ring-primary/10" />;
  return <span title="Double-click to edit" onDoubleClick={() => { setV(value); setEd(true); }} className={cn("block cursor-text rounded-md px-1 py-0.5 -mx-1 hover:bg-muted", mono && "font-mono text-xs")}>{value || <span className="text-muted-foreground">—</span>}</span>;
}
export function EntityTable({ name, cols, extraActions, hideNew, presetFilter, computed, newHref, openNew }: { name: string; cols?: string[]; extraActions?: (r: Row) => React.ReactNode; hideNew?: boolean; presetFilter?: (r: Row) => boolean; computed?: { label: string; render: (r: Row) => React.ReactNode }[]; newHref?: string; openNew?: boolean }) {
  const def = entities[name];
  const { db, ready, update, remove, toast, views, setViews, expert, getExtra, patchExtra, users } = { ...useStore(), users: useStore().db.users };
  const all = useMemo(() => (db[def.key] as Row[]).filter(presetFilter ?? (() => true)), [db, def.key, presetFilter]);
  const columns0 = cols ?? def.fields.map(f => f.k);
  const saved = views[def.key] ?? [];
  const [viewId, setViewId] = useState("all"); const [q, setQ] = useState(""); const [st, setSt] = useState("All");
  const [sorting, setSorting] = useState<SortingState>([]); const [sel, setSel] = useState<RowSelectionState>({});
  const [vis, setVis] = useState<VisibilityState>({}); const [layout, setLayout] = useState<"table" | "cards">("table");
  useEffect(() => { if (window.matchMedia("(max-width: 639px)").matches) setLayout("cards"); }, []); const [dense, setDense] = useState(false);
  const [form, setForm] = useState<{ open: boolean; row?: Row }>({ open: !!openNew }); const [del, setDel] = useState<Row[] | null>(null); const [sheet, setSheet] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true); const [saveOpen, setSaveOpen] = useState(false); const [vname, setVname] = useState("");
  useEffect(() => { const t = setTimeout(() => setLoading(false), 300); return () => clearTimeout(t); }, []);
  useEffect(() => { if (!expert) setVis(v => ({ ...Object.fromEntries(columns0.slice(6).map(c => [c, false])), ...v })); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expert]);
  const applyView = (v?: SavedView) => { setSel({}); if (!v) { setViewId("all"); setQ(""); setSt("All"); setSorting([]); setVis({}); return; } setViewId(v.id); setQ(v.q); setSt(v.status); setSorting(v.sort ? [{ id: v.sort.k, desc: v.sort.dir === -1 }] : []); setVis(Object.fromEntries(v.hidden.map(h => [h, false]))); setLayout(v.layout); };
  const filtered = useMemo(() => all.filter(x => (st === "All" || x.status === st) && (!q || Object.values(x).join(" ").toLowerCase().includes(q.toLowerCase()))), [all, q, st]);
  const label = (k: string) => [...def.fields, ...moreOf(def.key)].find(f => f.k === k)?.label ?? k;
  const colDefs = useMemo<ColumnDef<Row>[]>(() => [
    { id: "_sel", enableSorting: false, header: ({ table }) => <Checkbox aria-label="Select all on page" checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)} />, cell: ({ row }) => <Checkbox aria-label={`Select ${row.original[def.idField]}`} checked={row.getIsSelected()} onCheckedChange={v => row.toggleSelected(!!v)} /> },
    ...columns0.map((c, i): ColumnDef<Row> => ({ id: c, accessorFn: r => r[c] ?? "", header: () => <Jargon text={label(c)} />, sortingFn: (a, b) => { const A = a.original[c] ?? "", B = b.original[c] ?? ""; return !isNaN(+A) && !isNaN(+B) && A !== "" && B !== "" ? +A - +B : A.localeCompare(B); }, enableHiding: i > 0,
      cell: ({ row: { original: r } }) => c === "status" && def.statuses.length ? <select aria-label="Change status" value={r.status} onChange={e => { update(def.key, r.id, { status: e.target.value }); toast(`${r[def.idField]} → ${e.target.value}`); }} className={cn("whitespace-nowrap rounded-full border-0 px-2.5 py-1 text-xs font-medium ring-1 ring-inset", TONE[toneOf(r.status)])}>{def.statuses.includes(r.status) ? null : <option>{r.status}</option>}{def.statuses.map(s => <option key={s}>{s}</option>)}</select>
        : i === 0 ? (def.link ? <Link className="font-medium text-primary hover:underline" href={def.link(r)}>{r[c]}</Link> : <button className="font-mono text-xs font-medium text-primary hover:underline" onClick={() => setSheet(r)}>{r[c]}</button>)
        : c === "color" ? <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded" style={{ background: r[c] }} />{r[c]}</span>
        : <span className="flex items-center gap-1"><InlineCell value={r[c] ?? ""} onSave={v => { update(def.key, r.id, { [c]: v }); toast(`${r[def.idField]}: ${label(c)} updated`, "info"); }} />{getExtra(`${def.key}:${r[def.idField]}`).overrides[c] && <ShieldAlert size={12} className="shrink-0 text-warning" aria-label="Overridden" />}</span> })),
    ...(computed ?? []).map((c): ColumnDef<Row> => ({ id: `_c_${c.label}`, header: c.label, enableSorting: false, cell: ({ row }) => c.render(row.original) })),
    { id: "_act", enableSorting: false, enableHiding: false, header: () => <span className="sr-only">Actions</span>, cell: ({ row: { original: r } }) => <div className="flex items-center justify-end whitespace-nowrap">{extraActions?.(r)}<button aria-label={`Open ${r[def.idField]}`} title="Open details" onClick={() => setSheet(r)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><PanelRightOpen size={15} /></button><button aria-label={`Edit ${r[def.idField]}`} onClick={() => setForm({ open: true, row: r })} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><Pencil size={15} /></button><button aria-label={`Delete ${r[def.idField]}`} onClick={() => setDel([r])} className="rounded-lg p-1.5 text-danger hover:bg-danger/10"><Trash2 size={15} /></button></div> },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [columns0.join(), computed, def, db, extraActions]);
  const table = useReactTable({ data: filtered, columns: colDefs, state: { sorting, rowSelection: sel, columnVisibility: vis }, onSortingChange: setSorting, onRowSelectionChange: setSel, onColumnVisibilityChange: setVis, getRowId: r => r.id, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: 8 } } });
  const chosen = filtered.filter(r => sel[r.id]);
  const visibleCols = columns0.filter(c => vis[c] !== false);
  const bulk = (patch: Partial<Row>, what: string) => { chosen.forEach(r => update(def.key, r.id, patch)); toast(`${what} on ${chosen.length} ${def.title.toLowerCase()}`); setSel({}); };
  const saveView = () => { if (!vname.trim()) { toast("Give the view a name", "err"); return; } const v: SavedView = { id: `v-${Date.now()}`, name: vname.trim(), q, status: st, sort: sorting[0] ? { k: sorting[0].id, dir: sorting[0].desc ? -1 : 1 } : null, hidden: Object.entries(vis).filter(([, b]) => !b).map(([k]) => k), layout }; setViews(def.key, [...saved, v]); setViewId(v.id); setSaveOpen(false); setVname(""); toast(`View “${v.name}” saved`); };
  const isJourney = def.key === "shipments" || def.key === "salesOrders";
  const pg = table.getState().pagination.pageIndex + 1, pages = Math.max(1, table.getPageCount());
  const promoted = def.statuses.slice(0, 3);
  return <Card className="min-w-0 overflow-hidden">
    <div className="flex flex-wrap items-center gap-1 border-b border-border px-4 pt-3 no-print" aria-label="Saved views">
      {[{ id: "all", name: `All ${def.title.toLowerCase()}` }, ...saved].map(v => <span key={v.id} className={cn("group -mb-px flex items-center border-b-2", viewId === v.id ? "border-primary" : "border-transparent")}><button aria-pressed={viewId === v.id} onClick={() => applyView(saved.find(s => s.id === v.id))} className={cn("px-3 py-2 text-sm font-medium", viewId === v.id ? "text-primary" : "text-muted-foreground hover:text-foreground")}>{v.name}</button>{v.id !== "all" && <button aria-label={`Delete view ${v.name}`} onClick={() => { setViews(def.key, saved.filter(s => s.id !== v.id)); if (viewId === v.id) applyView(); toast(`View “${v.name}” deleted`); }} className="mr-1 hidden rounded p-0.5 text-muted-foreground hover:bg-muted group-hover:block"><X size={12} /></button>}</span>)}
      <Popover open={saveOpen} onOpenChange={setSaveOpen}><PopoverTrigger asChild><button className="ml-1 flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"><Bookmark size={14} />Save view</button></PopoverTrigger><PopoverContent align="start" className="w-72 space-y-3"><p className="text-sm font-medium">Save the current search, filter, sort and columns</p><input aria-label="View name" autoFocus value={vname} onChange={e => setVname(e.target.value)} onKeyDown={e => e.key === "Enter" && saveView()} placeholder="e.g. Late sea shipments" className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm" /><Button className="w-full justify-center" onClick={saveView}>Save view</Button></PopoverContent></Popover>
    </div>
    <div className="flex flex-wrap items-center gap-2 px-4 py-3 no-print">
      <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-input bg-background px-3 py-2"><Search size={15} className="text-muted-foreground" /><input aria-label={`Search ${def.title}`} placeholder={`Search ${def.title.toLowerCase()}…`} value={q} onChange={e => { setQ(e.target.value); table.setPageIndex(0); }} className="w-full bg-transparent text-sm outline-none" />{q && <button aria-label="Clear search" onClick={() => setQ("")}><X size={14} /></button>}</div>
      {promoted.length > 0 && <div className="hidden items-center gap-1 md:flex">{["All", ...promoted].map(s => <button key={s} aria-pressed={st === s} onClick={() => { setSt(s); table.setPageIndex(0); }} className={cn("rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset", st === s ? "bg-primary text-primary-foreground ring-primary" : "ring-border hover:bg-muted")}>{s}</button>)}</div>}
      {def.statuses.length > 0 && <select aria-label="Filter by status" value={st} onChange={e => { setSt(e.target.value); table.setPageIndex(0); }} className="h-9 rounded-xl border border-input bg-card px-3 text-sm"><option>All</option>{def.statuses.map(s => <option key={s}>{s}</option>)}</select>}
      <Popover><PopoverTrigger asChild><Button variant="outline"><SlidersHorizontal size={15} />Display</Button></PopoverTrigger><PopoverContent align="end" className="w-72 space-y-4">
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Layout</p><div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">{(["table", "cards"] as const).map(l => <button key={l} onClick={() => setLayout(l)} aria-pressed={layout === l} className={cn("flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm capitalize", layout === l && "bg-card shadow-sm")}>{l === "table" ? <Rows3 size={14} /> : <LayoutGrid size={14} />}{l}</button>)}</div></div>
        <label className="flex items-center justify-between text-sm">Compact rows<Checkbox aria-label="Compact rows" checked={dense} onCheckedChange={v => setDense(!!v)} /></label>
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Columns</p><div className="max-h-48 space-y-1.5 overflow-y-auto">{columns0.slice(1).map(c => <label key={c} className="flex items-center gap-2 text-sm"><Checkbox aria-label={`Show ${label(c)}`} checked={vis[c] !== false} onCheckedChange={v => setVis(x => ({ ...x, [c]: !!v }))} />{label(c)}</label>)}</div></div>
      </PopoverContent></Popover>
      <Button variant="outline" onClick={() => { downloadCSV(def.key, filtered, visibleCols); toast(`Exported ${filtered.length} ${def.title.toLowerCase()} to CSV`); }}><Download size={15} />CSV</Button>
      <Button variant="outline" onClick={() => window.print()}><Printer size={15} />PDF</Button>
      {!hideNew && newHref && <Link href={newHref}><Button><Plus size={15} />New {def.singular}</Button></Link>}{!hideNew && !newHref && <Button onClick={() => setForm({ open: true })}><Plus size={15} />New {def.singular}</Button>}
    </div>
    {chosen.length > 0 && <div className="mx-4 mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm text-background no-print" role="region" aria-label="Bulk actions">
      <span className="font-medium">{chosen.length} selected</span><span className="opacity-40">|</span>
      {def.statuses.length > 0 && <select aria-label="Bulk change status" defaultValue="" onChange={e => { if (e.target.value) bulk({ status: e.target.value }, `Status → ${e.target.value}`); e.target.value = ""; }} className="h-8 rounded-lg bg-background/10 px-2 text-sm text-background"><option value="" className="text-foreground">Change status…</option>{def.statuses.map(s => <option key={s} className="text-foreground">{s}</option>)}</select>}
      <select aria-label="Bulk assign" defaultValue="" onChange={e => { if (e.target.value) bulk({ assignee: e.target.value }, `Assigned to ${e.target.value}`); e.target.value = ""; }} className="h-8 rounded-lg bg-background/10 px-2 text-sm text-background"><option value="" className="text-foreground">Assign to…</option>{users.map(u => <option key={u.id} className="text-foreground">{u.name}</option>)}</select>
      <button onClick={() => { chosen.forEach(r => patchExtra(`${def.key}:${r[def.idField]}`, x => ({ ...x, tags: Array.from(new Set([...x.tags, "Priority"])) }))); toast(`Tagged ${chosen.length} as Priority`); setSel({}); }} className="flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-background/10"><Tag size={14} />Tag “Priority”</button>
      <button onClick={() => bulk({ priority: "Urgent" }, "Marked urgent")} className="flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-background/10"><UserPlus size={14} />Mark urgent</button>
      <button onClick={() => { downloadCSV(`${def.key}-selected`, chosen, visibleCols); toast(`Exported ${chosen.length} selected`); }} className="flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-background/10"><Download size={14} />Export</button>
      <button onClick={() => setDel(chosen)} className="flex items-center gap-1 rounded-lg px-2 py-1 text-red-300 hover:bg-background/10"><Trash2 size={14} />Delete</button>
      <button onClick={() => setSel({})} className="ml-auto rounded-lg px-2 py-1 hover:bg-background/10">Clear</button></div>}
    {!ready || loading ? <Skeleton /> : filtered.length === 0 ? (all.length ? <div className="flex flex-col items-center gap-2 px-6 py-14 text-center"><p className="font-medium">No matches</p><p className="text-sm text-muted-foreground">Try clearing the search or the status filter.</p><Button variant="outline" onClick={() => applyView()}>Clear filters</Button></div> : <TeachEmpty k={def.key === "salesOrders" ? "manufacturing/orders" : def.key} title={`No ${def.title.toLowerCase()} yet`} action={<Button onClick={() => setForm({ open: true })}><Plus size={15} />New {def.singular}</Button>} />) :
      layout === "cards" ? <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">{table.getRowModel().rows.map(({ original: r }) => <div key={r.id} className="group rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-md">
        <div className="flex items-start justify-between gap-2"><div className="flex items-center gap-2"><Checkbox aria-label={`Select ${r[def.idField]}`} checked={!!sel[r.id]} onCheckedChange={v => setSel(s => ({ ...s, [r.id]: !!v }))} /><button onClick={() => setSheet(r)} className="font-mono text-sm font-semibold text-primary hover:underline">{r[def.idField]}</button></div>{r.status && <Badge tone={toneOf(r.status)}>{r.status}</Badge>}</div>
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">{visibleCols.filter(c => c !== def.idField && c !== "status").slice(0, 4).map(c => <div key={c}><dt className="text-xs text-muted-foreground">{label(c)}</dt><dd className="truncate">{r[c] || "—"}</dd></div>)}</dl>
        {isJourney && <div className="mt-4"><Journey compact steps={def.key === "shipments" ? SHIP_STEPS : ORDER_STEPS} at={def.key === "shipments" ? shipStage(r) : orderStage(r)} blocked={r.status === "Customs hold"} /><p className="mt-2 text-xs text-muted-foreground">Next: <span className="font-medium text-foreground">{(def.key === "shipments" ? shipNext(r) : orderNext(r)).title}</span></p></div>}
        <div className="mt-3 flex justify-end gap-1 opacity-70 group-hover:opacity-100">{def.link && <Link href={def.link(r)} className="rounded-lg px-2 py-1 text-xs text-primary hover:bg-accent">Open page</Link>}<button aria-label={`Edit ${r[def.idField]}`} onClick={() => setForm({ open: true, row: r })} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><Pencil size={14} /></button></div></div>)}</div> :
      <div className="relative overflow-x-auto" tabIndex={0}><table className="w-full text-sm"><thead>{table.getHeaderGroups().map(hg => <tr key={hg.id} className="border-y border-border bg-muted/40 text-left text-xs text-muted-foreground">{hg.headers.map(h => <th key={h.id} className={cn("px-4 font-medium", dense ? "py-2" : "py-3", h.id === "_sel" && "w-10")}>{h.column.getCanSort() ? <button className="inline-flex items-center gap-1" onClick={h.column.getToggleSortingHandler()}>{flexRender(h.column.columnDef.header, h.getContext())}<ArrowUpDown size={12} className={h.column.getIsSorted() ? "text-primary" : "opacity-40"} /></button> : flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>)}</thead>
        <tbody>{table.getRowModel().rows.map(row => <tr key={row.id} data-state={row.getIsSelected() ? "selected" : undefined} className="border-b border-border last:border-0 hover:bg-muted/40 data-[state=selected]:bg-accent/50">{row.getVisibleCells().map(c => <td key={c.id} className={cn("px-4", dense ? "py-1.5" : "py-3")}>{flexRender(c.column.columnDef.cell, c.getContext())}</td>)}</tr>)}</tbody></table></div>}
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground no-print"><span>{filtered.length} records · page {pg} of {pages}{expert ? "" : " · double-click a cell to edit"}</span><div className="flex gap-1"><Button variant="outline" className="px-2 py-1 text-xs" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Prev</Button><Button variant="outline" className="px-2 py-1 text-xs" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Next</Button></div></div>
    <EntityForm def={def} open={form.open} initial={form.row} onClose={() => setForm({ open: false })} />
    <RecordSheet def={def} row={sheet} onClose={() => setSheet(null)} />
    <Modal open={!!del} title={del && del.length > 1 ? `Delete ${del.length} ${def.title.toLowerCase()}?` : `Delete ${def.singular}?`} onClose={() => setDel(null)} footer={<><Button variant="outline" onClick={() => setDel(null)}>Cancel</Button><Button variant="danger" onClick={() => { del!.forEach(r => remove(def.key, r.id)); toast(del!.length > 1 ? `${del!.length} deleted` : `${del![0][def.idField]} deleted`); setDel(null); setSel({}); }}>Delete</Button></>}>This removes <b>{del?.map(r => r[def.idField]).join(", ")}</b> from the demo data. You can restore everything with Settings → Reset demo data.</Modal>
  </Card>;
}
