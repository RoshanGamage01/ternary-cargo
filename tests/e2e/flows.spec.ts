import { test, expect } from "@playwright/test";
import { go, shot, watchConsole } from "./helpers";

test("login: validation and success", async ({ page }) => {
  const errs = watchConsole(page);
  await go(page, "login"); await shot(page, "flow-login-01");
  await page.getByLabel("Work email").fill("not-an-email"); await page.getByRole("button", { name: /Sign in/ }).click();
  await expect(page.locator('p[role=alert]')).toContainText("valid work email");
  await page.getByLabel("Work email").fill("a@b.co"); await page.getByLabel("Password").fill("123");
  await page.getByRole("button", { name: /Sign in/ }).click(); await expect(page.locator('p[role=alert]')).toContainText("6 characters");
  await page.getByLabel("Password").fill("demo1234"); await page.getByRole("button", { name: /Sign in/ }).click();
  await page.waitForURL(/tenant/); await shot(page, "flow-login-02-tenant");
  await page.locator("a[href='/dashboard']").first().click(); await page.waitForURL(/dashboard/); await shot(page, "flow-login-03-dashboard");
  expect(errs).toEqual([]);
});

test("new-shipment wizard creates a shipment", async ({ page }) => {
  const errs = watchConsole(page);
  await go(page, "shipments/new");
  for (let i = 0; i < 3; i++) { await shot(page, `flow-wizard-0${i + 1}`); await page.getByRole("button", { name: "Continue" }).click(); }
  await shot(page, "flow-wizard-04-review");
  await page.getByRole("button", { name: /Create shipment/ }).click();
  await page.waitForURL(/shipments\/TC-/); await shot(page, "flow-wizard-05-created");
  expect(errs).toEqual([]);
});

test("manufacturing chain: SO -> serialisation -> pallet -> packing list -> load plan -> loading -> receiving", async ({ page }) => {
  test.setTimeout(120_000);
  const errs = watchConsole(page);
  await go(page, "manufacturing/orders"); await shot(page, "flow-mfg-01-orders");
  await page.getByRole("link", { name: "SO-2026-0152" }).first().click(); await page.waitForURL(/orders\/SO-2026-0152/); await shot(page, "flow-mfg-02-so-detail");
  await go(page, "manufacturing/serialisation");
  await page.getByRole("button", { name: "Generate labels" }).click();
  await page.getByRole("button", { name: "Batch-verify all" }).click(); await shot(page, "flow-mfg-03-serialisation");
  await go(page, "manufacturing/palletising");
  await page.getByRole("button", { name: "Auto-build all" }).click(); await page.waitForTimeout(300); await shot(page, "flow-mfg-04-palletising");
  await expect(page.getByText(/SSCC|pallet/i).first()).toBeVisible();
  await go(page, "manufacturing/packing-lists"); await shot(page, "flow-mfg-05-packing");
  await page.getByRole("button", { name: "Issue packing list" }).click(); await page.waitForTimeout(300); await shot(page, "flow-mfg-05b-packing-issued");
  await go(page, "manufacturing/load-plan"); await expect(page.locator("canvas").first()).toBeVisible();
  await page.getByRole("button", { name: "Save load plan" }).click(); await shot(page, "flow-mfg-06-loadplan");
  await go(page, "manufacturing/loading");
  for (let i = 0; i < 40; i++) { const b = page.getByRole("button", { name: "Simulate pallet scan" }); if (!(await b.isEnabled().catch(() => false))) break; await b.click(); }
  await page.getByLabel("Container number").fill("MSCU1234565"); await page.getByLabel("Seal number").fill("SL998877");
  await page.getByRole("button", { name: "Confirm loading" }).click(); await page.waitForTimeout(300); await shot(page, "flow-mfg-07-loading");
  await go(page, "manufacturing/receiving");
  for (let i = 0; i < 40; i++) { const b = page.getByRole("button", { name: "Simulate scan" }); if (!(await b.isEnabled().catch(() => false))) break; await b.click(); }
  await page.getByRole("button", { name: "Confirm receipt" }).click(); await page.waitForTimeout(300); await shot(page, "flow-mfg-08-receiving");
  expect(errs).toEqual([]);
});

test("unloading tally and verification sign-off with exception", async ({ page }) => {
  const errs = watchConsole(page);
  await go(page, "unloading"); await shot(page, "flow-tally-01");
  await page.getByRole("button", { name: "Tally remaining" }).click();
  await page.getByRole("button", { name: "Complete devanning" }).click(); await page.waitForTimeout(300); await shot(page, "flow-tally-02-complete");
  await go(page, "verification"); await shot(page, "flow-verify-01");
  await page.getByRole("button", { name: "Save damage report" }).click();
  await page.getByRole("button", { name: "Tap to sign" }).click();
  await page.getByRole("button", { name: "Sign off with exception" }).click();
  await page.getByLabel("Exception reason").fill("Crushed carton, claim raised with carrier");
  await page.getByLabel("Second approver").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Confirm sign-off with exception" }).click();
  await expect(page.getByText("Verified with exception").first()).toBeVisible(); await shot(page, "flow-verify-02-signed");
  expect(errs).toEqual([]);
});

test("3D load view renders and switches equipment", async ({ page }) => {
  const errs = watchConsole(page);
  await go(page, "manufacturing/load-plan");
  const c = page.locator("canvas").first(); await expect(c).toBeVisible();
  const box = await c.boundingBox(); expect(box!.width).toBeGreaterThan(200);
  for (const eq of ["20' GP", "40' HC", "LD3 / AKE ULD"]) { await page.getByRole("button", { name: eq }).click(); await page.waitForTimeout(400); }
  await shot(page, "flow-3d-01");
  expect(errs).toEqual([]);
});

test("customer portal shows shipment and download works", async ({ page }) => {
  const errs = watchConsole(page);
  await go(page, "portal/TC-SEA-24121"); await shot(page, "flow-portal-01");
  await expect(page.getByRole("heading", { name: "TC-SEA-24121" })).toBeVisible();
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 5000 }).catch(() => null), page.getByRole("button", { name: "Download" }).first().click()]);
  expect(dl, "Download button should produce a file").not.toBeNull();
  expect(errs).toEqual([]);
});
