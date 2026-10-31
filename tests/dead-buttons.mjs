import { chromium } from "playwright";
const BASE = "http://localhost:3100/";
const routes = ["login","tenant","onboarding","dashboard","exceptions","manufacturing/orders","manufacturing/orders/SO-2026-0152","manufacturing/serialisation","manufacturing/palletising","manufacturing/packing-lists","manufacturing/load-plan","manufacturing/loading","manufacturing/receiving","quotations","bookings","shipments","shipments/new","shipments/TC-SEA-24121","consolidation","documents","customs","tracking","arrival","unloading","verification","scan","release","billing","reports","master-data","settings","portal/TC-SEA-24121"];
const routesRun = process.env.ROUTES ? process.env.ROUTES.split(",") : routes;
const b = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await ctx.addInitScript(() => { window.print = () => { window.__printed = (window.__printed || 0) + 1; }; });
const p = await ctx.newPage();
const dead = []; let total = 0;
async function prep(r) {
  await p.goto(BASE + r, { waitUntil: "networkidle" });
  await p.waitForTimeout(450);
  // pre-seed manufacturing state so downstream screens have pallets
}
// seed manufacturing data by real clicks
await prep("manufacturing/serialisation"); await p.getByRole("button",{name:"Generate labels"}).first().click(); await p.waitForTimeout(300); await p.click("text=Batch-verify all");
await prep("manufacturing/palletising"); await p.click("text=Auto-build all"); await p.waitForTimeout(300);
for (const r of routesRun) {
  await prep(r);
  const n = await p.locator("button:visible").count();
  for (let i = 0; i < Math.min(n, 45); i++) {
    await prep(r);
    const btn = p.locator("button:visible").nth(i);
    if (!(await btn.count())) continue;
    if (await btn.isDisabled()) continue;
    if ((await btn.getAttribute("aria-pressed")) === "true") continue; // already-selected toggle: a no-op by design
    const label = ((await btn.innerText().catch(() => "")) || (await btn.getAttribute("aria-label")) || "").trim().slice(0, 40);
    const before = { url: p.url(), html: await p.evaluate(() => document.body.innerHTML), pr: await p.evaluate(() => window.__printed || 0) };
    let dl = false; const h = () => { dl = true; }; p.on("download", h);
    total++;
    try { await btn.click({ timeout: 2000 }); } catch { p.off("download", h); continue; }
    await p.waitForTimeout(350);
    p.off("download", h);
    const after = { url: p.url(), html: await p.evaluate(() => document.body.innerHTML), pr: await p.evaluate(() => window.__printed || 0) };
    if (after.url === before.url && after.html === before.html && after.pr === before.pr && !dl) { dead.push(`${r} :: [${i}] ${label}`); console.log("DEAD", r, label); }
  }
  process.stdout.write(`${r} (${n}) `);
}
console.log(`\nClicked ${total} buttons; dead: ${dead.length}`); dead.forEach(d => console.log("DEAD", d));
if (!process.env.FLOWS) { await b.close(); process.exit(0); }
// key flow assertions
await prep("shipments/new"); for (let i = 0; i < 3; i++) await p.click("text=Continue"); await p.click("text=Create shipment"); await p.waitForURL(/shipments\/TC-SEA-/); console.log("OK wizard ->", p.url());
await prep("verification"); await p.click("text=Save damage report"); await p.click("text=Tap to sign"); await p.click("text=Sign off with exception"); await p.fill('[aria-label="Exception reason"]', "Crushed carton, claim raised with carrier"); await p.selectOption('[aria-label="Second approver"]', { index: 1 }); await p.click("text=Confirm sign-off with exception"); await p.waitForSelector("text=Verified with exception"); console.log("OK verification sign-off");
await b.close();
