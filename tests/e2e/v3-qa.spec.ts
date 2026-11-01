import { test, expect } from "@playwright/test";
import { go, watchConsole } from "./helpers";

test("QA-25: login has no pre-filled credentials and offers Try the demo", async ({ page }) => {
  const errs = watchConsole(page);
  await go(page, "login");
  await expect(page.getByLabel("Work email")).toHaveValue("");
  await expect(page.getByLabel("Password")).toHaveValue("");
  await page.getByRole("button", { name: /Try the demo/ }).click();
  await expect(page).toHaveURL(/\/tenant/);
  expect(errs).toEqual([]);
});

test("QA-16: bulk condition, weight, missing and un-tally on the tally", async ({ page }) => {
  await go(page, "unloading");
  await page.getByRole("checkbox", { name: /^Select (?!all)/ }).nth(7).check();
  await page.getByRole("checkbox", { name: /^Select (?!all)/ }).nth(8).check();
  await expect(page.getByRole("region", { name: "Bulk tally" })).toContainText("2 selected");
  await page.getByLabel("Bulk condition").selectOption("Wet");
  await page.getByRole("button", { name: "Apply condition" }).click();
  await expect(page.getByRole("combobox", { name: /^Condition / }).nth(8)).toHaveValue("Wet");
  await page.getByRole("checkbox", { name: /^Select (?!all)/ }).nth(9).check();
  await page.getByLabel("Bulk weight").fill("123.4");
  await page.getByRole("button", { name: "Apply weight" }).click();
  await expect(page.getByRole("textbox", { name: /^Actual kg / }).nth(9)).toHaveValue("123.4");
  await page.getByRole("checkbox", { name: /^Select (?!all)/ }).nth(10).check();
  await page.getByRole("button", { name: "Mark missing" }).click();
  await expect(page.getByRole("combobox", { name: /^Condition / }).nth(10)).toHaveValue("Missing");
  await page.getByRole("checkbox", { name: /^Select (?!all)/ }).nth(10).check();
  await page.getByRole("button", { name: "Un-tally" }).click();
  await expect(page.getByRole("combobox", { name: /^Condition / }).nth(10)).toBeDisabled();
});

test("QA-27: packing list weights and marks are editable before issue, locked after", async ({ page }) => {
  await go(page, "manufacturing/serialisation"); await page.getByRole("button", { name: "Generate labels" }).click();
  await go(page, "manufacturing/palletising"); await page.getByRole("button", { name: /Auto-build all/ }).click();
  await go(page, "manufacturing/packing-lists");
  const kg = page.getByRole("textbox", { name: /^Gross kg / }).first();
  await kg.fill("999"); await kg.blur();
  const marks = page.getByRole("textbox", { name: /^Marks / }).first();
  await marks.fill("ACME / FRAGILE"); await marks.blur();
  await go(page, "manufacturing/packing-lists");
  await expect(page.getByRole("textbox", { name: /^Gross kg / }).first()).toHaveValue("999");
  await expect(page.getByRole("textbox", { name: /^Marks / }).first()).toHaveValue("ACME / FRAGILE");
  await page.getByRole("button", { name: "Issue packing list" }).click();
  await expect(page.getByRole("textbox", { name: /^Gross kg / })).toHaveCount(0);
  await expect(page.getByText("ACME / FRAGILE")).toBeVisible();
});

test("QA-09 / N-01: one control sets detail level and job menu", async ({ page }) => {
  await go(page, "dashboard");
  const side = page.locator("aside");
  await page.getByRole("button", { name: "How much to show" }).click();
  await page.getByRole("group", { name: "Menu for my job" }).getByRole("button", { name: "Warehouse" }).click();
  await expect(side.getByRole("link", { name: "Unload & count" })).toBeVisible();
  await expect(side.getByRole("link", { name: "Label cartons" })).toHaveCount(0);
  await page.getByRole("group", { name: "Detail level" }).getByRole("button", { name: /Expert/ }).click();
  await expect(side.getByRole("link", { name: "Label cartons" })).toBeVisible();
  await go(page, "shipments"); await expect(page.getByText("Need a hand?")).toBeVisible();
  await page.getByRole("button", { name: "How much to show" }).click();
  await page.getByRole("group", { name: "Detail level" }).getByRole("button", { name: /Simple/ }).click();
  await expect(side.getByRole("link", { name: "Label cartons" })).toHaveCount(0);
  await expect(page.getByLabel("Menu shows")).toHaveCount(0);
});
