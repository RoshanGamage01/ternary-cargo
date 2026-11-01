import { test, expect } from "@playwright/test";
import { go } from "./helpers";

async function readyToLoad(page: import("@playwright/test").Page) {
  await go(page, "manufacturing/serialisation"); await page.getByRole("button", { name: "Generate labels" }).click();
  await go(page, "manufacturing/palletising"); await page.getByRole("button", { name: /Auto-build all/ }).click();
  await go(page, "manufacturing/loading");
  for (let i = 0; i < 40; i++) { const b = page.getByRole("button", { name: "Simulate pallet scan" }); if (!(await b.isEnabled().catch(() => false))) break; await b.click(); }
}

test("N-03: seal number must match a format; N-02: no duplicate confirm, next step visible", async ({ page }) => {
  await readyToLoad(page);
  await page.getByLabel("Container number").fill("MSKU7741206");
  await page.getByLabel("Seal number").fill("SL1");
  await expect(page.locator("#seal-hint")).toContainText("Not a seal format");
  await page.getByRole("button", { name: "Confirm loading" }).click();
  await expect(page.getByText("Seal number looks wrong")).toBeVisible();
  await page.getByLabel("Seal number").fill("ML-5521093");
  await page.getByRole("button", { name: "Confirm loading" }).click();
  const done = page.getByRole("button", { name: "Loading confirmed ✓" });
  await expect(done).toBeDisabled();
  const next = page.locator("#next-step");
  await expect(next).toBeFocused();
  // the toast must not cover the next-step link
  await page.waitForTimeout(400);
  const nb = await next.boundingBox(); const toasts = page.locator("[data-sonner-toast]");
  for (let i = 0; i < await toasts.count(); i++) { const t = await toasts.nth(i).boundingBox(); if (nb && t) expect(t.x + t.width < nb.x || t.x > nb.x + nb.width || t.y + t.height < nb.y || t.y > nb.y + nb.height).toBeTruthy(); }
});

test("ISO 6346: demo container numbers pass the check digit", async ({ page }) => {
  await readyToLoad(page);
  await expect(page.getByLabel("Container number")).toHaveValue(/MSKU 8812006/);
  await expect(page.getByText("Check digit looks wrong")).toHaveCount(0);
  await page.getByLabel("Container number").fill("MSKU7741203");
  await expect(page.getByText(/last digit should be 6/)).toBeVisible();
  await go(page, "unloading");
  await expect(page.getByText("MSKU 774120 6").first()).toBeVisible();
});

test("QA-22: demo scanner buttons are fenced off from real actions", async ({ page }) => {
  await go(page, "manufacturing/loading");
  await expect(page.getByRole("group", { name: "Demo only" }).getByRole("button", { name: /Simulate pallet scan/ })).toBeVisible();
});

test("Design 1/7/10: status chip edits with undo, IDs don't wrap, British dates", async ({ page }) => {
  await go(page, "shipments");
  const chip = page.getByRole("button", { name: /^Change status of TC-/ }).first();
  const before = (await chip.getAttribute("aria-label"))!.split(": ")[1];
  await chip.click();
  const target = before === "Delivered" ? "Booked" : "Delivered";
  await page.getByRole("button", { name: target, exact: true }).click();
  await expect(page.getByRole("button", { name: /^Change status of TC-/ }).first()).toHaveAttribute("aria-label", new RegExp(target));
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("button", { name: /^Change status of TC-/ }).first()).toHaveAttribute("aria-label", new RegExp(before));
  const ref = page.locator("tbody tr").first().locator("a, button").filter({ hasText: /^TC-/ }).first();
  const h = (await ref.boundingBox())!.height; expect(h).toBeLessThan(24);
  expect(await page.locator("tbody").innerText()).not.toMatch(/\b20\d\d-\d\d-\d\d\b/);
  const rh = (await page.locator("tbody tr").nth(1).boundingBox())!.height; expect(rh).toBeLessThanOrEqual(45); // 12+ rows fit in a 768px laptop viewport
});
