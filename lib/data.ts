export const tenants = [
  { id: "ceylon", name: "Ceylon Freight Lines (Pvt) Ltd", plan: "Business", city: "Colombo 03" },
  { id: "lanka", name: "LankaLink Logistics", plan: "Starter", city: "Katunayake" },
  { id: "indigo", name: "Indigo Ocean Forwarders", plan: "Enterprise", city: "Colombo 01" },
];
export const shipments = [
  { ref: "TC-SEA-24118", mode: "Sea FCL", doc: "MBL MAEU240981133", shipper: "Dubai Steel Trading LLC", consignee: "Abans PLC", pol: "AEJEA Jebel Ali", pod: "LKCMB Colombo", eta: "02 Nov 2026", status: "In transit", tone: "blue" },
  { ref: "TC-SEA-24121", mode: "Sea LCL", doc: "HBL CFL-HB-55120", shipper: "Shenzhen Brightway Co.", consignee: "Singer Sri Lanka PLC", pol: "SGSIN Singapore", pod: "LKCMB Colombo", eta: "31 Oct 2026", status: "Arrived", tone: "green" },
  { ref: "TC-AIR-08812", mode: "Air", doc: "MAWB 618-44210985", shipper: "Siam Pharma Co.", consignee: "Hemas Pharmaceuticals", pol: "BKK Bangkok", pod: "CMB Colombo BIA", eta: "31 Oct 2026", status: "Customs hold", tone: "amber" },
  { ref: "TC-AIR-08815", mode: "Air", doc: "HAWB CFL-A-77310", shipper: "MAS Intimates", consignee: "Victoria's Secret DC", pol: "CMB Colombo BIA", pod: "JFK New York", eta: "03 Nov 2026", status: "Booked", tone: "slate" },
  { ref: "TC-RD-00342", mode: "Road", doc: "CMR TC-R-00342", shipper: "Ceylon Biscuits Ltd", consignee: "Cargills Food City DC", pol: "Pannala", pod: "Kandy", eta: "31 Oct 2026", status: "Delivered", tone: "green" },
  { ref: "TC-SEA-24109", mode: "Sea FCL", doc: "MBL ONEY SIN 88213", shipper: "Hayleys Fibre", consignee: "Rotterdam Coir BV", pol: "LKCMB Colombo", pod: "NLRTM Rotterdam", eta: "18 Nov 2026", status: "Sailed", tone: "blue" },
  { ref: "TC-CR-01977", mode: "Courier", doc: "AWB DHL 4410293381", shipper: "Dilmah Ceylon Tea", consignee: "Tea Box Sydney", pol: "CMB Colombo BIA", pod: "SYD Sydney", eta: "02 Nov 2026", status: "In transit", tone: "blue" },
];
export const customers = [
  ["CUS-0012", "Abans PLC", "Consignee", "Colombo 02", "TIN 114002234", "Active"],
  ["CUS-0031", "Singer Sri Lanka PLC", "Consignee", "Colombo 02", "TIN 104000781", "Active"],
  ["CUS-0044", "Hemas Pharmaceuticals", "Consignee", "Colombo 02", "TIN 134001211", "Active"],
  ["CUS-0058", "MAS Intimates", "Shipper", "Biyagama", "TIN 114009984", "Active"],
  ["CUS-0060", "Dubai Steel Trading LLC", "Shipper", "Dubai, UAE", "TRN 100224455", "Active"],
  ["CUS-0071", "Dilmah Ceylon Tea", "Shipper", "Peliyagoda", "TIN 104003320", "Credit hold"],
];
export const masterTabs: Record<string, { cols: string[]; rows: string[][] }> = {
  "Customers": { cols: ["Code", "Name", "Type", "City", "Tax ID", "Status"], rows: customers },
  "Carriers": { cols: ["Code", "Carrier", "Type", "SCAC / IATA", "Contract", "Status"], rows: [["CAR-01","Maersk","Shipping line","MAEU","FY26 rate sheet","Active"],["CAR-02","Ocean Network Express","Shipping line","ONEY","Spot","Active"],["CAR-03","SriLankan Airlines Cargo","Airline","UL / 603","FY26 GSA","Active"],["CAR-04","Emirates SkyCargo","Airline","EK / 176","Spot","Active"],["CAR-05","Thai Airways Cargo","Airline","TG / 217","Spot","Active"],["CAR-06","Lanka Haulage","Road haulier","—","Monthly","Active"]] },
  "Ports & Airports": { cols: ["UN/LOCODE", "Name", "Type", "Country", "Terminal", "Status"], rows: [["LKCMB","Colombo","Seaport","Sri Lanka","JCT / SAGT / CICT","Active"],["LKCMB","Bandaranaike Intl (CMB)","Airport","Sri Lanka","Cargo Village","Active"],["AEJEA","Jebel Ali","Seaport","UAE","T1","Active"],["SGSIN","Singapore","Seaport","Singapore","PSA Pasir Panjang","Active"],["INMAA","Chennai","Seaport","India","CCTL","Active"],["NLRTM","Rotterdam","Seaport","Netherlands","APM Maasvlakte","Active"]] },
  "Warehouses": { cols: ["Code", "Warehouse", "Type", "Location", "Bays", "Status"], rows: [["WH-01","Peliyagoda CFS","CFS / devanning","Peliyagoda","12","Active"],["WH-02","Katunayake Air Shed","Air cargo","Katunayake","6","Active"],["WH-03","Biyagama Bonded","Bonded","Biyagama BOI","20","Active"]] },
  "Commodities & HS": { cols: ["HS code", "Description", "Category", "Hazmat", "Temp", "Status"], rows: [["7208.51","Flat-rolled steel plates","Metals","No","Ambient","Active"],["8528.72","Television receivers","Electronics","No","Ambient","Active"],["3004.90","Medicaments, packaged","Pharma","No","2–8 °C","Active"],["0902.30","Black tea, packed ≤3 kg","Food","No","Ambient","Active"],["5305.00","Coconut (coir) fibre","Fibre","No","Ambient","Active"],["8507.60","Lithium-ion batteries","Electronics","UN3480","Ambient","Active"]] },
  "Container types": { cols: ["ISO code", "Type", "Max payload", "CBM", "Mode", "Status"], rows: [["22G1","20' Dry","28,200 kg","33.2","Sea","Active"],["45G1","40' High Cube","28,600 kg","76.4","Sea","Active"],["22R1","20' Reefer","27,400 kg","28.3","Sea","Active"],["AKE","LD3 ULD","1,588 kg","4.3","Air","Active"],["PMC","PMC pallet","6,804 kg","11.5","Air","Active"]] },
  "Charges": { cols: ["Code", "Charge", "Basis", "Currency", "Default rate", "Status"], rows: [["OFR","Ocean freight","Per container","USD","1,250.00","Active"],["AFR","Air freight","Per chargeable kg","USD","2.85","Active"],["THC","Terminal handling (CMB)","Per container","LKR","42,500.00","Active"],["DO","Delivery order fee","Per BL","LKR","15,000.00","Active"],["DVN","Devanning / CFS","Per CBM","LKR","3,200.00","Active"],["CLR","Customs clearance (CHA)","Per entry","LKR","18,000.00","Active"]] },
};
export const packages = Array.from({ length: 12 }, (_, i) => ({ no: `PKG-${String(i + 1).padStart(3, "0")}`, desc: i < 8 ? "LED TV 55\" (carton)" : "LED TV 65\" (carton)", marks: `SNG/CMB/${i + 1}`, declKg: i < 8 ? 24.5 : 36.0, dims: i < 8 ? "140×85×18" : "162×98×20" }));
