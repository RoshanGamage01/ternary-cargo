import { test, expect } from "@playwright/test";
import { go } from "./helpers";

test("booklet PDF linked from Help, glossary and Incoterm help", async ({ page, request }) => {
  await go(page, "help?ch=incoterms");
  const l = page.getByRole("link", { name: /Beginner's booklet \(PDF, 6\.3 MB\)/ }).first();
  await expect(l).toHaveAttribute("href", "/booklet/Ternary-Cargo-Beginners-Booklet.pdf");
  await expect(page.getByRole("link", { name: /chapter 8, from page 27/ })).toHaveAttribute("href", /#page=27$/);
  expect((await request.get("/booklet/Ternary-Cargo-Beginners-Booklet.pdf")).headers()["content-type"]).toContain("pdf");
  await go(page, "glossary");
  await expect(page.getByRole("link", { name: /Beginner's booklet \(PDF, 6\.3 MB\)/ })).toBeVisible();
});

test("design 7: ? tooltip for other names, ⓘ Estimate label", async ({ page }) => {
  await go(page, "exceptions");
  const q = page.getByRole("button", { name: "Other names for this page" });
  await q.click(); await expect(page.getByText("Also called", { exact: true })).toBeVisible(); await expect(page.getByRole("dialog").getByText("Exceptions")).toBeVisible();
  await expect(page.getByText(/also called/)).toHaveCount(0);
  await go(page, "quotations");
  await expect(page.getByText("Prototype estimate", { exact: true })).toHaveCount(0);
});

test("design 10: badge, breadcrumb, active nav, KPI delta + sparkline", async ({ page }) => {
  await go(page, "dashboard");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Overview");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).not.toContainText("Good afternoon");
  const cur = page.locator("aside a[aria-current=page]"); await expect(cur).toHaveClass(/bg-primary\/10/);
  const badge = page.getByTestId("notif-badge"); await expect(badge).toBeVisible(); { const b = (await badge.boundingBox())!; const bell = (await page.getByRole("button", { name: /^Notifications/ }).boundingBox())!; expect(b.y).toBeLessThan(bell.y + 4); }
  await expect(page.getByTestId("kpi-delta").first()).toHaveText(/(up|down) \d+% on last week|no change on last week/);
  await expect(page.getByText("Sample trend").first()).toBeVisible();
  await expect(page.getByRole("img", { name: /sample trend, last 8 weeks/ }).first()).toBeVisible();
  await page.getByRole("link", { name: /^Active shipments \d+, (up|down) \d+% on last week.*sample trend.*Open$/ }).click(); await expect(page).toHaveURL(/\/shipments$/);
});

test("mobile bottom tab bar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await go(page, "shipments");
  const tabs = page.getByRole("navigation", { name: "Quick tabs" }); await expect(tabs).toBeVisible();
  await expect(tabs.getByRole("link", { name: "Shipments" })).toHaveAttribute("aria-current", "page");
  expect((await tabs.getByRole("link", { name: "Scan" }).boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await tabs.getByRole("link", { name: "Scan" }).click(); await expect(page).toHaveURL(/\/scan$/);
  await tabs.getByRole("button", { name: "Open full menu" }).click(); await expect(page.locator("aside")).toBeInViewport();
  await page.setViewportSize({ width: 1280, height: 800 }); await expect(tabs).toBeHidden();
});
