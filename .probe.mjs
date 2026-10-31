import { chromium } from "playwright";
const B="http://localhost:3200/", D="/workspace/cargo/qa/v3/";
const b = await chromium.launch({args:["--use-gl=swiftshader","--enable-unsafe-swiftshader"]});
const p = await b.newPage({viewport:{width:1440,height:900}});
const go=async r=>{await p.goto(B+r,{waitUntil:"networkidle"});await p.waitForTimeout(500);};
for (const r of ["login","dashboard","shipments/new","manufacturing/serialisation","manufacturing/palletising","manufacturing/packing-lists","manufacturing/load-plan","manufacturing/loading","unloading","verification","scan","portal/TC-SEA-24121","manufacturing/orders"]) {
  await go(r); await p.screenshot({path:D+"man-"+r.replace(/\//g,"_")+".png"});
  const txt=(await p.innerText("main").catch(()=>p.innerText("body"))).replace(/\s+/g," ").slice(0,700);
  console.log("##",r,"::",txt);
}
// QA-12 links in text
for (const r of ["manufacturing/palletising","manufacturing/packing-lists","manufacturing/loading"]) { await go(r);
  console.log("QA12",r, JSON.stringify(await p.$$eval("main a",as=>as.filter(a=>a.offsetParent).map(a=>[a.innerText.trim().slice(0,25),getComputedStyle(a).textDecorationLine]).slice(0,8)))); }
// QA-13 scan keyboard
await go("scan"); const sc=await p.$$eval("*",els=>els.filter(e=>{const s=getComputedStyle(e);return (s.overflowY=="auto"||s.overflowY=="scroll"||s.overflowX=="auto")&&e.scrollHeight>e.clientHeight+2}).map(e=>[e.tagName,e.getAttribute("tabindex"),e.getAttribute("role"),e.getAttribute("aria-label")]));
console.log("QA13 scrollables", JSON.stringify(sc));
for(let i=0;i<40;i++){await p.keyboard.press("Tab");}
console.log("QA13 focus after 40 tabs", await p.evaluate(()=>document.activeElement.outerHTML.slice(0,150)));
await b.close();
