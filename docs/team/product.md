# Ternary Cargo: product note (Product Lead, 31 Oct 2026)

Sources read: `research.md` (rounds 1–2), `product-vision.md` (round 2), `screens/` (37 screens, see `screens/index.md`), and the text of `Ternary-Cargo-Prototype-Walkthrough.pptx` (48 slides). The iforce.live findings are taken from research.md §1 and were not checked again.
Conventions: **ASSUMED** means a judgement that has not been checked with a customer or a source. There are no prices, volumes or names of customers here. Personas are roles, not people.

Where this extends Roshan's brief: the brief describes two flows, manufacturer and forwarder. This note treats them as **one shipment record handed between parties**: the manufacturer's packing list/ASN is the forwarder's cargo data, and that cargo data is what gets checked at unloading. Re-keying data between parties is the pain we remove, and it is the reason a forwarder pulls their exporters onto the platform (and the other way round). The growth effect is ASSUMED.

---

## 1. Personas and top jobs-to-be-done

| # | Persona | Top jobs-to-be-done ("When…, I want to…, so that…") |
|---|---|---|
| P1 | **Exporter dispatch / logistics lead** (manufacturer) | 1. When an order is confirmed, see what is ready to ship and when, so I can book space on time. 2. Build pallets and a packing list that match the order exactly, so the buyer and customs do not reject it. 3. Fill the container (or choose the right one) without wasted space or overweight, so freight cost per unit falls. 4. Prove what was loaded (scan + photo + seal), so claims are settled in my favour. |
| P2 | **Exporter commercial / owner** | 1. Know the landed cost and the delivery date before I quote the buyer. 2. Answer "where is my order?" without phoning the forwarder. 3. Give EU/US buyers the documents they ask for (CO2e, traceability) so I keep the account. |
| P3 | **Forwarder operations executive / manager** | 1. Turn a quote into a booking and shipment without retyping. 2. Never miss a cut-off: the ASYHUB manifest (72 h before arrival for inward sea), the documents, the customs entry. 3. See every exception on all my jobs in one queue. 4. Consolidate HBLs/HAWBs into containers/ULDs and produce the HBL, MBL and AWB from one data set. |
| P4 | **Customs House Agent (CHA) / customs desk** | 1. Get a clean, complete document set and cargo lines with HS codes, so the CUSDEC goes in first time. 2. Track the status of each entry and any holds. |
| P5 | **CFS / warehouse tally clerk** (mobile) | 1. Scan and tally packages against the packing list/ASN on a phone, even when the signal is weak. 2. Record damage with photos and get a two-person sign-off fast. 3. Release only what customs, verification and payment allow. |
| P6 | **Forwarder finance** | 1. Invoice every chargeable item from the job, in USD and LKR, with nothing left out. 2. Recover the duties and fees paid for the customer. 3. See the profit on each job and the overdue balances. |
| P7 | **Consignee / importer** (portal or link, no seat) | 1. Know the predicted ETA and the free time left. 2. Download the arrival notice, DO and invoices. 3. Confirm receipt. |
| P8 | **Tenant admin** | 1. Set up master data without duplicates. 2. Give each role only the actions it is allowed (for example, who signs off verification). |

Primary buyer: **the forwarder (P3/P6)** pays for the platform. Exporters (P1/P2) are a second paying tier and the forwarder's best acquisition channel. CFS and consignee users mostly come in through the forwarder. This choice of buyer is ASSUMED and needs checking in customer interviews.

---

## 2. MVP module priority

### Must (without these there is no sellable v1)
| Module | Reason |
|---|---|
| Master data (parties, carriers, UN/LOCODE ports, warehouses, HS, container/ULD types, charge codes) with duplicate checks | Every other module depends on it. Duplicate checks are the iforce lesson (research.md §1). Without them the data goes bad within weeks. |
| Quote → booking → shipment (sea FCL/LCL and air), one wizard | This is the forwarder's daily core. Already shown in screens 11–18. Sea and air cover the main Colombo export/import flows (ASSUMED that road/courier volume is lower for target forwarders). |
| Shipment detail page (overview, cargo, documents, tracking, activity) | Listed as "not built" in the walkthrough (slide 47). It is the single record that every persona shares, so v1 cannot work without it. |
| Documents: HBL/MBL, HAWB/MAWB, commercial invoice, packing list, with a per-shipment checklist | Documents produced from shipment data remove retyping. The checklist stops shipments being held for missing papers. Checklist contents must be validated with a CHA (product-vision.md). |
| Customs workspace: CUSDEC status plus **ASYHUB manifest-ready export** and the 72-hour clock | The only legal route for manifests since 7 May 2025 (research.md §3). This is the clearest local differentiator against global tools. A file export comes first; live integration later, as it needs Customs registration. |
| Exporter packing: sales order → cartons → pallets with GS1 SSCC → packing list/ASN | This is what makes the product two-sided rather than another forwarder FMS. The SSCC rules are verified (research.md §5). |
| Unloading tally + verification on mobile (scan against packing list/ASN, damage photos, two-person sign-off) and a gated delivery order | Already in Roshan's scope. It closes the loop and is where disputes arise. Mobile-first comes from the iforce lesson. |
| Billing: invoice from job charges, USD/LKR, VAT | Without invoicing, the forwarder keeps their old system and we become an extra job. The FX and VAT logic must be checked (the prototype uses placeholders). |
| Roles, branches, tenant set-up | Multi-tenant SaaS requires it. Sign-off rights are a control the buyer will ask about. |
| Exceptions centre + notifications | Ops staff run their day from exceptions, not lists. It is cheap to build once the milestones exist. |

