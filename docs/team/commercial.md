# Ternary Cargo: commercial plan (pricing, first 10 customers, subscription screen)

**Ternary Systems · Research. Invent. Deliver.** · Commercial Strategist · 31 Oct 2026 · INTERNAL ONLY (no external contact made)

> Format note: /workspace/brand/templates/INDEX.md has no markdown template (all templates are .docx/.pptx), so this follows the brand rules that apply to plain text: British English, footer tagline and details below. If this goes to a reader, move it into the Proposal or Research Report template.
>
> **[A] = assumption / hypothesis to test.** Anything without [A] has a source. Our own prices are all hypotheses until tested in pilots. FX: **USD 1 = LKR 332.61** (CBSL indicative spot, 30 Oct 2026; https://macrolab.lk/data/series/LK.EXT.FX.USD.SPOT.D/ , https://www.cbsl.gov.lk/en/rates-and-indicators/exchange-rates). USD figures are rounded.

---

## 1. Pricing

### 1.1 Competitor price references (checked 31 Oct 2026)

| Product | Model | Public price | Source |
|---|---|---|---|
| **Logitude World** | Per user / month | Smart USD 75; Professional USD 99; Enterprise custom (30+ users). No setup fee; training and standard implementation included | https://www.logitudeworld.com/logitude-freight-forwarding-software-pricing/ |
| **Shipthis** (US/India) | Per user / month, all modules | USD 89 per user; add-ons (track & trace, trade messaging, eAWB) billed per transaction; 30-day free trial; annual or quarterly billing | https://www.shipthis.co/pricing |
| **CargoWise** | Per transaction ("Value Packs", since Dec 2025), unlimited users | Not on CargoWise's public site. Third-party list: USD 19.95 import FCL, 13.30 import LCL/air, 12.75 export FCL, 8.35 export LCL/air per shipment; 9.95 standalone import customs entry | https://cargoez.com/blog/freight-forwarding-software-pricing (third-party, vendor-authored blog) |
| **Magaya** | Per user + modules, quote only | **Not public.** Third-party estimates USD 200–300 per user / month plus implementation | https://www.erp-information.com/magaya , https://www.itqlick.com/magaya-cargo-system/pricing (estimates) |
| **GoFreight** | Quote only | **Not public** (pricing page asks for a call). Third-party estimate ~USD 100–400 per user / month | https://gofreight.com/pricing , https://cargoez.com/blog/freight-forwarding-software-pricing |
| **Freightos for Forwarders (ex-WebCargo)** | Free air booking; paid modules by purchase order | Book Air free; rate management, portal and API modules **not publicly priced**. (Freightos Terminal data: USD 119 / 239 per month, a different product) | https://www.freightos.com/forwarders/ , https://www.freightos.com/forwarders-terms-of-service/ , https://www.freightos.com/enterprise/terminal/pricing/ |
| **Zoho Inventory** (adjacent, manufacturer side) | Per organisation, tiered by orders / users / locations | USD 29 (500 orders, 3 users) · 79 (3,000, 5 users) · 129 (7,500, 10 users) · 249 (15,000, 10 users) per org / month, billed annually; free plan 50 orders | https://www.zoho.com/inventory/pricing/ |
| **Logi-Sys** (India) | Per user, by module | Third-party: from ~USD 80 per user / month; no INR list published | https://cargoez.com/blog/freightify-vs-logi-sys |
| **FreightBro / Freightify** (India) | Custom quote | One Indian listing shows INR 7,500 / month per forwarding branch (unverified listing) | https://www.bestsoftware.co.in/productDetails/freightbro |
| **Cargoflash**, **Kale (CORVI)** | Quote only | **Not public** — nothing found | — |
| Sri Lankan forwarder SaaS | — | **No public Sri Lankan price list found** in this pass. Local competitors must be mapped in pilot interviews [A] | — |

**Read-across:** published small-forwarder SaaS clusters at **USD 75–99 per user / month** (≈ LKR 25,000–33,000). Enterprise tools (CargoWise, Magaya) are well above that and quote-only. A 10-user forwarder on Logitude Smart pays USD 750 / month (≈ LKR 249,000).

### 1.2 Charging model: decision

**Recommendation: a per-tenant platform plan that includes a seat bundle and a monthly shipment allowance, plus paid add-on modules. Not pure per seat, not pure per shipment.**

Why:
1. **Pure per seat punishes our key design choice.** Ternary Cargo puts the manufacturer, forwarder, CFS tally clerks and consignee on one shipment record. Charging per seat would make customers ration logins for tally clerks and portal users, which kills the network effect. So: tally/scan users and consignee portal users are **free and unlimited** [A]; only "office" seats count.
2. **Pure per shipment (CargoWise style) is unpredictable** for SMEs in a volatile-FX market, and the third-party reports of cost increases after CargoWise's switch are a sales point against it (https://www.nuevaflo.com/en/blog/cargowise-vs-magaya/). But an allowance does track value and stops a 3-seat forwarder pushing thousands of jobs on a starter plan.
3. **Per module fits two very different buyers.** Manufacturers need serialisation/palletising/3D load planning; forwarders need consolidation/customs/billing. Core modules go in the plan; the manufacturing pack and integrations are add-ons.
4. **LKR billing** (with a USD price for regional customers) removes FX risk for local buyers; Zoho's per-organisation tiers show SMEs accept usage-capped plans.

### 1.3 Proposed tiers (all prices [A] — hypotheses to test)

| | **Starter** | **Business** (anchor) | **Enterprise** |
|---|---|---|---|
| Price / month, billed annually | **LKR 25,000** (≈ USD 75) [A] | **LKR 75,000** (≈ USD 225) [A] | From **LKR 200,000** (≈ USD 600), quoted [A] |
| Monthly billing | +15% [A] | +15% [A] | Annual only [A] |
| Office seats included | 3 | 10 | 25+ |
| Extra office seat | LKR 6,000 (≈ USD 18) [A] | LKR 6,000 [A] | Negotiated |
| Tally / scan + consignee portal users | Unlimited, free | Unlimited, free | Unlimited, free |
| Shipments (jobs) per month included | 100 | 500 | 2,000+ |
| Overage per shipment | LKR 200 (≈ USD 0.60) [A] | LKR 150 (≈ USD 0.45) [A] | Negotiated |
| Modes | Sea & air | Sea, air, road, courier | All |
| Core: master data, quotes & booking, shipments, documents (HBL/HAWB/invoice/packing list), tracking, arrival notices, billing/invoices, reports | ✓ | ✓ | ✓ |
| Consolidation (container / ULD), customs status + ASYHUB-ready manifest export, unloading tally, verification, delivery orders | — | ✓ | ✓ |
| Predicted ETA, D&D countdown, CO2e, exceptions centre | Basic tracking only | ✓ | ✓ |
| Branches / tenants | 1 | 2 | Multi-branch, multi-country |
| SSO, API & EDI, audit log retention, dedicated support / SLA | — | — | ✓ |
| Onboarding | Self-serve + 2 h remote [A] | Guided, data import of master data [A] | Project, quoted |

**Add-on modules (any plan from Business up) [A]:**
- **Manufacturing pack** (sales orders, GS1 SSCC serialisation, palletising, ASN, 3D load planner, loading/unloading confirmation): **LKR 30,000 / month** (≈ USD 90) [A]. Manufacturers can buy **Starter + Manufacturing pack** as their entry plan.
- **Integrations** (accounting export, carrier tracking feeds, later ASYHUB/ASYCUDA once registration allows — research.md §3): LKR 15,000 / month each [A].
- **AI assistant / document extraction**: price only once real (currently mocked, product-vision.md); not sold in pilots.

**Sanity check vs market:** Business at LKR 75,000 for 10 seats ≈ USD 22.50 per seat — about a quarter to a third of Logitude (USD 75–99) or Shipthis (USD 89). That is deliberate for Sri Lankan SME willingness to pay [A], but it leaves room to raise prices; test LKR 75,000 vs LKR 120,000 in pilot interviews [A]. The prototype's current placeholder prices (LKR 15,000 / 45,000) look too low against the benchmarks.

**Unit economics:** not computed here — hosting, support and sales costs aren't in /workspace/cargo. Break-even customer count must be modelled before launch [A].

---

## 2. Go-to-market: first 10 customers

### 2.1 Target segments (in order)
1. **Small and mid-size freight forwarders / NVOCCs / consolidators in Colombo (5–30 staff)** — core buyer; they file sea manifests (research.md §3) and feel the document and tally pain. Target **5–6** of the 10 [A].
2. **Exporting manufacturers with their own dispatch team** (apparel, tiles, rubber, tea, FMCG — e.g. the "Ceylon Tiles" persona) — buy Starter + Manufacturing pack; also pull their forwarder onto the platform. Target **2–3** [A].
3. **CFS / bonded warehouse operators** (Peliyagoda-type) — tally/verification. Target **1–2** [A].
Regional (South Asia) customers: after 10 local references, not before [A].

### 2.2 Channels (research and plan only — no contact made)
| Channel | Why | Size / note |
|---|---|---|
| **SLFFA** (Sri Lanka Freight Forwarders Association) | Direct line to the forwarder segment; events such as the National Logistics Awards 2026 | 190+ member companies per the chairman's message (other SLFFA pages say 170+/182+) — https://www.slffa.com/about-us/chairmans-message , https://sundaytimes.lk/online/business/SLFFA-to-honour-excellence-in-Sri-Lankas-logistics-industry-at-National-Logistics-Awards-2026/10-1152274 |
| **EDB** (Export Development Board) | Exporter base; possible digitalisation programme fit | Programme fit not verified [A] |
| **JAAF** (Joint Apparel Association Forum) | Apparel exporters (largest export sector); links to the parked apparel traceability work | Member count not checked [A] |
| **Chambers** (Ceylon Chamber of Commerce, NCE, regional chambers) | Manufacturer exporters outside Colombo | [A] |
| **Founder network / warm intros** | Fastest route to first 3 | [A] |
| Customs House Agents (CHAs) | Influencers on the declaration workflow; also validate document checklists (product-vision.md) | [A] |

### 2.3 Pilot offer [A]
- **"Founding customer" pilot: 90 days**, Business plan + Manufacturing pack where relevant, **free for the first 60 days, then 50% off for the rest of year 1**, in exchange for: weekly feedback, a named case study/reference, and real (anonymised) data for the build. Shipthis already offers a 30-day free trial, so 30 days is the market floor.
- Signed **letter of intent with a year-1 price** before go-live, so pilots convert rather than drift.
- Free master-data import (customers, carriers, charges) — the main switching cost.

### 2.4 Sales motion
Founder-led, consultative: discovery call → demo of the prototype on *their* lane → 2-week paper prototype test with one ops user → pilot LOI → onboarding → day-60 review → annual contract. Target sales cycle 4–8 weeks for SMEs [A].

### 2.5 Timeline [A] (all subject to the product build being ready)
| Weeks | Milestone |
|---|---|
| 0–2 | Approve pricing hypotheses; build list of 40 targets from SLFFA directory + EDB/JAAF member lists; Roshan approves any outreach |
| 2–6 | 15–20 discovery interviews; price testing (LKR 75k vs 120k); pick 3 design partners |
| 6–14 | 3 founding pilots live (2 forwarders, 1 manufacturer) |
| 14–22 | Convert ≥2 pilots to paid; 3–4 more pilots via SLFFA/EDB referrals |
| 22–30 | 10 customers signed (≥7 paying) |

**Commercial KPIs [A thresholds]:** discovery→pilot ≥20%; pilot→paid ≥60%; ≥200 shipments/month across pilots by week 14; logo churn 0 in year 1; **stop/rethink if <3 paying customers by week 22.**

---

## 3. Prototype subscription & settings screen: what it should show

Current screen (screens/37-settings-plan.png): three plan cards, placeholder prices, one line "9 of 15 seats used · renews 01 Dec 2026". Recommended content:

**A. Current plan summary (top card)**
- Plan name + badge (Business), billing period (annual/monthly), price in **LKR with USD shown for reference**, next renewal date, auto-renew toggle, payment status (Active / Trial – N days left / Past due).
- "Founding customer" discount line when applicable.

**B. Usage meters (progress bars with % and warning at 80%)**
- Office seats used / included (e.g. 9 / 10) + "add seat" (shows LKR 6,000 [A]).
- Shipments this month / included, with projected month-end and overage cost estimate.
- Free users shown separately (tally/scan users, portal links) — "unlimited, not billed" so customers see why to invite them.
- Storage for documents/photos (if we cap it) [A].
- Branches used / included.

**C. Modules / add-ons**
- List with status: Included · Active add-on · Available (price) · Coming soon (AI assistant, ASYHUB live integration — clearly labelled as not live).
- Toggle → confirm modal with prorated price.

**D. Plan comparison & change**
- The three tier cards (Starter / Business / Enterprise) with the inclusions table from §1.3; upgrade immediate & prorated, downgrade at period end; Enterprise = "Contact sales".

**E. Seats & users** (link to Users tab): who holds a paid seat vs a free role; reassign seat.

**F. Billing details**
- Billing entity, address, **VAT/TIN registration**, billing contact email, currency (LKR/USD), payment method (bank transfer / card / standing order) [A on which methods we support].

**G. Invoices**
- Table: invoice no., date, period, amount (LKR), VAT, status (Paid/Due/Overdue), PDF download; overage line items visible.

**H. Trial / pilot banner** (when relevant): days left, what happens at day 60, "convert to paid" CTA.

**I. Danger zone**: export all data (CSV/JSON), cancel subscription (end-of-term), close organisation — each with confirmation.

All figures in the prototype should carry a small "Indicative pricing – pilot" label until prices are validated.

---

## Open items / risks
- All our prices, allowances and pilot terms are **[A]**; validate in 15–20 interviews.
- Unit economics (hosting, support, CAC) not modelled — needed before public pricing.
- Several competitor figures are third-party estimates (Magaya, GoFreight, CargoWise list, Logi-Sys, FreightBro); Cargoflash, Kale and Sri Lankan local vendors have no public pricing.
- No one outside the lab has been contacted.

---
*Research. Invent. Deliver.* · 0763963701 · roshanchamika842@gmail.com · ternary.roshangamage.com
