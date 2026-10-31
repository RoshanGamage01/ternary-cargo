import { chromium } from "playwright";
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
for (const r of (process.env.R || "dashboard,manufacturing/orders,manufacturing/orders/SO-2026-0152,shipments,shipments/TC-SEA-24121,consolidation,settings,quotations").split(",")) {
  await p.goto("http://localhost:3200/" + r, { waitUntil: "networkidle" }); await p.waitForTimeout(400);
  const o = await p.evaluate(() => { const out = []; for (const e of document.querySelectorAll("body *")) { const b = e.getBoundingClientRect(); if (b.right <= 392 || b.width === 0) continue; let q = e.parentElement, ok = false; while (q) { const s = getComputedStyle(q).overflowX; if (s === "auto" || s === "scroll" || s === "hidden") { ok = true; break; } q = q.parentElement; } if (ok) continue; const par = e.parentElement.getBoundingClientRect(); if (par.right > 392) continue; out.push(`${e.tagName}.${(e.className?.baseVal ?? e.className).toString().slice(0, 90)} w=${Math.round(b.width)} r=${Math.round(b.right)}`); } return [document.documentElement.scrollWidth, out.slice(0, 6)]; });
  console.log(r, o[0]); o[1].forEach(x => console.log("   ", x));
}
await b.close();
