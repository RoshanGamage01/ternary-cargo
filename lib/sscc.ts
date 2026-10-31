// GS1 mod-10 check digit (weights 3,1 from the right) on 17 digits -> 18-digit SSCC
export function checkDigit(d17: string) {
  let sum = 0;
  for (let i = 0; i < d17.length; i++) { const n = +d17[d17.length - 1 - i]; sum += n * (i % 2 === 0 ? 3 : 1); }
  return String((10 - (sum % 10)) % 10);
}
// Illustrative GS1 company prefix (not a real allocation)
export const PREFIX = "4790001";
export function makeSSCC(ext: number, serial: number) {
  const s17 = `${ext}${PREFIX}${String(serial).padStart(17 - 1 - PREFIX.length, "0")}`;
  return s17 + checkDigit(s17);
}
export const fmtSSCC = (s: string) => `(00) ${s.slice(0, 1)} ${s.slice(1, 8)} ${s.slice(8, 17)} ${s.slice(17)}`;
/** ISO 6346 container number check digit (e.g. MSKU 774120 3). Returns null if format is wrong. */
export function iso6346(raw: string): { ok: boolean; expected?: number } | null {
  const c = raw.replace(/\s/g, "").toUpperCase(); if (!/^[A-Z]{4}\d{7}$/.test(c)) return null;
  const val = (ch: string) => { if (/\d/.test(ch)) return +ch; let v = ch.charCodeAt(0) - 55; for (const s of [11, 22, 33]) if (v >= s) v++; return v; };
  const sum = c.slice(0, 10).split("").reduce((a, ch, i) => a + val(ch) * 2 ** i, 0); const exp = (sum % 11) % 10;
  return { ok: exp === +c[10], expected: exp };
}
