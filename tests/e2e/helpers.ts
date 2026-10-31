import { Page, expect } from "@playwright/test";
export const SHOTS = "/workspace/cargo/qa";
export const ROUTES = ["login","tenant","onboarding","dashboard","exceptions","manufacturing/orders","manufacturing/orders/SO-2026-0152","manufacturing/serialisation","manufacturing/palletising","manufacturing/packing-lists","manufacturing/load-plan","manufacturing/loading","manufacturing/receiving","quotations","bookings","shipments","shipments/new","shipments/TC-SEA-24121","consolidation","documents","customs","tracking","arrival","unloading","verification","scan","release","billing","reports","master-data","settings","portal/TC-SEA-24121"];
export function watchConsole(page: Page) {
  const errs: string[] = [];
  page.on("console", m => { if (m.type() === "error") errs.push(m.text().slice(0, 200)); });
  page.on("pageerror", e => errs.push("pageerror: " + e.message.slice(0, 200)));
  return errs;
}
export async function go(page: Page, r: string) { await page.goto("/" + r, { waitUntil: "networkidle" }); await page.waitForTimeout(300); }
export async function shot(page: Page, name: string, full = true) { await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: full }); }
export const slug = (r: string) => r.replace(/[\/]/g, "_");
