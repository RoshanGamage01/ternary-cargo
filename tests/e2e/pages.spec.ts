import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { ROUTES, go, shot, slug, watchConsole } from "./helpers";
import fs from "fs";

for (const r of ROUTES) {
  test.describe(`page ${r}`, () => {
    test(`a11y (axe, serious/critical)`, async ({ page }) => {
      await go(page, r);
      const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      const bad = res.violations.filter(v => v.impact === "serious" || v.impact === "critical");
      fs.mkdirSync("/workspace/cargo/qa/axe", { recursive: true });
      fs.writeFileSync(`/workspace/cargo/qa/axe/${slug(r)}.json`, JSON.stringify(res.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, help: v.help, eg: v.nodes[0]?.target })), null, 1));
      expect(bad.map(v => `${v.id}(${v.nodes.length})`)).toEqual([]);
    });
    test(`no console errors`, async ({ page }) => {
      const errs = watchConsole(page); await go(page, r); await page.waitForTimeout(500);
      expect(errs).toEqual([]);
    });
    test(`mobile 390px: no horizontal overflow, controls reachable`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 }); await go(page, r);
      await shot(page, `mobile-${slug(r)}`, false);
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      const off = await page.$$eval("button, a, input, select, textarea", els => els.filter(e => { const s = getComputedStyle(e); if (s.visibility === "hidden" || (e as HTMLElement).offsetParent === null) return false;
        const b = e.getBoundingClientRect(); if (b.width === 0) return false;
        let p = e.parentElement; while (p) { const o = getComputedStyle(p).overflowX; if (o === "auto" || o === "scroll") return false; p = p.parentElement; }
        return b.right > window.innerWidth + 1 || b.left < -1; }).map(e => ((e as HTMLElement).innerText || e.getAttribute("aria-label") || e.tagName).trim().slice(0, 30)));
      expect.soft(off, "controls outside viewport").toEqual([]);
      expect(sw, "page scrollWidth").toBeLessThanOrEqual(391);
    });
  });
}
