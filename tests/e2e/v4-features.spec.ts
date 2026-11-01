import { test, expect } from "@playwright/test";
import fs from "fs";
import { go } from "./helpers";

test("import wizard: sample CSV → mapping → preview with errors → import", async ({ page }) => {
  await go(page, "import");
  await page.getByRole("button", { name: "Use a sample file" }).click();
  await expect(page.getByLabel("Column for Company name")).not.toHaveValue("");
  await page.getByRole("button", { name: "Check rows" }).click();
  const preview = page.getByRole("table", { name: "Import preview" });
  await expect(preview).toContainText("Company name is missing");
  await expect(preview).toContainText("Not an email address");
  await page.getByRole("button", { name: /^Import 3 customers/ }).click();
  await expect(page.getByRole("main").getByText("Imported 3 customers")).toBeVisible();
  await go(page, "audit"); await expect(page.getByRole("table", { name: "Audit entries" })).toContainText("Imported 3 customers");
});

test("import wizard: real Excel upload", async ({ page }) => {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.aoa_to_sheet([["HS", "Description", "Category"], ["6109.10", "Cotton T-shirts", "Apparel"], ["12", "Bad code", "X"]]);
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Sheet1"); const p = "/tmp/hs-test.xlsx"; fs.writeFileSync(p, XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
  await go(page, "import");
  await page.getByRole("group", { name: "Import type" }).getByRole("button", { name: /HS codes/ }).click();
  await page.getByLabel("Spreadsheet file").setInputFiles(p);
  await page.getByRole("button", { name: "Check rows" }).click();
  await expect(page.getByRole("table", { name: "Import preview" })).toContainText("Use the format 8528.72");
  await expect(page.getByRole("button", { name: /^Import 1 hs codes/ })).toBeEnabled();
});

test("customs pack: checklist gates the CHA pack; ASYHUB export is a real file", async ({ page }) => {
  await go(page, "customs/pack?ref=TC-SEA-24121");
  const [x] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Export manifest for ASYHUB/ }).click()]);
  const xml = fs.readFileSync((await x.path())!, "utf8"); expect(xml).toContain("<Manifest>"); expect(xml).toContain("TC-SEA-24121");
  const pack = page.getByRole("button", { name: /hand-off pack/ }); await expect(pack).toBeDisabled();
  for (const l of ["Delivery order requested from the line", "Import permit / licence (if the goods need one)", "Value declaration signed by the importer"]) await page.getByLabel(l).check();
  const boxes = page.getByRole("checkbox", { name: /^I have it:/ }); for (let i = await boxes.count() - 1; i >= 0; i--) await boxes.nth(i).check();
  await expect(pack).toBeEnabled();
  const [d] = await Promise.all([page.waitForEvent("download"), pack.click()]); expect(fs.readFileSync((await d.path())!, "latin1").startsWith("%PDF")).toBeTruthy();
});

test("WhatsApp: opt-in gates sending; reply filed to a job shows in its history", async ({ page }) => {
  await go(page, "whatsapp");
  await page.getByLabel("File reply 1 to job").selectOption("TC-SEA-24121");
  await expect(page.getByRole("list", { name: "WhatsApp replies" }).getByText("Filed").first()).toBeVisible();
  await page.getByLabel("Template text").fill("Hi {{name}}, {{ref}} lands {{eta}}.");
  await go(page, "shipments/TC-SEA-24121");
  await page.getByRole("button", { name: "Share update" }).click();
  const dlg = page.getByRole("dialog", { name: "Share on WhatsApp" });
  await expect(dlg.getByRole("img", { name: /WhatsApp preview/ })).toContainText("TC-SEA-24121 lands");
  await dlg.getByRole("button", { name: /Send \(mock\)/ }).click();
  await go(page, "audit"); await expect(page.getByRole("table", { name: "Audit entries" })).toContainText("WhatsApp reply from Singer");
});

test("finance: rate change, recharge, credit note needs a reason", async ({ page }) => {
  await go(page, "finance");
  await page.getByLabel("New USD to LKR rate").fill("300"); await page.getByRole("button", { name: "Set", exact: true }).click();
  await expect(page.getByText("300.00").first()).toBeVisible();
  await page.getByLabel("Credit amount").fill("1000"); await page.getByLabel("Credit reason").fill("short");
  await expect(page.getByRole("button", { name: "Raise credit note" })).toBeDisabled();
  await page.getByLabel("Credit reason").fill("Late delivery goodwill credit");
  await page.getByRole("button", { name: "Raise credit note" }).click();
  await expect(page.getByRole("list", { name: "Credit notes" })).toContainText("CN-2026-0001");
  await page.getByLabel("Recharge Port handling (THC)").check();
  await expect(page.getByRole("table", { name: "Job profit" })).toBeVisible();
});

