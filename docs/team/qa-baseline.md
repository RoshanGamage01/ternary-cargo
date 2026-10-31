# Ternary Cargo v2 – Baseline QA report

Date: Saturday 31 October 2026, 18:30 (Asia/Colombo, UTC+5:30)
Tester: Grok Bot (QA)
Build under test: the app served at http://localhost:3100, from `/workspace/cargo/prototype`. That folder is not a git checkout.

> **Commit caveat:** the brief names `main ba6f4f7`. The box has no copy of that commit. The only git checkout is `/workspace/cargo/src/ternary-cargo`, which is at `57b3327`, and `ba6f4f7` is not a known object there. I tested the build that is actually running and did not clone or pull anything. Confirm that `/workspace/cargo/prototype` matches ba6f4f7 before you treat this as the v2 baseline.

## Overall verdict: **FAIL**

All six core flows run from start to finish except one: the portal download produces no file. The build still fails the release gates:
- **Accessibility:** 30 of 32 pages have serious WCAG 2 AA violations.
- **Mobile:** 15 of 32 pages overflow at 390px, and the global header hides search, notifications and the account menu.
- **First-time user:** a non-technical user would stall on most manufacturing and warehouse screens because of unexplained jargon.

Console: no console errors or page errors on any page (32/32 pass).

### Issue counts by severity
| Severity | Count |
|---|---|
| Critical | 2 |
| High | 9 |
| Medium | 12 |
| Low | 5 |
| **Total** | **28** |

### Top fixes for v3
1. Make the app header and every list toolbar responsive. At 390px the search, alerts, avatar, "New …" buttons, CSV/PDF export and pagination currently sit off-screen (QA-01).
2. Fix colour contrast across the design system: muted grey text and the light-teal disabled buttons. This alone clears most axe failures (QA-02).
3. Add plain-language explanations to jargon such as SGTIN, SSCC, AI 01/21, HBL, devanning, Incoterm, FCL/LCL and ULD. Use an inline "What's this?" and a glossary (QA-05 to QA-09).
4. Show users what to do next and why a step is blocked. Examples: a disabled "Complete devanning" with no reason, the load planner showing all checks green while 222 units don't fit, and no "next step" link after loading (QA-03, QA-04, QA-10).
5. Give users control of their data: edit pallets and labels, edit or override tally rows in bulk, bulk actions on lists, real downloads in the portal, and editable signer and approver fields (QA-15 to QA-21).

## Automated results

Suite location: `/workspace/cargo/prototype/tests/e2e/` (`flows.spec.ts`, `pages.spec.ts`, `helpers.ts`) and `playwright.config.ts`. Nothing has been committed or pushed.
Raw output: `/workspace/cargo/qa/results.json` and `/workspace/cargo/qa/run.log`. Per-page axe dumps are in `/workspace/cargo/qa/axe/*.json`.

**Totals: 102 tests, 56 passed, 46 failed** (run time about 2.9 minutes, 2 workers, Chromium 1.64.1).

### Flow tests (5/6 pass)
| Test | Result |
|---|---|
| Login: validation messages, then success → workspace → dashboard | PASS |
| New-shipment wizard (4 steps) creates TC-… shipment | PASS |
| SO → serialisation → palletising → packing list issue → 3D load plan save → loading (container + seal) → receiving | PASS |
| Unloading tally → complete devanning → verification sign-off with exception + second approver | PASS |
| 3D load view renders canvas and switches 20' GP / 40' HC / LD3 | PASS |
| Customer portal shows shipment; Download produces a file | **FAIL**: the button only shows a "downloaded (demo)" toast and no file is produced |

### Per-page checks (32 routes)
| Check | Pass | Fail | Failing pages |
|---|---|---|---|
| No console or page errors | 32 | 0 | – |
| axe WCAG 2 A/AA, serious or critical | 2 (login, onboarding) | 30 | all others. color-contrast on 30 pages, link-in-text-block on 3 (palletising, packing lists, loading), scrollable-region-focusable on 1 (scan) |
| 390px: no horizontal overflow, controls on screen | 17 | 15 | dashboard, manufacturing/orders, quotations, bookings, shipments, shipments/TC-SEA-24121, consolidation, documents, customs, arrival, unloading, release, billing, master-data, settings |

### How to run
```bash
cd /workspace/cargo/prototype
# one-off, already done on the box: npm i -D @playwright/test@1.64.1 @axe-core/playwright
npx playwright test                       # full suite; reuses the server on :3100, otherwise starts `npm run dev -p 3100`
npx playwright test tests/e2e/flows.spec.ts   # key flows only
npx playwright test -g "mobile"           # 390px checks only
BASE_URL=http://localhost:3200 npx playwright test   # point at another build (e.g. v3)
```
Screenshots are written to `/workspace/cargo/qa/` (`flow-*.png`, `mobile-*.png`).
Note: `package.json` now lists the two new devDependencies. The old file is backed up at `/tmp/pkg.bak`.

## Findings

