# Cargo management SaaS — research brief (31 Oct 2026)

## 1. iforce.live (the inspiration)
- iforce.live is **not a cargo product**. It is a Sales Force Automation / route-to-market platform for FMCG field teams: offline mobile orders, route planning, distributor control, real-time dashboards. Source: https://iforce.live (redirects to iforce.lk)
- Inspiration worth borrowing (not copying): clean master data with duplicate validation (outlet name/phone/GPS match), live KPI dashboards, mobile-first field execution, simple SaaS deployment, proof via named-customer scale figures (Bellose: 22,000+ outlets, 250+ reps, 200+ distributors). Source: https://iforce.live
- It is run by Prologics, Borella, Colombo 08 (sales@prologics.lk), so it is a local Sri Lankan SaaS. Source: https://iforce.live
- Takeaway for us: apply the same patterns to cargo — duplicate checks on shipper/consignee master data, a mobile-friendly tally/verification screen for warehouse staff, and KPI dashboards.

## 2. Comparable cargo/freight platforms — standard modules
| Platform | Scope | Source |
|---|---|---|
| Magaya | Quotes → bookings → pickup orders → warehouse receipts → shipments → invoices without re-entry; built-in WMS (receiving, put-away, inventory, picking, packing), customs, accounting, tracking, customer portal | https://www.magaya.com/ , https://www.magaya.com/freight-forwarding-software/ |
| CargoWise | Enterprise single platform: international forwarding across modes (capacity planning, rate mgmt, vessel booking, last-mile trucking), customs, warehouse, accounting | https://www.cargowise.com/ |
| Freightos | Rate management, quoting, booking, milestone visibility; not a full FMS (no native WMS/customs/accounting) | https://wifitalents.com/best/freight-forwarders-software/ (third-party review) |
| Logixboard | Customer-facing shipment visibility, configurable stages, document-linked milestones | https://wifitalents.com/best/freight-forwarders-software/ , https://gitnux.org/best/freight-forwarders-software/ (third-party reviews) |

Standard module set shared by them: master data, quotation/rates, booking, shipment (per mode), consolidation, documents, customs, tracking/milestones, warehouse (receiving/devanning), billing/accounting, reports, customer portal. (Synthesised from the sources above.)

## 3. Sri Lanka specifics
- Import consignments are declared to Customs through a Customs House Agent with an online Customs Declaration in ASYCUDA World. https://www.customs.gov.lk/services/importing-goods/
- Inward sea cargo e-manifests: due 72 h before arrival at first Sri Lankan port (or on departure from the last foreign port if the voyage is < 72 h). Filed by licensed shipping agents, freight forwarders or NVOCCs. Electronic Sea Cargo Reporting Regulations No. 1 of 2014. https://www.customs.gov.lk/wp-content/uploads/2021/07/1886_55-E.pdf
- Since 7 May 2025, cargo manifests must be submitted **only via ASYHUB** (UNCTAD platform). ASYCUDA World is still used for vessel registration and clearance. ASYHUB covers port-call management, manifest lodgement (import/export/transhipment) and BL-type verification. https://www.customs.gov.lk/mandatory-submission-of-manifests-via-asyhub-system-effective-from-07th-may-2025/ , https://www.customs.gov.lk/services/asyhub/
- Air cargo advance e-manifest regulation is drafted but not yet approved or published (per Customs FAQ). https://www.customs.gov.lk/services/importing-goods/
- BIA (CMB) air arrivals: the pilot-in-command delivers cargo and stores manifests in duplicate plus the General Declaration. https://airport.lk/aasl/AIS/AMDT%20WEB/AIP%20FROM%2020%20APR%202023/htm/33.htm
- HS codes: the prototype uses example 6-digit HS headings. Sri Lanka tariff lines and duty rates are **not verified here** and must be checked against the Sri Lanka Customs tariff before the real build.

## 4. Product implications
- Name: "Ternary Cargo" (working name; nothing in the research suggested a better one).
- Differentiators for the local market: an ASYHUB manifest-ready export (sea), CHA (Customs House Agent) workflow for the declaration, and a mobile tally/verification screen.
- Not verified / open: SLPA terminal (JCT/SAGT/CICT/ECT) integrations, AASL/SriLankan cargo terminal APIs, and pricing benchmarks.

