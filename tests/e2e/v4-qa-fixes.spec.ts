import { test, expect, Page } from "@playwright/test";
import fs from "fs";
import { go } from "./helpers";

const signInAs = async (page: Page, role: string) => { await go(page, "audit"); await page.getByLabel("Signed-in permission").selectOption(role); };

test("V4-01: single delete is Admin-only, the same as bulk", async ({ page }) => {
  for (const role of ["Viewer", "Tally clerk", "Operations manager"]) {
    await signInAs(page, role); await go(page, "shipments");
    const del = page.getByRole("button", { name: "Delete TC-SEA-24118" });
    await expect(del).toBeDisabled(); await expect(del).toHaveAttribute("title", new RegExp(`Only Admins can delete \\(you are signed in as ${role}\\)`));
  }
  await signInAs(page, "Admin"); await go(page, "shipments");
  const rows = page.locator("tbody tr"); const n = await rows.count();
  await page.getByRole("button", { name: "Delete TC-SEA-24118" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
  await expect(rows).toHaveCount(n - 1); await expect(page.getByRole("button", { name: "Delete TC-SEA-24118" })).toHaveCount(0);
});

test("V4-02: deletes and overrides are written to the audit log with who and role", async ({ page }) => {
  await signInAs(page, "Admin"); await go(page, "shipments");
  await page.getByRole("button", { name: "Delete TC-SEA-24118" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
  await go(page, "bookings"); await page.getByRole("button", { name: /^Open BK-/ }).first().click();
  await page.getByRole("button", { name: /^Override/ }).click();
  const sheet = page.getByRole("dialog"); await sheet.getByLabel("Override field").selectOption({ index: 1 });
  await sheet.getByLabel("Override value").fill("OVR-VALUE-1"); await sheet.getByLabel("Override reason").fill("Carrier confirmed by phone call");
  await sheet.getByRole("button", { name: "Apply override" }).click(); await page.keyboard.press("Escape");
  await go(page, "manufacturing/load-plan"); await page.getByRole("button", { name: /Adjust container size/ }).click();
  await page.getByLabel("Override payload").fill("26000"); await page.getByLabel("Override reason").fill("Carrier spec sheet MSKU"); await page.waitForTimeout(1700);
  await go(page, "audit");
  const log = page.getByRole("main");
  await page.getByLabel("Search audit log").fill("Deleted shipments record TC-SEA-24118"); await expect(log.getByText("Deleted shipments record TC-SEA-24118")).toBeVisible(); await expect(log.getByText(/Nimal Perera \(Admin\)/).first()).toBeVisible();
  await page.getByLabel("Search audit log").fill("OVR-VALUE-1"); await expect(log.getByText(/Override .*OVR-VALUE-1.*Carrier confirmed by phone call/)).toBeVisible();
  await page.getByLabel("Search audit log").fill("Override container"); await expect(log.getByText(/Override container .*payload=26000.*Carrier spec sheet MSKU/)).toBeVisible();
  await page.getByLabel("Search audit log").fill(""); await page.getByLabel("Audit source").selectOption("delete"); await expect(log.getByText("Deleted shipments record TC-SEA-24118")).toBeVisible();
});

test("V4-03: pallet labels are A6 GS1-128 labels, one per pallet, SSCC with a single (00)", async ({ page }) => {
  await go(page, "manufacturing/serialisation"); await page.getByRole("button", { name: "Generate labels" }).click();
  await go(page, "manufacturing/palletising"); await page.getByRole("button", { name: /Auto-build all/ }).click();
  const [d] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Pallet labels (PDF)" }).click()]);
  const buf = fs.readFileSync((await d.path())!); const pdf = buf.toString("latin1");
  const pages = (pdf.match(/\/Type \/Page /g) ?? []).length; expect(pages).toBeGreaterThan(1);
  expect((pdf.match(/\/Subtype \/Image/g) ?? []).length).toBe(pages);
  expect(pdf).not.toMatch(/\(00\)\s*\\?\(00/); expect(pdf).not.toContain("\\(00\\) \\(00\\)");
  const ssccs = [...pdf.matchAll(/\\\(00\\\) (\d{18})\)/g)].map(m => m[1]); expect(ssccs.length).toBe(pages);
  for (const s of ssccs) { let sum = 0; for (let i = 0; i < 17; i++) sum += +s[16 - i] * (i % 2 === 0 ? 3 : 1); expect((10 - (sum % 10)) % 10).toBe(+s[17]); }
  expect(pdf).toContain("SHIP TO"); expect(pdf).toContain("GROSS WEIGHT");
  fs.writeFileSync(test.info().outputPath("pallet-labels.pdf"), buf);
});

test("V4-08: Ctrl+K menu is a dialog that traps focus and returns it", async ({ page }) => {
  await go(page, "dashboard"); await page.waitForTimeout(800);
  const trigger = page.getByRole("button", { name: "Search pages, shipments, orders and pallets" }); await trigger.click();
  const dlg = page.getByRole("dialog", { name: "Command menu" }); await expect(dlg).toBeVisible();
  for (let i = 0; i < 6; i++) { await page.keyboard.press("Tab"); expect(await dlg.evaluate(d => d.contains(document.activeElement))).toBe(true); }
  await page.keyboard.press("Escape"); await expect(dlg).toBeHidden(); await expect(trigger).toBeFocused();
});

test("V4-09: Start banner is compact at 390px and task cards start on the first screen", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await ctx.newPage();
  await page.goto("/start", { waitUntil: "networkidle" });
  const b = page.getByTestId("guide-banner"); expect((await b.boundingBox())!.height).toBeLessThanOrEqual(120);
  await page.getByRole("button", { name: /^See \d steps$/ }).click(); await expect(b.getByRole("listitem").first()).toBeVisible();
  expect((await page.getByRole("heading", { name: "What do you want to do?" }).boundingBox())!.y).toBeLessThan(844 - 56 - 60);
  await ctx.close();
});

test("V4-13: claims pack PDF embeds the photos", async ({ page }) => {
  await go(page, "evidence?ref=TC-SEA-24121");
  await page.getByRole("button", { name: "Add sample photo" }).click(); await page.getByRole("button", { name: "Add sample photo" }).click();
  await page.getByLabel(/Amount/).fill("25000");
  const [d] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Generate claims pack/ }).click()]);
  const pdf = fs.readFileSync((await d.path())!).toString("latin1");
  expect((pdf.match(/\/Subtype \/Image/g) ?? []).length).toBe(2); expect(pdf).toContain("Evidence \\(2 photos\\)"); expect(pdf).toContain("Photo 2:");
});

test("V4-07/V4-06: language switch is labelled beta; KPI links go to real pages", async ({ page }) => {
  await go(page, "dashboard"); await page.getByRole("button", { name: "How much to show" }).click();
  await expect(page.getByRole("group", { name: "Menu language (beta)" })).toBeVisible(); await expect(page.locator("#lang-note")).toContainText("Most page text is still in English");
  await page.keyboard.press("Escape"); await page.getByRole("tab", { name: "Exporter" }).or(page.getByRole("button", { name: "Exporter" })).first().click();
  await page.getByRole("link", { name: /^Cartons serialised/ }).click(); await expect(page).toHaveURL(/manufacturing\/serialisation$/);
});