Severity guide:
- **Critical:** blocks a core task or excludes a group of users.
- **High:** a likely failure or abandonment.
- **Medium:** confusing, or there's a workaround.
- **Low:** polish.

Persona: a person with no IT knowledge and little cargo knowledge, walking through each flow for the first time.

### A. Automated / technical

**QA-01 · Header and list toolbars overflow on mobile, hiding key controls**: All flows · **Critical**
- Steps: open /dashboard (or any list page) at 390×844.
- Expected: everything fits the screen width; search, alerts and the account menu are reachable.
- Actual: the page scrolls sideways. Search, the dark-mode toggle, notifications, the avatar, "New shipment / New sales order", CSV/PDF and Prev/Next all sit beyond the right edge. This affects 15 pages.
- Screenshots: `qa/mobile-dashboard.png`, `qa/mobile-manufacturing_orders.png`, `qa/mobile-shipments.png`

**QA-02 · Colour contrast fails WCAG AA throughout**: All flows · **Critical**
- Steps: run axe on any page except login or onboarding.
- Expected: text contrast of at least 4.5:1.
- Actual: muted grey helper text, small badges and light-teal disabled buttons fail on 30 of 32 pages. Details are in `qa/axe/*.json`.
- Screenshot: `qa/flow-tally-01.png` (helper line and disabled "Complete devanning")

**QA-11 · Portal "Download" does not download anything**: Portal · **High**
- Steps: /portal/TC-SEA-24121 → Download.
- Expected: the document file downloads.
- Actual: a toast says "downloaded (demo)" and no file is produced. A customer would think the download worked.
- Screenshot: `qa/flow-portal-01.png`

**QA-12 · Links distinguished by colour only**: Palletising, Packing list, Loading · **Medium**
- Expected: links are underlined or otherwise distinct from body text.
- Actual: axe `link-in-text-block` fails, e.g. "Go to palletising" and "Build pallets".
- Screenshot: `qa/flow-mfg-05-packing.png`

**QA-13 · Scrollable region not keyboard-focusable**: Mobile scan · **Medium**
- Actual: axe `scrollable-region-focusable` fails on /scan.
- Screenshot: `qa/mobile-scan.png`

**QA-14 · Wide tables only scroll sideways on mobile**: Dashboard, Unloading · **Medium**
- Expected: on a phone, rows show as cards.
- Actual: the ETA watch and tally tables need sideways scrolling, and columns get cut off. The tally screen is the one most likely to be used on a handheld.
- Screenshots: `qa/mobile-dashboard.png`, `qa/mobile-unloading.png`

### B. Confusion points (first-time, non-technical user)

**QA-03 · Load planner shows all checks green while 222 of 242 units don't fit**: 3D load view · **High**
- Steps: /manufacturing/load-plan with the default three orders and 40' HC.
- Expected: a clear red "This load doesn't fit" message, with suggested actions (bigger container, split into 2 containers, remove an order) that can be applied in one click.
- Actual: four green ticks are followed by a small amber line, "222 units do not fit". "Units placed 20 / 242" sits next to a reassuring "Volume used 46%". Only one order's colour is visible, so the user can't tell what was dropped.
- Screenshot: `qa/flow-mfg-06-loadplan.png`

**QA-04 · "Complete devanning" disabled with no reason**: Unloading & tally · **High**
- Steps: /unloading with 7 of 12 packages tallied.
- Expected: a hint such as "Tally the 5 remaining packages to finish".
- Actual: a pale disabled button with no explanation. "Devanning" itself isn't explained.
- Screenshot: `qa/flow-tally-01.png`

**QA-05 · Serialisation screen is unexplained GS1 jargon**: Serialisation · **High**
- Expected: plain words, e.g. "Every carton gets its own barcode", with the technical detail available on request.
- Actual: the subtitle reads "GS1 SGTIN (GTIN + serial, AI 01 + 21) … SSCC (AI 00, 18 digits)" and the column is headed "SGTIN (01 GTIN · 21 SERIAL)". It isn't clear whether "Generate labels" prints anything, or what "Batch-verify all" means compared with "Simulate scan next".
- Screenshot: `qa/flow-mfg-03-serialisation.png`

**QA-06 · Wizard step 1 assumes trade knowledge**: New-shipment wizard · **High**
- Expected: the options are explained, e.g. "Full container (FCL) / Shared container (LCL)", with Incoterm help.
- Actual: Sea FCL, Sea LCL and Incoterm (EXW…DDP) have no help. "Link sales order (manufacturer)" is a blank dropdown, so the user can't tell whether it's required. Defaults are pre-filled silently, so the user can create a shipment without choosing anything.
- Screenshot: `qa/flow-wizard-01.png`

**QA-07 · Verification uses HBL / ASN / "second approver" without guidance**: Verification · **Medium**
- Actual: the subtitle reads "received cargo vs HBL and packing list (ASN)". It isn't clear whether "Tap to sign" signs for the clerk or the supervisor. "Sign off with exception" sits next to the normal sign-off with no explanation of when to use each.
- Screenshot: `qa/flow-verify-01.png`

