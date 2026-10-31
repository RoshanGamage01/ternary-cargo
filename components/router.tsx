"use client";

import * as O from "./pages/ops"; import * as W from "./pages/wh"; import * as M from "./pages/mfg"; import * as X from "./pages/misc";
type Q = Record<string, string>;
function route(r: string, q: Q) {
  const [a, b, c] = r.split("/");
  if (a === "shipments" && b === "new") return <O.Wizard q={q} />;
  if (a === "shipments" && b) return <O.ShipmentDetail ref_={decodeURIComponent(b)} q={q} />;
  if (a === "portal") return <X.Portal ref_={b ?? ""} />;
  if (a === "manufacturing") { if (b === "orders" && c) return <M.SalesOrderDetail ref_={c} />; const mm: Record<string, JSX.Element> = { orders: <M.SalesOrders q={q} />, serialisation: <M.Serialisation q={q} />, palletising: <M.Palletising q={q} />, "packing-lists": <M.PackingLists q={q} />, "load-plan": <M.LoadPlan q={q} />, loading: <M.Loading q={q} />, receiving: <M.Receiving q={q} /> }; return mm[b] ?? mm.orders; }
  const m: Record<string, JSX.Element> = { login: <X.Login />, tenant: <X.Tenant />, onboarding: <X.Onboarding />, dashboard: <O.Dashboard q={q} />, exceptions: <O.Exceptions />, quotations: <O.Quotations q={q} />, bookings: <O.Bookings />, shipments: <O.Shipments />, consolidation: <O.Consolidation q={q} />, documents: <O.Documents />, customs: <O.Customs />, tracking: <O.Tracking q={q} />, arrival: <O.Arrival />, unloading: <W.Unloading q={q} />, verification: <W.Verification q={q} />, scan: <W.Scan />, release: <W.Release />, billing: <X.Billing />, reports: <X.Reports />, "master-data": <X.MasterData q={q} />, settings: <X.Settings q={q} /> };
  return m[a] ?? <O.Dashboard q={q} />;
}
export default function Router({ r, q }: { r: string; q: Q }) { return route(r, q); }
