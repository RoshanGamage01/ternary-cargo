export type Factor = { name: string; impact: number; note: string };
const addDays = (iso: string, d: number) => { const t = new Date(iso); t.setTime(t.getTime() + d * 864e5); return t.toISOString().slice(0, 10); };
export const fmtDate = (iso: string) => iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
// Prototype heuristic: carrier ETA + weighted factor days. NOT a trained model.
export function predictEta(s: Record<string, string>) {
  const sea = s.mode.startsWith("Sea"); const air = s.mode === "Air";
  const scale = sea ? 1 : air ? 0.15 : 0.3;
  const f: Factor[] = [];
  if (/CMB|Colombo/.test(s.pod)) f.push({ name: "Port congestion (Colombo)", impact: +(1.2 * scale).toFixed(1), note: "Mock berth-wait index 0.62" });
  if (s.transhipment === "Yes") f.push({ name: "Transhipment", impact: +(1.5 * scale).toFixed(1), note: "Connection risk at hub" });
  f.push({ name: "Weather on route", impact: +(0.4 * scale).toFixed(1), note: "Mock weather score" });
  if (s.customsRisk === "High") f.push({ name: "Customs inspection risk", impact: +(1.0 * (sea ? 1 : 0.5)).toFixed(1), note: "Permit / HS query history" });
  if (/ONE|ONEY/.test(s.carrier ?? "")) f.push({ name: "Carrier schedule reliability", impact: +(0.8 * scale).toFixed(1), note: "Mock lane on-time 71%" });
  else f.push({ name: "Carrier schedule reliability", impact: -(0.3 * scale).toFixed(1), note: "Mock lane on-time 88%" });
  const delay = done(s.status) ? 0 : f.reduce((a, b) => a + b.impact, 0);
  const band = done(s.status) ? 0 : Math.max(0.2, +(delay * 0.5 + 0.5 * scale).toFixed(1));
  const risk = delay >= 2 ? "High" : delay >= 0.8 ? "Medium" : "Low";
  const p90d = done(s.status) ? 0 : +(delay + 1.28 * band).toFixed(1);
  return { p90: s.eta ? addDays(s.eta, Math.ceil(p90d)) : "", p90d, predicted: s.eta ? addDays(s.eta, Math.round(delay)) : "", delay: +delay.toFixed(1), band, risk, confidence: Math.max(55, Math.round(92 - band * 10)), factors: f };
}
const done = (st?: string) => ["Arrived", "Delivered", "Verified", "Released"].includes(st ?? "");