**QA-08 · Palletising screen has no plain explanation of what auto-build does**: Palletising · **Medium**
- Actual: "Build one pallet" and "Auto-build all" are shown with "Suggested 11 | 1/layer × 10". The 22 identical barcode cards make the page very long, with no summary or next step.
- Screenshot: `qa/flow-mfg-04-palletising.png`

**QA-09 · Navigation has 28 items across 5 sections, all visible to every role**: All · **Medium**
- Actual: forwarder, manufacturer and warehouse items are mixed together. Similar names cause confusion: "Unloading confirmation" (manufacturing) vs "Unloading & tally" (warehouse), and "Load planner 3D" vs "Loading confirmation".
- Screenshot: `qa/flow-login-03-dashboard.png`

**QA-10 · No "what's next" after completing a step**: Manufacturing chain · **Medium**
- Steps: confirm loading; issue a packing list.
- Expected: a completion state with a "Next: …" button.
- Actual: only a toast that disappears. The loading page looks the same as before, with the "Confirm loading" button still active.
- Screenshot: `qa/flow-mfg-07-loading.png`, `qa/flow-mfg-05b-packing-issued.png`

**QA-22 · "Simulate …" buttons in production screens**: Serialisation, Loading, Receiving · **Medium**
- Actual: "Simulate scan next" and "Simulate pallet scan" sit beside real actions. A real user may think scanning is done for them.
- Screenshot: `qa/flow-mfg-03-serialisation.png`

**QA-23 · Load planner subtitle is developer language**: 3D load view · **Low**
- Actual: "Greedy heuristic, advisory only · saffron top = non-stackable · terracotta disc = centre of gravity".
- Screenshot: `qa/flow-mfg-06-loadplan.png`

**QA-24 · "Ask Ternary" and the search box don't say what they can do**: All · **Low**
- Screenshot: `qa/flow-login-03-dashboard.png`

**QA-25 · Login pre-fills a demo email and password**: Login · **Low**
- Screenshot: `qa/flow-login-01.png`

### C. Data control gaps

**QA-15 · Pallets can only be printed or deleted, not edited**: Palletising · **High**
- Expected: users can move cartons between pallets, change the carton count, and mark a pallet as mixed or non-stackable.
- Actual: each card has only Label and a trash can. The only parameter is "Cartons per pallet", which applies to every pallet.
- Screenshot: `qa/flow-mfg-04-palletising.png`

**QA-16 · Tally: no bulk condition or weight entry, and no way to undo a tally**: Unloading · **High**
- Actual: "Tally remaining" marks everything Good in one click with no confirmation. Packages can't be bulk-selected to set a condition, and the screen doesn't make clear how to un-tally a row or record a missing package.
- Screenshot: `qa/flow-tally-01.png`

**QA-17 · Load plan can't be adjusted by hand**: 3D load view · **High**
- Expected: users can drag or reorder units, pin a loading sequence, or override the container's dimensions or maximum payload.
- Actual: the plan is automatic only. The internal dimensions are labelled "verify per carrier" but can't be edited.
- Screenshot: `qa/flow-3d-01.png`

**QA-18 · Lists have no bulk actions**: Sales orders, Shipments, Bookings, Documents, Billing · **Medium**
- Actual: Edit and Delete work one row at a time. Rows can't be multi-selected for status changes, export or printing.
- Screenshot: `qa/flow-mfg-01-orders.png`

**QA-19 · Serial labels can't be edited, voided or reprinted individually**: Serialisation · **Medium**
- Actual: the table is read-only, and 228 rows are hidden behind "+228 more" with no search or paging.
- Screenshot: `qa/flow-mfg-03-serialisation.png`

**QA-20 · Signer and supervisor are fixed**: Verification · **Medium**
- Actual: "Tally clerk: S. Fernando" and "Supervisor: N. Perera" can't be changed. The damage photo placeholders can't be renamed.
- Screenshot: `qa/flow-verify-01.png`

**QA-21 · Wizard has no "save as draft", and fields like weight/volume are not visible until step 3**: New-shipment wizard · **Medium**
- Screenshot: `qa/flow-wizard-04-review.png`

**QA-26 · Container and seal numbers are not check-digit validated**: Loading · **High**
- Expected: an ISO 6346 check-digit warning.
- Actual: any text is accepted. The test used "MSCU1234565" and it was not challenged.
- Screenshot: `qa/flow-mfg-07-loading.png`

**QA-27 · Packing list: weights and marks can't be overridden before issue**: Packing list · **Low**
- Screenshot: `qa/flow-mfg-05-packing.png`

**QA-28 · Portal: customer can't filter or choose documents in bulk**: Portal · **Low**
- Screenshot: `qa/flow-portal-01.png`

## Notes and limits
- This is a UI-only prototype with demo data. Some data-control items may be intentional for the prototype, but v3 should close them.
- An older test, `tests/dead-buttons.mjs`, already exists in the prototype. It was not rerun as part of this suite.
- Severities for confusion points are based on my judgement from walking through the screens, not on user-research data.
