import { chromium } from "playwright";
const S = [
["01-login","login","Login","Workspace sign-in with SSO options; entry point for every tenant user."],
["02-tenant-select","tenant","Tenant / org selection","One user can belong to several organisations; this is the multi-tenant SaaS core."],
["03-dashboard","dashboard","Dashboard","KPIs, weekly volume by mode and an exceptions list, so managers see what needs action."],
["04-master-customers","master-data?tab=Customers","Master data: customers","Shippers/consignees with a duplicate-TIN warning (clean master data, iForce-inspired)."],
["05-master-carriers","master-data?tab=Carriers","Master data: carriers","Shipping lines, airlines and road hauliers with codes and contracts."],
["06-master-ports","master-data?tab=Ports%20%26%20Airports","Master data: ports & airports","UN/LOCODEs incl. LKCMB, CMB airport, Jebel Ali, Singapore."],
["07-master-warehouses","master-data?tab=Warehouses","Master data: warehouses","CFS, air shed and bonded warehouses where unloading happens."],
["08-master-hs","master-data?tab=Commodities%20%26%20HS","Master data: commodities & HS codes","HS codes with hazmat and temperature flags drive customs and handling."],
["09-master-containers","master-data?tab=Container%20types","Master data: container & ULD types","ISO container and air ULD types with payload and volume for consolidation."],
["10-master-charges","master-data?tab=Charges","Master data: charges","Charge codes and default rates in USD/LKR feed quotes and invoices."],
["11-quotation","quotations","Quotation & booking","Priced LCL quote, accepted, one click to convert into a booking."],
["12-shipments-list","shipments","Shipments list","All modes (Sea FCL/LCL, Air, Road, Courier) with BL/AWB numbers and status."],
["13-wizard-1-mode","shipments/new?step=1","Create shipment wizard 1: mode & parties","Choose the mode and the parties; same flow for every mode."],
["14-wizard-2-routing-sea","shipments/new?step=2","Wizard 2: routing (sea)","Ports, line, vessel/voyage, ETD/ETA and the delivery warehouse."],
["15-wizard-2-routing-air","shipments/new?step=2&mode=Air","Wizard 2: routing (air)","The same step switches to airports, airline and flight for air."],
["16-wizard-3-cargo","shipments/new?step=3","Wizard 3: cargo lines","Packages, HS codes, weight and CBM, with auto totals."],
["17-wizard-4-review","shipments/new?step=4","Wizard 4: documents & review","Review, then choose HBL/MBL, ASYHUB manifest line and the confirmation."],
["18-shipment-created","shipments/new?done=1","Shipment created","Confirmation with HBL/MBL numbers and next actions."],
["19-consolidation-sea","consolidation","Consolidation: container stuffing","House BLs stuffed into a 40' HC with fill %, weight and seal."],
["20-consolidation-air-uld","consolidation?mode=air","Consolidation: air ULD build-up","HAWBs built onto an AKE ULD under a MAWB."],
["21-doc-hbl","documents","Documents: House BL preview","BL generated from shipment data, ready to download or send."],
["22-doc-awb","documents?doc=Air%20Waybill%20(HAWB)","Documents: air waybill preview","HAWB preview for the air flow."],
["23-doc-invoice","documents?doc=Commercial%20invoice","Documents: commercial invoice","Commercial invoice with values per line."],
["24-doc-packing","documents?doc=Packing%20list","Documents: packing list","Packing list used later at the tally."],
["25-customs","customs","Customs declaration status","CUSDEC status per entry and ASYHUB manifest due (72 h sea rule)."],
["26-tracking","tracking","Tracking timeline","Milestones from booking to delivery, plus route and container."],
["27-arrival-notice","arrival","Arrival notice","Notice to the consignee with free time and charges due."],
["28-unloading-in-progress","unloading","Unloading / devanning tally (in progress)","Per-package tally with seal, actual weight and condition; 7 of 12 done."],
["29-unloading-complete","unloading?state=done","Unloading complete","All 12 tallied; one package flagged as damaged."],
["30-verification-discrepancy","verification","Verification: discrepancy found","Piece, weight, seal and marks checks; damage report with photos for PKG-007."],
["31-verification-verified","verification?state=verified","Verification: signed off","Two-person sign-off, damage report sent, cargo released for DO."],
["32-delivery-order","release","Delivery order / release","DO with haulier and driver, gated on customs, verification and payment."],
["33-billing","billing","Billing & invoice","Invoice built from shipment charges, with VAT and USD→LKR conversion."],
["34-reports","reports","Reports","Volume, dwell, clearance time, discrepancy rate, profitability, carriers."],
["35-settings-users","settings?tab=Users","Settings: users","Tenant users by role and branch."],
["36-settings-roles","settings?tab=Roles%20%26%20permissions","Settings: roles & permissions","Role matrix, including who may sign off verification."],
["37-settings-plan","settings?tab=Subscription","Settings: subscription plan","SaaS plans and seat usage (placeholder prices)."],
];
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
let md = "# Ternary Cargo prototype: screenshots (flow order)\n\n";
for (const [f, u, t, w] of S) { await p.goto("http://localhost:3100/" + u, { waitUntil: "networkidle" }); await p.screenshot({ path: `../screens/${f}.png` }); md += `- **${f}.png**: ${t}. ${w}\n`; }
// click-through sanity: wizard and sign-off by real clicks
await p.goto("http://localhost:3100/shipments/new"); for (let i=0;i<3;i++) await p.click("text=Continue"); await p.click("text=Create shipment"); await p.waitForSelector("text=TC-SEA-24121 created");
await p.goto("http://localhost:3100/verification"); await p.click("text=Sign off verification"); await p.waitForSelector("text=Verified with exception");
await b.close(); (await import("fs")).writeFileSync("../screens/index.md", md); console.log("ok", S.length);
