// Rich client-side PDF writer: text (Helvetica / bold), lines, rectangles and embedded JPEG images.
export type Op =
  | { t: "text"; x: number; y: number; s: number; text: string; bold?: boolean }
  | { t: "img"; x: number; y: number; w: number; h: number; img: Jpeg }
  | { t: "rect"; x: number; y: number; w: number; h: number; lw?: number; fill?: boolean }
  | { t: "line"; x1: number; y1: number; x2: number; y2: number; lw?: number };
export type Jpeg = { bytes: Uint8Array; w: number; h: number };
const esc = (t: string) => t.replace(/[\\()]/g, m => "\\" + m).replace(/[^\x20-\x7E]/g, "-");
const enc = (s: string) => new TextEncoder().encode(s);

export function richPdf(pages: Op[][], size: [number, number] = [595, 842]): Blob {
  const imgs: Jpeg[] = []; pages.forEach(p => p.forEach(o => { if (o.t === "img" && !imgs.includes(o.img)) imgs.push(o.img); }));
  // object ids: 1 catalog, 2 pages, 3 F1, 4 F2, then images, then page+content pairs
  const objs: (string | Uint8Array[])[] = ["<< /Type /Catalog /Pages 2 0 R >>", "", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"];
  const imgId = (im: Jpeg) => 5 + imgs.indexOf(im);
  imgs.forEach(im => objs.push([enc(`<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.bytes.length} >>\nstream\n`), im.bytes, enc("\nendstream")]));
  const kids: number[] = []; const xo = imgs.map(im => `/Im${imgId(im)} ${imgId(im)} 0 R`).join(" ");
  pages.forEach(ops => {
    const body = ops.map(o => o.t === "text" ? `BT /${o.bold ? "F2" : "F1"} ${o.s} Tf ${o.x} ${o.y} Td (${esc(o.text)}) Tj ET`
      : o.t === "img" ? `q ${o.w} 0 0 ${o.h} ${o.x} ${o.y} cm /Im${imgId(o.img)} Do Q`
      : o.t === "rect" ? `${o.lw ?? 1} w ${o.x} ${o.y} ${o.w} ${o.h} re ${o.fill ? "f" : "S"}`
      : `${o.lw ?? 1} w ${o.x1} ${o.y1} m ${o.x2} ${o.y2} l S`).join("\n");
    const pid = objs.length + 1; kids.push(pid);
    objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${size[0]} ${size[1]}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << ${xo} >> >> /Contents ${pid + 1} 0 R >>`, `<< /Length ${enc(body).length} >>\nstream\n${body}\nendstream`);
  });
  objs[1] = `<< /Type /Pages /Kids [${kids.map(k => `${k} 0 R`).join(" ")}] /Count ${kids.length} >>`;
  const parts: Uint8Array[] = []; let len = 0; const push = (u: Uint8Array) => { parts.push(u); len += u.length; };
  push(enc("%PDF-1.4\n")); const off: number[] = [];
  objs.forEach((o, i) => { off.push(len); push(enc(`${i + 1} 0 obj\n`)); if (typeof o === "string") push(enc(o)); else o.forEach(push); push(enc("\nendobj\n")); });
  const x = len; push(enc(`xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${off.map(o => String(o).padStart(10, "0") + " 00000 n \n").join("")}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`));
  return new Blob(parts as BlobPart[], { type: "application/pdf" });
}

export function canvasToJpeg(c: HTMLCanvasElement, q = 0.92): Jpeg {
  // flatten onto white (JPEG has no alpha)
  const w = document.createElement("canvas"); w.width = c.width; w.height = c.height; const g = w.getContext("2d")!; g.fillStyle = "#fff"; g.fillRect(0, 0, w.width, w.height); g.drawImage(c, 0, 0);
  const b64 = w.toDataURL("image/jpeg", q).split(",")[1]; const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return { bytes: u, w: w.width, h: w.height };
}
export async function urlToJpeg(url: string, maxW = 1200): Promise<Jpeg> {
  const im = new Image(); im.src = url; await im.decode(); const k = Math.min(1, maxW / im.naturalWidth);
  const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(im.naturalWidth * k)); c.height = Math.max(1, Math.round(im.naturalHeight * k)); c.getContext("2d")!.drawImage(im, 0, 0, c.width, c.height); return canvasToJpeg(c);
}
/** GS1-128 barcode for an SSCC with AI (00), rendered by bwip-js. */
export async function ssccBarcode(sscc: string): Promise<Jpeg> {
  const bwip = (await import("bwip-js/browser")).default as unknown as { toCanvas: (c: HTMLCanvasElement, o: Record<string, unknown>) => HTMLCanvasElement };
  const c = document.createElement("canvas"); bwip.toCanvas(c, { bcid: "gs1-128", text: `(00)${sscc}`, scale: 4, height: 22, includetext: false, paddingwidth: 10, paddingheight: 4, backgroundcolor: "FFFFFF" });
  return canvasToJpeg(c, 1);
}
export type PalletLabel = { sscc: string; human: string; from: string; to: string; sku: string; cartons: number; kg: number; h: number; flags: string; idx: string; so: string };
/** One A6 (298 x 420 pt) GS1 logistic label per pallet. */
export async function palletLabelsPdf(labels: PalletLabel[]): Promise<Blob> {
  const pages: Op[][] = [];
  for (const l of labels) {
    const bc = await ssccBarcode(l.sscc); const bw = 270, bh = Math.round(bw * bc.h / bc.w);
    const o: Op[] = [{ t: "rect", x: 8, y: 8, w: 282, h: 404, lw: 1.5 },
      { t: "text", x: 16, y: 392, s: 8, text: "FROM" }, { t: "text", x: 16, y: 380, s: 10, bold: true, text: l.from },
      { t: "text", x: 160, y: 392, s: 8, text: "SHIP TO" }, ...l.to.split(" / ").slice(0, 2).map((t, i) => ({ t: "text", x: 160, y: 380 - i * 11, s: i ? 8 : 10, bold: !i, text: t.slice(0, 24) }) as Op),
      { t: "line", x1: 8, y1: 368, x2: 290, y2: 368 },
      { t: "text", x: 16, y: 352, s: 8, text: "SSCC" }, { t: "text", x: 16, y: 334, s: 15, bold: true, text: l.human },
      { t: "text", x: 16, y: 312, s: 8, text: "CONTENT (SKU)" }, { t: "text", x: 16, y: 298, s: 11, bold: true, text: l.sku },
      { t: "text", x: 160, y: 312, s: 8, text: "CARTONS" }, { t: "text", x: 160, y: 298, s: 11, bold: true, text: String(l.cartons) },
      { t: "text", x: 16, y: 280, s: 8, text: "GROSS WEIGHT" }, { t: "text", x: 16, y: 266, s: 11, bold: true, text: `${l.kg} kg` },
      { t: "text", x: 160, y: 280, s: 8, text: "HEIGHT" }, { t: "text", x: 160, y: 266, s: 11, bold: true, text: `${l.h} cm` },
      { t: "text", x: 16, y: 250, s: 10, bold: true, text: l.flags || " " }, { t: "text", x: 160, y: 250, s: 8, text: `${l.so} - ${l.idx}` },
      { t: "line", x1: 8, y1: 238, x2: 290, y2: 238 },
      { t: "img", x: 14, y: 50, w: bw, h: Math.min(bh, 170), img: bc },
      { t: "text", x: 40, y: 32, s: 11, bold: true, text: `(00) ${l.sscc}` },
      { t: "text", x: 16, y: 16, s: 6, text: "GS1-128 logistic label. Prototype: illustrative GS1 company prefix 4790001." }];
    pages.push(o);
  }
  return richPdf(pages, [298, 420]);
}
/** Text pages followed by embedded photos (two per A4 page) with captions. */
export async function textWithPhotosPdf(title: string, lines: string[], photos: { url: string; caption: string }[]): Promise<Blob> {
  const pages: Op[][] = []; const per = 38;
  for (let i = 0; i < Math.max(1, lines.length); i += per) pages.push([{ t: "text", x: 50, y: 790, s: i ? 9 : 18, bold: !i, text: title }, ...lines.slice(i, i + per).map((l, k) => ({ t: "text", x: 50, y: 760 - k * 18, s: 11, text: l }) as Op)]);
  for (let i = 0; i < photos.length; i += 2) {
    const pg: Op[] = [{ t: "text", x: 50, y: 800, s: 12, bold: true, text: `${title} - photos ${i + 1}${photos[i + 1] ? "-" + (i + 2) : ""} of ${photos.length}` }];
    for (let k = 0; k < 2 && photos[i + k]; k++) { const im = await urlToJpeg(photos[i + k].url); const maxW = 495, maxH = 330; const sc = Math.min(maxW / im.w, maxH / im.h); const w = im.w * sc, h = im.h * sc; const top = 780 - k * 380;
      pg.push({ t: "img", x: 50, y: top - h, w, h, img: im }, { t: "text", x: 50, y: top - h - 16, s: 10, text: `Photo ${i + k + 1}: ${photos[i + k].caption}`.slice(0, 95) }); }
    pages.push(pg);
  }
  return richPdf(pages);
}
