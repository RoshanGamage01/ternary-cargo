"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useStore, downloadCSV } from "@/lib/store";
import { entities, EntityDef, toneOf, FieldDef } from "@/lib/entities";
import type { Row, DB } from "@/lib/seed";
import { Card, Button, Drawer, Modal, Skeleton, Empty } from "./ui";
import { cn } from "@/lib/cn";
import { Plus, Download, Printer, Pencil, Trash2, ArrowUpDown, Search } from "lucide-react";

export function nextId(def: EntityDef, rows: Row[]) {
  if (!def.prefix) return "";
  const nums = rows.map(r => parseInt((r[def.idField] ?? "").replace(/\D/g, "").slice(-4)) || 0);
  const n = Math.max(0, ...nums) + 1;
  return def.prefix + String(n).padStart(4, "0");
}
const optsOf = (f: FieldDef, db: DB) => typeof f.options === "function" ? f.options(db) : f.options ?? [];
export function validate(def: EntityDef, v: Record<string, string>, rows: Row[], editingId?: string) {
  const e: Record<string, string> = {};
  for (const f of def.fields) {
    const val = (v[f.k] ?? "").trim();
    if (f.required && !val) e[f.k] = `${f.label} is required`;
    else if (val && f.pattern && !f.pattern.test(val)) e[f.k] = f.patternMsg ?? "Invalid format";
    else if (val && f.type === "number" && isNaN(+val)) e[f.k] = "Must be a number";
  }
  const idv = v[def.idField];
  if (idv && rows.some(r => r[def.idField] === idv && r.id !== editingId)) e[def.idField] = `${idv} already exists`;
  return e;
}
export function EntityForm({ def, open, onClose, initial, onSaved }: { def: EntityDef; open: boolean; onClose: () => void; initial?: Row | Partial<Row>; onSaved?: (r: Row) => void }) {
  const { db, add, update, toast, notify } = useStore();
  const rows = db[def.key] as Row[];
  const editing = initial && "id" in initial && initial.id ? (initial as Row) : undefined;
  const blank = () => Object.fromEntries(def.fields.map(f => [f.k, f.type === "select" ? optsOf(f, db)[0] ?? "" : ""]));
  const [v, setV] = useState<Record<string, string>>({});
  const [err, setErr] = useState<Record<string, string>>({});
  useEffect(() => { if (open) { setV({ ...blank(), [def.idField]: nextId(def, rows), ...(initial ?? {}) } as Record<string, string>); setErr({}); } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const save = () => {
    const e = validate(def, v, rows, editing?.id); setErr(e);
    if (Object.keys(e).length) { toast("Please fix the highlighted fields", "err"); return; }
    if (editing) { update(def.key, editing.id, v); toast(`${def.singular[0].toUpperCase() + def.singular.slice(1)} ${v[def.idField] ?? ""} updated`); onSaved?.({ ...editing, ...v }); }
    else { const r = add(def.key, v); toast(`${def.singular[0].toUpperCase() + def.singular.slice(1)} ${v[def.idField] ?? ""} created`); notify(`New ${def.singular} ${v[def.idField] ?? v.name ?? ""} created`); onSaved?.(r); }
    onClose();
  };
  return <Drawer open={open} onClose={onClose} title={editing ? `Edit ${def.singular}` : `New ${def.singular}`} footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} data-testid="save">Save {def.singular}</Button></>}>
    <form className="grid grid-cols-2 gap-4" onSubmit={e => { e.preventDefault(); save(); }}>
      {def.fields.map((f, i) => <label key={f.k} className={cn("block", (f.k === "name" || f.k === "description") && "col-span-2")}>
        <span className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}{f.required && <span className="text-danger"> *</span>}</span>
        {f.type === "select" ? <select name={f.k} autoFocus={i === 0} value={v[f.k] ?? ""} onChange={e => setV({ ...v, [f.k]: e.target.value })} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm">{optsOf(f, db).map(o => <option key={o} value={o}>{o || "—"}</option>)}</select>
          : <input name={f.k} autoFocus={i === 0} type={f.type === "date" ? "date" : f.type === "number" ? "text" : "text"} inputMode={f.type === "number" ? "decimal" : undefined} value={v[f.k] ?? ""} onChange={e => setV({ ...v, [f.k]: e.target.value })} className={cn("w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20", err[f.k] ? "border-danger/50" : "border-border")} />}
        {err[f.k] ? <span className="mt-1 block text-xs text-danger">{err[f.k]}</span> : f.hint && <span className="mt-1 block text-xs text-muted-foreground">{f.hint}</span>}
      </label>)}
      <button type="submit" className="hidden" />
    </form>
  </Drawer>;
}
export function EntityTable({ name, cols, extraActions, hideNew, presetFilter, computed, newHref, openNew }: { name: string; cols?: string[]; extraActions?: (r: Row) => React.ReactNode; hideNew?: boolean; presetFilter?: (r: Row) => boolean; computed?: { label: string; render: (r: Row) => React.ReactNode }[]; newHref?: string; openNew?: boolean }) {
  const def = entities[name];
  const { db, ready, update, remove, toast } = useStore();
  const all = (db[def.key] as Row[]).filter(presetFilter ?? (() => true));
  const columns = cols ?? def.fields.map(f => f.k);
  const [q, setQ] = useState(""); const [st, setSt] = useState("All"); const [sort, setSort] = useState<{ k: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(1); const per = 8;
  const [form, setForm] = useState<{ open: boolean; row?: Row }>({ open: !!openNew });
  const [del, setDel] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 350); return () => clearTimeout(t); }, []);
  const filtered = useMemo(() => {
    let r = all.filter(x => (st === "All" || x.status === st) && (!q || Object.values(x).join(" ").toLowerCase().includes(q.toLowerCase())));
    if (sort) r = [...r].sort((a, b) => { const A = a[sort.k] ?? "", B = b[sort.k] ?? ""; const n = !isNaN(+A) && !isNaN(+B) && A !== "" && B !== ""; return (n ? +A - +B : A.localeCompare(B)) * sort.dir; });
    return r;
  }, [all, q, st, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / per)); const pg = Math.min(page, pages);
  const view = filtered.slice((pg - 1) * per, pg * per);
  const label = (k: string) => def.fields.find(f => f.k === k)?.label ?? k;
  return <Card>
    <div className="flex flex-wrap items-center gap-2 border-b border-border p-3 no-print">
      <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-border px-3 py-1.5"><Search size={15} className="text-muted-foreground" /><input aria-label={`Search ${def.title}`} placeholder={`Search ${def.title.toLowerCase()}…`} value={q} onChange={e => { setQ(e.target.value); setPage(1); }} className="w-full bg-transparent text-sm outline-none" /></div>
      {def.statuses.length > 0 && <select aria-label="Filter by status" value={st} onChange={e => { setSt(e.target.value); setPage(1); }} className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm"><option>All</option>{def.statuses.map(s => <option key={s}>{s}</option>)}</select>}
      <Button variant="outline" onClick={() => { downloadCSV(def.key, filtered, columns); toast(`Exported ${filtered.length} ${def.title.toLowerCase()} to CSV`); }}><Download size={15} />CSV</Button>
      <Button variant="outline" onClick={() => window.print()}><Printer size={15} />PDF</Button>
      {!hideNew && newHref && <Link href={newHref}><Button><Plus size={15} />New {def.singular}</Button></Link>}{!hideNew && !newHref && <Button onClick={() => setForm({ open: true })}><Plus size={15} />New {def.singular}</Button>}
    </div>
    {!ready || loading ? <Skeleton /> : filtered.length === 0 ? <Empty title={all.length ? "No matches" : `No ${def.title.toLowerCase()} yet`} hint={all.length ? "Try clearing the search or the status filter." : `Create your first ${def.singular} to get started.`} action={all.length ? <Button variant="outline" onClick={() => { setQ(""); setSt("All"); }}>Clear filters</Button> : <Button onClick={() => setForm({ open: true })}><Plus size={15} />New {def.singular}</Button>} /> :
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">{columns.map(c => <th key={c} className="px-4 py-2.5 font-medium"><button className="inline-flex items-center gap-1 uppercase" onClick={() => setSort(s => ({ k: c, dir: s?.k === c && s.dir === 1 ? -1 : 1 }))}>{label(c)}<ArrowUpDown size={12} className={sort?.k === c ? "text-primary" : "opacity-40"} /></button></th>)}{computed?.map(c => <th key={c.label} className="px-4 py-2.5 font-medium">{c.label}</th>)}<th className="px-4 py-2.5 text-right font-medium no-print">Actions</th></tr></thead>
        <tbody>{view.map(r => <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted">{columns.map((c, i) => <td key={c} className="px-4 py-2.5 text-foreground">{c === "status" && def.statuses.length ? <select aria-label="Change status" value={r.status} onChange={e => { update(def.key, r.id, { status: e.target.value }); toast(`${r[def.idField]} → ${e.target.value}`); }} className={cn("whitespace-nowrap rounded-md border-0 px-2 py-0.5 text-xs font-medium ring-1 ring-inset", { green: "bg-success/10 text-success ring-success/25", blue: "bg-info/10 text-info ring-info/25", amber: "bg-warning/10 text-warning ring-warning/25", red: "bg-danger/10 text-danger ring-danger/25", slate: "bg-muted text-muted-foreground ring-border" }[toneOf(r.status)])}>{def.statuses.includes(r.status) ? null : <option>{r.status}</option>}{def.statuses.map(s => <option key={s}>{s}</option>)}</select>
          : i === 0 && def.link ? <Link className="font-medium text-primary hover:underline" href={def.link(r)}>{r[c]}</Link> : c === "color" ? <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded" style={{ background: r[c] }} />{r[c]}</span> : <span className={i === 0 ? "font-mono text-xs" : ""}>{r[c] || "—"}</span>}</td>)}
          {computed?.map(c => <td key={c.label} className="px-4 py-2.5">{c.render(r)}</td>)}<td className="whitespace-nowrap px-4 py-2 text-right no-print">{extraActions?.(r)}<button aria-label={`Edit ${r[def.idField]}`} onClick={() => setForm({ open: true, row: r })} className="rounded p-1.5 text-muted-foreground hover:bg-muted"><Pencil size={15} /></button><button aria-label={`Delete ${r[def.idField]}`} onClick={() => setDel(r)} className="rounded p-1.5 text-danger hover:bg-danger/10"><Trash2 size={15} /></button></td></tr>)}</tbody></table></div>}
    <div className="flex items-center justify-between px-4 py-2.5 text-xs text-muted-foreground no-print"><span>{filtered.length} records · page {pg} of {pages}</span><div className="flex gap-1"><Button variant="outline" className="px-2 py-1 text-xs" disabled={pg <= 1} onClick={() => setPage(pg - 1)}>Prev</Button><Button variant="outline" className="px-2 py-1 text-xs" disabled={pg >= pages} onClick={() => setPage(pg + 1)}>Next</Button></div></div>
    <EntityForm def={def} open={form.open} initial={form.row} onClose={() => setForm({ open: false })} />
    <Modal open={!!del} title={`Delete ${def.singular}?`} onClose={() => setDel(null)} footer={<><Button variant="outline" onClick={() => setDel(null)}>Cancel</Button><Button variant="danger" onClick={() => { remove(def.key, del!.id); toast(`${del![def.idField]} deleted`); setDel(null); }}>Delete</Button></>}>This removes <b>{del?.[def.idField]}</b> from the demo data. You can restore everything with Settings → Reset demo data.</Modal>
  </Card>;
}