---
# Round 2 research (31 Oct 2026)

## 5. Manufacturer export flow and GS1 SSCC serialisation
- An SSCC is an 18-digit GS1 key for a logistic unit (case, pallet, air cargo container), encoded in GS1-128 with Application Identifier (00). It is made of an extension digit, the GS1 Company Prefix, a serial reference and a check digit. Extension + prefix + serial always total 17 digits. https://www.gs1us.org/upcs-barcodes-prefixes/serialized-shipping-container-codes , https://www.gs1us.org/content/dam/gs1us/documents/tools-resources/resources/data-hub-help-center/Removal/intro-to-sscc-pdf.pdf
- The SSCC is the only mandatory element of a GS1 Logistic Label. It should be assigned by whoever builds the unit, using their own company prefix. Serial references can be sequential. The check digit uses the GS1 algorithm. https://ref.gs1.org/guidelines/logistic-label/1.2.0/ , https://www.gs1.org/standards/gs1-logistic-label-guideline/current-standard
- One SSCC scan at the receiving bay can be matched with a pre-sent Advance Ship Notice (ASN) to speed up receiving and reconciliation. A unit that is broken down and repacked gets a new SSCC. https://www.gs1us.org/content/dam/gs1us/documents/tools-resources/resources/data-hub-help-center/Removal/intro-to-sscc-pdf.pdf
- Pallet labels: use two identical labels, one on a short side and one on a long side, placed 400–800 mm above the base and at least 50 mm from vertical edges. If there are several barcodes, the SSCC goes at the bottom. https://www.gs1uk.org/knowledge-hub/barcodes/where-should-pallet-labels-be-placed
- Implication for the prototype: sales order → serialise cartons → build pallets (each pallet gets an SSCC) → packing list from pallets (an ASN) → load plan → loading confirmation by scan → unloading confirmation by SSCC scan against the ASN at destination. This flow is our design, derived from the GS1 guidance above.

## 6. Load planning tools
- EasyCargo: web-based 3D load planner for containers, trucks and pallets. Interactive rotate/zoom 3D view, real-time payload and volume usage, constraints (non-stackable, no-tilt), priority groups by destination, step-by-step loading reports, Excel/API/SAP integration. https://www.easycargo3d.com/en/ , https://www.easycargo3d.com/en/3d-container-load-calculator/
- Cargo-Planner: chooses the cheapest container mix, keeps centre of gravity within 10% of the container centre, handles pallets, flat racks, open tops and ULDs, and shares step-by-step 3D plans by link. https://cargo-planner.com/sea-container-loading-software/
- Prototype: uses a simple greedy layer/shelf heuristic, not an optimiser. Container internal dimensions and payloads are typical published values and must be verified per carrier before production.

## 7. ETA prediction
- Portcast: ML predicted ETA built from 70+ data sources (AIS vessel position, carrier schedule changes, port congestion, dwell, historical lane performance, weather, disruptions). It predicts at milestone level (berthing, discharge, customs, gate-out), shows delay as the gap between carrier ETA and predicted ETA, and explains the cause. https://www.portcast.io/predictive-visibility , https://www.portcast.io/real-time-container-tracking , https://kb.portcast.io/Understanding-Delay-and-Incident-Reporting-in-Ocean-Visibility-18106ae01ad1805e9a12d605c5784895
- project44: ocean ETAs combine sailing schedules, carrier ETAs, rotation and lane performance, port congestion, and vessel and container attributes. Geofenced milestones are detected about 4x faster than carrier-reported events. https://www.project44.com/blog/5-ways-machine-learning-makes-visibility-more-valuable/ , https://www.project44.com/blog/achieving-high-velocity-with-ai-powered-predictive-etas/
- Prototype: a transparent heuristic (carrier ETA + weighted delay factors for congestion, transhipment, weather, customs, carrier reliability), labelled "Prototype estimate", with a ±band. It is not ML and has no live data.
