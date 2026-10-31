import { chromium } from "playwright"; import AxeBuilder from "@axe-core/playwright";
const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const agg = {};
for (const r of (process.env.R||"login,dashboard,shipments,unloading,reports,portal/TC-SEA-24121,manufacturing/load-plan,manufacturing/palletising,scan,master-data").split(",")) {
  await p.goto("http://localhost:3200/"+r,{waitUntil:"networkidle"}); await p.waitForTimeout(400);
  const res = await new AxeBuilder({ page: p }).withTags(["wcag2a","wcag2aa"]).analyze();
  for (const v of res.violations.filter(v=>["serious","critical"].includes(v.impact))) for (const n of v.nodes) { const k = v.id+" :: "+(n.any[0]?.data ? `${n.any[0].data.fgColor} on ${n.any[0].data.bgColor} ${n.any[0].data.contrastRatio}` : "")+" :: "+n.html.slice(0,110); agg[k]=(agg[k]||[]).concat(r); }
}
for (const [k,v] of Object.entries(agg)) console.log(v.length, k, v.slice(0,3).join(","));
await b.close();
