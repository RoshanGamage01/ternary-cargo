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
