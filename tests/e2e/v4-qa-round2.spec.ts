import { test, expect, Page } from "@playwright/test";
import { go } from "./helpers";
const signInAs = async (page: Page, role: string) => { await go(page, "audit"); await page.getByLabel("Signed-in permission").selectOption(role); };
const colombo = (d: Date) => { const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(d).map(x => [x.type, x.value])); return `${p.day} ${p.month} ${p.year} ${p.hour}:${p.minute}`; };

test("V4-15 + V4-17: audit times are Asia/Colombo with the zone, entity names are friendly", async ({ page }) => {
  await signInAs(page, "Admin"); await go(page, "release");
  const t0 = new Date();
  await page.getByRole("button", { name: "Delete DO-2026-0429" }).click(); await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
  await go(page, "audit");
  await expect(page.getByRole("columnheader", { name: /When \(Asia\/Colombo, UTC\+5:30\)/ })).toBeVisible();
  await page.getByLabel("Search audit log").fill("DO-2026-0429");
  const row = page.getByRole("row", { name: /Deleted delivery order DO-2026-0429/ }); await expect(row).toBeVisible();
  await expect(page.getByText(/deliveryOrders/)).toHaveCount(0);
  const when = await row.getByRole("cell").first().innerText();
  const ok = [colombo(t0), colombo(new Date(t0.getTime() + 60000))].some(c => when.includes(c)); expect(ok, `${when} vs ${colombo(t0)}`).toBe(true);
  expect(when).toContain("UTC+5:30");
  // seeded entry stored as 2026-10-22T04:42:00Z shows as 10:12 Colombo
  await page.getByLabel("Search audit log").fill("BK-2026-0611 confirmed"); await expect(page.getByRole("row", { name: /22 Oct 2026 10:12/ })).toBeVisible();
});

test("V4-16: Reset demo data is Admin-only and needs typed confirmation; it is logged", async ({ page }) => {
  for (const role of ["Viewer", "Operations manager"]) { await signInAs(page, role); await go(page, "settings?tab=Demo%20data");
    await expect(page.getByRole("button", { name: "Reset demo data" })).toBeDisabled(); await expect(page.locator("#reset-why")).toContainText(`signed in as ${role}`); }
  await signInAs(page, "Admin"); await go(page, "shipments");
  await page.getByRole("button", { name: "Delete TC-SEA-24118" }).click(); await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
  await go(page, "settings?tab=Demo%20data"); await page.getByRole("button", { name: "Reset demo data" }).click();
  const dlg = page.getByRole("dialog"); const go_ = dlg.getByRole("button", { name: "Reset", exact: true });
  await expect(go_).toBeDisabled(); await dlg.getByLabel("Type RESET to confirm").fill("reset"); await expect(go_).toBeEnabled(); await go_.click();
  await go(page, "shipments"); await expect(page.getByRole("button", { name: "Delete TC-SEA-24118" })).toBeVisible();
  await go(page, "audit"); await expect(page.getByText("Demo data reset to the original sample")).toBeVisible();
});

test("V4-10: bulk bar stays on screen on a phone after ticking a low row", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await ctx.newPage();
  await page.goto("/shipments", { waitUntil: "networkidle" });
  const boxes = page.getByRole("checkbox", { name: /^Select (?!all)/ }); const last = boxes.last(); await last.scrollIntoViewIfNeeded(); await last.check();
  const bar = page.getByTestId("bulk-bar"); await expect(bar).toBeInViewport();
  const b = (await bar.boundingBox())!; const tabs = (await page.getByRole("navigation", { name: "Quick tabs" }).boundingBox())!;
  expect(b.y + b.height).toBeLessThanOrEqual(tabs.y + 1);
  await ctx.close();
});

test("V4-18: no trend on date KPIs; carton caption says SGTIN", async ({ page }) => {
  await go(page, "dashboard"); await page.getByRole("button", { name: "Exporter", exact: true }).or(page.getByRole("tab", { name: "Exporter" })).first().click();
  const cut = page.getByRole("link", { name: /^Next cut-off/ }); await expect(cut).toBeVisible();
  await expect(cut).not.toHaveAccessibleName(/on last week|sample trend/); await expect(cut.getByTestId("kpi-delta")).toHaveCount(0); await expect(cut.getByRole("img")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /^Cartons serialised/ })).toContainText("GS1 SGTIN");
  await expect(page.getByText("GS1 SSCC")).toHaveCount(0);
});

test("V4-19: Ctrl+K then Esc returns focus to the element focused before", async ({ page }) => {
  await go(page, "shipments"); await page.waitForTimeout(800);
  const s = page.getByLabel("Search shipments").or(page.getByRole("searchbox")).first();
  const link = page.locator("aside a[href='/dashboard']"); await link.focus(); await expect(link).toBeFocused();
  await page.keyboard.press("Control+k"); await expect(page.getByRole("dialog", { name: "Command menu" })).toBeVisible();
  await page.keyboard.press("Escape"); await expect(page.getByRole("dialog", { name: "Command menu" })).toBeHidden();
  await expect(link).toBeFocused();
  void s;
});

test("V4-11: booklet links show the file size", async ({ page }) => {
  await go(page, "help?ch=incoterms");
  await expect(page.getByRole("link", { name: "📘 Beginner's booklet (PDF, 6.3 MB)" })).toBeVisible();
  await expect(page.getByText("Large file (6.3 MB): best on Wi-Fi.")).toBeVisible();
  await go(page, "glossary"); await expect(page.getByRole("link", { name: /Beginner's booklet \(PDF, 6\.3 MB\)/ })).toBeVisible();
  await go(page, "shipments/new"); await expect(page.getByRole("link", { name: /Booklet chapter 8 \(PDF, p27, 6\.3 MB\)/ }).first()).toBeAttached();
});