### Should (v1.x, soon after launch)
| Module | Reason |
|---|---|
| 3D load planner with loading confirmation by scan | High value and easy to demonstrate, but a good optimiser is real work (the prototype is a greedy heuristic, research.md §6). Ship a simple utilisation view in Must if time allows; the optimiser comes here. |
| Predicted ETA with delay reasons (carrier ETA versus predicted) | Buyers value it, but it needs live AIS/carrier data feeds. Ship it as a transparent heuristic labelled "estimate" first. |
| Demurrage & detention countdown | Directly saves money. Needs free-time data per carrier/contract, so it follows master data maturity. |
| Consignee portal / shareable link | Cuts "where is my cargo" calls. Read-only, so low risk. |
| Consolidation (HBL → container, HAWB → ULD) | Important for LCL/air consolidators, but not every first customer consolidates (ASSUMED). |
| Road and courier modes | Same wizard with fewer fields. Add them when customers ask. |
| Reports (volume, dwell, clearance time, discrepancy rate, job profit) | Managers buy on reports, but they need real data first. |
| Accounting export (to the customer's existing package) | Avoids building a GL. Which packages matter in Sri Lanka is not verified. |

### Later
| Module | Reason |
|---|---|
| Live ASYHUB / ASYCUDA World integration | Needs Sri Lanka Customs registration and approval (research.md §3). Start the process early; build it when access is granted. |
| Carrier / terminal APIs (SLPA terminals, AASL / airline cargo) | Not verified that they exist or are open (research.md §4). |
| ML ETA, OCR, AI assistant | Mocked in the prototype. Real versions need data volume we will not have at launch. |
| CO2e reporting (GLEC / ISO 14083) | Valuable for EU-facing exporters, but needs verified intensity factors. Pull it forward if exporter interviews show demand. |
| Live rate marketplace | Requires carrier contracts and EDI. Freightos-type territory. |
| Full WMS (put-away, picking) and full accounting (GL/AP) | Out of scope until CFS customers ask (product-vision.md). |
| Other South Asian customs systems (e.g. Bangladesh, Maldives) | Expansion. The rules are not researched. |

---

## 3. The 5 smartest features to add (what a Sri Lankan / South Asian buyer would pay for)

All "why they'd pay" statements are **ASSUMED** until checked in interviews. No prices are set here.

**1. Customs cut-off guard: ASYHUB manifest pre-check and a CHA hand-off pack**
- *Problem:* manifests must go through ASYHUB on time (72 h before arrival for inward sea cargo). Errors and late or incomplete document sets mean rework, holds and penalties for the forwarder. The CHA often re-keys data from PDFs and emails.
- *Feature:* before export, check every manifest line (BL type, parties, HS, packages, weights against the packing list). The countdown is driven by the *predicted* ETA, not only the carrier ETA, so a vessel arriving early does not cause a missed deadline. One click produces a structured pack for the CHA's CUSDEC entry.
- *Why they'd pay:* it is the one compliance task no global tool does for Sri Lanka, and the cost of missing it lands on the forwarder. This is a "fear of fines" purchase, which is easier to sell than "nice to have".

**2. Factory-to-consignee proof chain (SSCC + seal + photo at every hand-over)**
- *Problem:* shortages and damage claims turn into "your word against mine" between the exporter, the forwarder, the CFS and the buyer.
- *Feature:* every pallet's SSCC is scanned at loading (with the container and seal number and a time-stamped photo). It is scanned again at destination against the ASN. The platform then generates a **claims evidence pack**: what was loaded, where it was stowed in the 3D plan, the seal history and the tally result. This extends Roshan's "loading" and "unloading confirmation" into one evidence trail.
- *Why they'd pay:* one avoided or won claim can be worth more than a year's subscription (ASSUMED). Exporters also use it to prove to overseas buyers that they ship accurately.

**3. Disbursement and D&D money guard for forwarders**
- *Problem:* forwarders pay duties, port and terminal charges for customers and then struggle to recover them. Demurrage and detention build up quietly after free time. Some of this money is never invoiced (ASSUMED, a common pattern to confirm with forwarders).
- *Feature:* every cost paid for the customer is logged against the job and must be re-billed before the job can close. The D&D countdown per container gives alerts at set points and sends a warning to the consignee (with a portal link). It shows the real job profit in USD and LKR at the FX rate on the day.
- *Why they'd pay:* it recovers money that is already being lost, so it pays for itself. Finance and owners sign off on that easily.

**4. Container and cost optimiser for exporters ("what fits, what it costs, when it arrives")**
- *Problem:* exporters decide between LCL, 20', 40' or 40' HC, or a split, by guesswork. Space is wasted, and overweight or bad stowage causes damage.
- *Feature:* from the sales order lines, suggest the cheapest container mix with a 3D load plan (no-stack, no-tilt, weight limits, centre of gravity). Combine it with landed cost and predicted ETA, so the exporter can quote the buyer with confidence. The plan feeds the loading scan (feature 2) and the booking request to the forwarder.
- *Why they'd pay:* a better-filled container lowers freight cost per unit, which is a visible saving every month. Tools like EasyCargo and Cargo-Planner show that people pay for load planning on its own (research.md §6). We bundle it with the shipment.

**5. WhatsApp-first updates, approvals and capture, offline where it counts**
- *Problem:* in Sri Lanka and South Asia, most coordination between exporters, hauliers, CHAs and consignees happens on WhatsApp and phone calls, outside any system (ASSUMED, widely observed but not measured here). Warehouse and port areas can have weak signal (ASSUMED).
- *Feature:* milestone updates, arrival notices, D&D warnings and "approve this document" requests are sent on WhatsApp (via the WhatsApp Business API) with a secure link. Photos and documents sent back are attached to the right job. The mobile tally works offline and syncs later (the iforce offline-first lesson, research.md §1).
- *Why they'd pay:* it brings in the people who will never log in (drivers, small consignees), so data is complete without forcing new habits. It is also what makes the product feel local rather than imported.

*Considered but not in the top 5:* EU buyer compliance pack (CO2e per shipment plus forced-labour traceability, reusing the parked apparel work). It is valuable for EU-facing exporters from 2027, but demand is not yet checked. Keep it as the first "Later" item to pull forward.

---

## 4. UX principles

1. **One shipment, many views.** Every party works on the same record. Screens change by role, but the data never gets copied between them.
2. **Type once.** Each fact (party, HS code, package, weight) is entered once and flows into the order, packing list, documents, manifest, tally and invoice. If a user retypes something, treat it as a bug.
3. **Lead with exceptions, not lists.** Home shows what is late, at risk, or blocked, each with its next action. Lists are a level down.
4. **Deadlines are visible.** Every legal or cost clock (ASYHUB 72 h, cut-offs, free time, D&D) appears as a countdown with its reason and its source.
5. **Be honest about estimates.** Predicted ETAs, CO2e and suggested loads carry an "estimate" label, a ±band and the factors behind them. Placeholders are never shown as real numbers.
6. **Mobile and offline on the floor.** Tally, loading and verification are built for a phone, one hand and scanning first, with large touch targets. They work without signal and sync later.
7. **Scan before you type.** SSCC, container and seal numbers are scanned. Manual entry is the fallback and is logged.
8. **Evidence by default.** Every hand-over records who, when, where and a photo. Sign-offs that release cargo or money need the right role, and two people where the matrix says so.
9. **Clean master data from day one.** Duplicate checks (name, phone, tax ID, address) on create, as iforce does. Merging duplicates is an admin task, not a support ticket.
10. **Local by default.** LKR and USD side by side, UN/LOCODEs, Sri Lankan document names and the CHA workflow. Sinhala and Tamil labels for floor screens are ASSUMED to be useful and need checking with users.
11. **Progressive disclosure.** The wizard shows only the fields for the chosen mode and Incoterm. Advanced options are hidden until needed.
12. **Reach people outside the system.** Anyone without a seat (consignee, driver, CHA) gets a secure link or a WhatsApp message, never a login wall.

---

## Open questions for Roshan
- Confirm the primary buyer (forwarder first, exporter second) before the pricing work. ASSUMED.
- Approve starting the Sri Lanka Customs ASYHUB registration enquiry. Nothing has been sent.
- Which 3–5 forwarders and exporters can we interview to check features 1–5? Roshan to name them. None have been contacted.
