# Ternary Cargo: product vision (round 2, 31 Oct 2026)

## Refined vision
One multi-tenant SaaS platform for **exporters/manufacturers and the freight forwarders and CFS operators who move their goods**, covering the whole journey from **factory floor to the consignee's warehouse**:
sales order → serialisation (GS1 SSCC) → palletising → packing list / ASN → 3D load plan → loading confirmation → booking and shipment (sea, air, road, courier) → customs (ASYCUDA World / ASYHUB) → tracking with predicted ETA → arrival → unloading tally → verification → delivery order → billing.
Every party works on the same shipment record. The manufacturer, the forwarder, the warehouse and the consignee each get their own view of it.

## Personas (each with its own home dashboard)
| Persona | Example | Cares about |
|---|---|---|
| Exporter / manufacturer | Dispatch lead at Ceylon Tiles Mfg (Horana) | Orders ready to ship, pallets built, container utilisation, ETA to the buyer |
| Forwarder operations | Ops manager at Ceylon Freight Lines | Bookings, documents, customs deadlines, exceptions, D&D clocks |
| Warehouse / CFS | Tally clerk at Peliyagoda CFS | Scan, tally, verify, damage photos, sign-off (mobile view) |
| Finance | Finance at the forwarder | Invoices, overdue, job profit |
| Consignee (portal) | Importer such as Singer | Where is my cargo, documents, delivery |

## Module map
- **Home**: persona dashboards, exceptions centre, notifications, AI assistant (mock)
- **Manufacturing**: sales orders, products/SKUs, serialisation, palletising, packing lists, load planner (3D), loading confirmation, unloading confirmation
- **Freight operations**: quotations (with quote comparison and landed cost), bookings, shipments (detail page with tabs: overview, cargo, documents + checklist, tracking + ETA, D&D, CO2, activity), consolidation, documents, customs, tracking, arrival notices
- **Warehouse**: unloading and tally, verification, mobile scan view, delivery orders
- **Finance**: invoices, reports
- **Admin**: master data, users and roles, subscription, tenant onboarding wizard, reset demo data
- **Portal**: a shareable read-only shipment link for consignees

## What I added beyond Roshan's points, and why
1. **Predicted ETA with delay reasons**, shown as carrier ETA versus predicted ETA. Portcast and project44 both present the gap and the cause, not just a date. https://www.portcast.io/real-time-container-tracking , https://www.project44.com/blog/5-ways-machine-learning-makes-visibility-more-valuable/
2. **Demurrage and detention countdown** per container. Demurrage charges for terminal space and detention for equipment, after free time runs out. These costs hit importers directly, so a countdown is high-value. https://www.fmc.gov/wp-content/uploads/2019/04/reportdemurrage.pdf , https://www.fmc.gov/detention-and-demurrage/
3. **CO2e estimate per shipment** using the GLEC / ISO 14083 method (tonnes × km × emission intensity). EU buyers increasingly ask for this. The prototype uses placeholder intensity factors, clearly labelled. https://smart-freight-centre-media.s3.amazonaws.com/documents/GLEC_FRAMEWORK_v3_23_10_24_B.pdf , https://academy.smartfreightcentre.org/blog/how-glec-supports-csrd
4. **SSCC ↔ ASN scan reconciliation** at destination. One scan at the receiving bay matches the pre-sent ASN. https://www.gs1us.org/content/dam/gs1us/documents/tools-resources/resources/data-hub-help-center/Removal/intro-to-sscc-pdf.pdf
5. **Document checklist per shipment** (by mode and Incoterm) with missing-document alerts. Magaya and CargoWise both tie documents to the shipment workflow (see research.md §2). The checklist contents in the prototype are illustrative and need validation with a CHA.
6. **Exceptions centre and notifications**: delays, holds, discrepancies and D&D in one queue.
7. **Customer/consignee portal and shared link**: Logixboard's positioning is customer-facing visibility (research.md §2).
8. **Mobile scan view** for warehouse staff: the iForce lesson of mobile-first field execution (research.md §1).
9. **AI assistant (mocked)** for "where is my shipment" questions and invoice data extraction. Shown as a concept only, with canned answers.
10. **Quote comparison and landed cost**: Freightos centres on rates and quoting (research.md §2). The prototype uses mock rates.
11. **Tenant onboarding wizard**: needed for self-serve SaaS.

## Deliberately left out (for now)
- Real ML for ETA, real OCR or AI: mocked and labelled.
- A live rate marketplace and carrier EDI/API connections: they come with the backend.
- Full accounting (GL, AP): we stop at invoices. Integrate with existing accounting systems later.
- A full warehouse WMS (put-away, picking slots): out of scope until there's demand from CFS customers.
- Live ASYHUB/ASYCUDA integration: needs Sri Lanka Customs registration (research.md §3).

## Team-notes alignment (31 Oct 2026)

Source notes: `team/product.md`, `team/design.md`, `team/commercial.md` and `team/architecture.md`. Where they differ from the earlier sections, the team notes win.

- **Personas P1–P8 (product.md).** The persona homes on the dashboard map to these personas. The Forwarder ops and Exporter views are built. The CHA (P4), finance (P6), consignee (P7, portal/share link) and admin (P8) roles each have dedicated screens. The primary buyer is the forwarder (P3/P6). That choice is ASSUMED, as product.md says.
- **Top-5 features (product.md) and their status in the prototype:**
  1. Customs cut-off guard: customs screen and exceptions centre. ASYHUB pre-check is mocked.
  2. Proof chain (SSCC + seal + photo at every hand-over): pallet SSCCs, loading scan with seal, receiving scan, damage photos, event log.
  3. Disbursement / D&D money guard: D&D countdown per shipment, landed cost, invoices.
  4. Container and cost optimiser: 3D load planner (20GP/40GP/40HC/AKE) with advisory checks, quote comparison, P50/P90 ETA.
  5. WhatsApp-first updates: **not built**. Only the portal and share link exist. Offline capture is done in the mobile scan, which queues scans and syncs them later.
- **Design (design.md).** Implemented: the token block (light and dark, with no `!important` overrides), Inter / IBM Plex Sans / JetBrains Mono, the Pulli Grid logo, status badges with icons, exceptions-first layout. Deferred: TanStack Table, MapLibre, sonner, next-themes, the full §2.9 dashboard grid, 3D view presets and the instanced-mesh / 2D fallback.
- **Commercial (commercial.md).** The subscription screen shows Starter LKR 25,000 (≈USD 75), Business LKR 75,000 (≈USD 225) and Enterprise from LKR 200,000, plus the seat and pack add-ons. Every figure is labelled *indicative*.
- **Architecture (architecture.md).** The mock data uses the same model: SSCC handling units, SGTIN serials, HBL/MBL, containers and ULDs, an append-only event log, offline tally, load-plan warnings (payload, CoG, axle, stacking, hazmat) and ETA as a P50/P90 range. There is no backend. Persistence is localStorage only.
- **Must-fix bugs:** all fixed. Tally tolerance is ±2% and the exception counts match. Sign-off with an open discrepancy needs a reason and a second approver. The map uses a real lat/long projection. Dark mode uses tokens. The logo is in place.
