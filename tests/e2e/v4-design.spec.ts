import { test, expect } from "@playwright/test";
import { go } from "./helpers";

test("QA-17: reorder, pin and drag-swap units with live re-validation; load scrubber", async ({ page }) => {
  await go(page, "manufacturing/load-plan?dim=2D");
  const status = page.locator("[aria-label='Arrange the load']").getByRole("status");
  await expect(status).not.toContainText("Re-checked");
  await page.getByRole("button", { name: /^Load SO-2026-0153 earlier/ }).click();
  await expect(status).toContainText("Re-checked after your 1 change");
  const units = page.locator("svg[aria-label='From above (floor plan)'] rect[data-unit]");
  await units.first().click({ force: true });
  await page.getByRole("button", { name: "Pin to door (load last)" }).click();
  await expect(page.getByText("Pinned to the door")).toBeVisible();
  await expect(status).toContainText("2 changes");
  await units.nth(1).dispatchEvent("pointerdown"); await units.last().dispatchEvent("pointerup");
  await expect(status).toContainText("3 changes");
  await page.getByLabel("Load order step").fill("5");
  await expect(page.getByText(/^5 \/ \d+ units loaded/)).toBeVisible();
  await expect(units).toHaveCount(5);
  await status.getByRole("button", { name: "Back to automatic" }).click();
  await expect(status).not.toContainText("Re-checked");
});

test("command menu: actions, records, shortcuts", async ({ page }) => {
  await go(page, "dashboard");
  await expect(page.getByRole("main")).toBeVisible(); await page.waitForTimeout(800); await page.keyboard.press("Control+k");
  const input = page.getByRole("combobox", { name: "Command menu" }); await expect(input).toBeVisible();
  await input.fill("TC-SEA-24121"); await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/TC-SEA-24121/);
  await page.locator("body").click({ position: { x: 5, y: 300 } });
  await page.keyboard.press("?"); await expect(page.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeVisible();
  await page.getByRole("dialog", { name: "Keyboard shortcuts" }).getByRole("button", { name: "Close" }).click();
  await page.keyboard.press("g"); await page.keyboard.press("s"); await expect(page).toHaveURL(/\/shipments$/);
  await page.keyboard.press("/"); await page.getByRole("combobox", { name: "Command menu" }).fill("switch to expert"); await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "How much to show" }).click();
  await expect(page.getByRole("group", { name: "Detail level" }).getByRole("button", { name: /Expert/ })).toHaveAttribute("aria-pressed", "true");
});

test("dashboard pipeline bar is one proportional bar", async ({ page }) => {
  await go(page, "dashboard");
  const bar = page.getByRole("list", { name: "Pipeline bar" });
  await expect(bar.getByRole("listitem").first()).toBeVisible();
  const h = (await bar.boundingBox())!.height; expect(h).toBeLessThanOrEqual(40);
});

test("record opens read-first; click a field to edit with undo", async ({ page }) => {
  await go(page, "bookings");
  await page.getByRole("button", { name: /^Open BK-/ }).first().click();
  const dl = page.getByRole("definition").first(); await expect(dl).toBeVisible();
  const btn = page.getByRole("button", { name: /^Edit Vessel/ }).first();
  await expect(btn).toBeVisible(); { await btn.click(); const ip = page.getByLabel(/^Edit Vessel/); await ip.fill("MSC ANNA / 612E"); await ip.press("Tab");
    await expect(page.getByRole("button", { name: "Edit Vessel / flight: MSC ANNA / 612E" })).toBeVisible();
    await page.getByRole("button", { name: "Undo" }).click(); await expect(page.getByRole("button", { name: "Edit Vessel / flight: MSC ANNA / 612E" })).toHaveCount(0); }
  await page.getByRole("button", { name: "Edit all" }).click(); await expect(page.getByTestId("sheet-save")).toBeVisible();
});
