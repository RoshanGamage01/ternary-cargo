// Typical internal dimensions (cm) and payloads (kg); verify per carrier. ULD AKE modelled as a box (real AKE is contoured).
export const SPACES: Record<string, { name: string; L: number; W: number; H: number; payload: number }> = {
  "20GP": { name: "20' GP", L: 589, W: 235, H: 239, payload: 28200 },
  "40GP": { name: "40' GP", L: 1203, W: 235, H: 239, payload: 26700 },
  "40HC": { name: "40' HC", L: 1203, W: 235, H: 269, payload: 26500 },
  "AKE": { name: "LD3 / AKE ULD", L: 153, W: 156, H: 160, payload: 1588 },
};
export type Item = { id: string; l: number; w: number; h: number; kg: number; group: string; sku: string; color: string; stack?: boolean; hazmat?: string };
export type Placed = Item & { x: number; y: number; z: number; L: number; W: number };
// Greedy wall-building heuristic: sort by height then footprint; fill across width, then stack layers, then advance along length.
// Tries both orientations of the footprint. Not an optimiser.
export function pack(items: Item[], spaceKey: string) {
  const S = SPACES[spaceKey];
  const sorted = [...items].sort((a, b) => b.h - a.h || b.l * b.w - a.l * a.w);
  const placed: Placed[] = []; const unplaced: Item[] = [];
  let x = 0, y = 0, z = 0, rowDepth = 0, layerH = 0, kg = 0;
  for (const it of sorted) {
    if (kg + it.kg > S.payload) { unplaced.push(it); continue; }
    let ok = false;
    for (let attempt = 0; attempt < 3 && !ok; attempt++) {
      for (const [L, W] of [[it.l, it.w], [it.w, it.l]]) {
        if (y + W <= S.W && z + it.h <= S.H && x + L <= S.L) { placed.push({ ...it, x, y, z, L, W }); y += W; layerH = Math.max(layerH, it.h); rowDepth = Math.max(rowDepth, L); kg += it.kg; ok = true; break; }
      }
      if (ok) break;
      if (attempt === 0) { if (it.stack === false) { continue; } y = 0; z += layerH; layerH = 0; }
      else if (attempt === 1) { y = 0; z = 0; x += rowDepth; rowDepth = 0; layerH = 0; }
    }
    if (!ok) unplaced.push(it);
  }
  // advisory checks (not validated against IMDG/IATA DGR or RDA axle limits)
  const warn: { level: "danger" | "warning" | "ok"; text: string }[] = [];
  const wt = kg / S.payload;
  warn.push(wt > 1 ? { level: "danger", text: `Payload exceeded: ${Math.round(kg)} / ${S.payload} kg` } : wt > 0.95 ? { level: "warning", text: `Payload at ${(wt * 100).toFixed(0)}% of max` } : { level: "ok", text: `Payload within limit (${(wt * 100).toFixed(0)}%)` });
  const cogX = kg ? placed.reduce((a, p) => a + (p.x + p.L / 2) * p.kg, 0) / kg : S.L / 2;
  const cogY = kg ? placed.reduce((a, p) => a + (p.y + p.W / 2) * p.kg, 0) / kg : S.W / 2;
  const offL = ((cogX - S.L / 2) / S.L) * 100, offW = ((cogY - S.W / 2) / S.W) * 100;
  warn.push(Math.abs(offL) > 10 || Math.abs(offW) > 10 ? { level: "warning", text: `Centre of gravity off-centre: ${offL.toFixed(0)}% along length, ${offW.toFixed(0)}% across width (tolerance ±10%)` } : { level: "ok", text: `Centre of gravity within ±10% (${offL.toFixed(0)}% / ${offW.toFixed(0)}%)` });
  const rear = kg ? Math.round((cogX / S.L) * 100) : 50;
  if (spaceKey !== "AKE") warn.push(rear > 60 || rear < 40 ? { level: "warning", text: `Est. road axle split front ${100 - rear}% / rear ${rear}%: uneven (advisory; Sri Lanka limits to confirm)` } : { level: "ok", text: `Est. axle split front ${100 - rear}% / rear ${rear}% (advisory)` });
  const stacked = placed.filter(p => p.stack === false && placed.some(o => o !== p && o.z >= p.z + p.h - 0.1 && o.x < p.x + p.L && o.x + o.L > p.x && o.y < p.y + p.W && o.y + o.W > p.y));
  warn.push(stacked.length ? { level: "danger", text: `${stacked.length} non-stackable units have cargo on top` } : { level: "ok", text: "Stacking rules respected" });
  const hz = Array.from(new Set(placed.filter(p => p.hazmat).map(p => p.hazmat!)));
  if (hz.length) warn.push({ level: "warning", text: `Dangerous goods on board (${hz.join(", ")}): segregation and DG declaration required (IMDG / IATA DGR, advisory)` });
  const vol = placed.reduce((a, p) => a + p.L * p.W * p.h, 0) / (S.L * S.W * S.H);
  return { space: S, placed, unplaced, warn, cog: { x: cogX, y: cogY }, volPct: Math.round(vol * 1000) / 10, wtPct: Math.round((kg / S.payload) * 1000) / 10, kg };
}