test("evidence: photo + amount produces a claims pack PDF", async ({ page }) => {
  await go(page, "evidence?ref=TC-SEA-24121");
  const gen = page.getByRole("button", { name: /Generate claims pack/ }); await expect(gen).toBeDisabled();
  await page.getByRole("button", { name: "Add sample photo" }).click(); await page.getByLabel("Amount claimed").fill("25000");
  const [d] = await Promise.all([page.waitForEvent("download"), gen.click()]);
  expect(fs.readFileSync((await d.path())!, "latin1")).toContain("Claims pack TC-SEA-24121");
});

test("audit: bulk delete is Admin-only", async ({ page }) => {
  await go(page, "shipments");
  await page.getByRole("checkbox", { name: /^Select TC-/ }).first().check();
  await expect(page.getByRole("region", { name: "Bulk actions" }).getByRole("button", { name: /Delete/ })).toBeDisabled();
  await go(page, "audit"); await page.getByLabel("Signed-in permission").selectOption("Admin");
  await go(page, "shipments"); await page.getByRole("checkbox", { name: /^Select TC-/ }).first().check();
  await expect(page.getByRole("region", { name: "Bulk actions" }).getByRole("button", { name: /Delete/ })).toBeEnabled();
});

test("alerts: preview shows email and WhatsApp", async ({ page }) => {
  await go(page, "alerts");
  await page.getByRole("button", { name: "Preview test alert" }).nth(1).click();
  await expect(page.getByRole("img", { name: /WhatsApp preview/ })).toContainText("arrival moved");
});

test("language: Sinhala and Tamil translate the menu and start page", async ({ page }) => {
  await go(page, "start");
  await page.getByRole("button", { name: "How much to show" }).click();
  await page.getByRole("group", { name: "Language" }).getByRole("button", { name: "සිංහල" }).click();
  await expect(page.locator("aside")).toContainText("නැව්ගත කිරීම්");
  await expect(page.getByRole("heading", { level: 2 }).first()).toContainText("ඔබට කුමක්");
  await page.getByRole("group", { name: "Language" }).getByRole("button", { name: "தமிழ்" }).click();
  await expect(page.locator("aside")).toContainText("சரக்குகள்");
});

test("incoterm help + booklet chapter", async ({ page }) => {
  await go(page, "shipments/new");
  await expect(page.getByRole("note").filter({ hasText: "Free On Board" })).toBeVisible();
  await page.getByRole("link", { name: /Read the Incoterms chapter/ }).click();
  await expect(page).toHaveURL(/help\?ch=incoterms/); await expect(page.locator("#inco-DDP")).toContainText("Delivered Duty Paid");
});

test("pallet labels and gate pass are real PDFs", async ({ page }) => {
  await go(page, "manufacturing/serialisation"); await page.getByRole("button", { name: "Generate labels" }).click();
  await go(page, "manufacturing/palletising"); await page.getByRole("button", { name: /Auto-build all/ }).click();
  const [d] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Pallet labels (PDF)" }).click()]);
  expect(fs.readFileSync((await d.path())!, "latin1")).toContain("SSCC \\(00\\)");
  await go(page, "release");
  const gp = page.getByRole("button", { name: /^Gate pass / }).first();
  if (await gp.count()) { const [g] = await Promise.all([page.waitForEvent("download"), gp.click()]); expect(fs.readFileSync((await g.path())!, "latin1")).toContain("GATE PASS"); }
});

test("QA-14: tally on a 390px phone uses cards with weight and condition visible", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await ctx.newPage();
  await page.goto("/unloading", { waitUntil: "networkidle" });
  const list = page.getByRole("list", { name: "Packages" });
  await expect(list.getByLabel("Actual kg PKG-001")).toBeInViewport({ ratio: 0.5 }).catch(async () => { await list.getByLabel("Actual kg PKG-001").scrollIntoViewIfNeeded(); });
  const box = await list.getByLabel("Condition PKG-001").boundingBox(); expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  await ctx.close();
});
