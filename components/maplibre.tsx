"use client";
import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
/** Route map on MapLibre GL (public demo tiles; production needs a commercial tile provider). */
export default function LiveMap({ a, b, progress, labels, onFail }: { a: [number, number]; b: [number, number]; progress: number; labels: [string, string]; onFail?: () => void }) {
  const el = useRef<HTMLDivElement>(null); const [ok, setOk] = useState(true); const [go, setGo] = useState(false);
  useEffect(() => { let t: ReturnType<typeof setTimeout>; const start = () => { t = setTimeout(() => setGo(true), 600); }; if (document.readyState === "complete") start(); else window.addEventListener("load", start, { once: true }); return () => { clearTimeout(t); window.removeEventListener("load", start); }; }, []);
  useEffect(() => {
    if (!go || !el.current) return; let map: maplibregl.Map;
    try { (maplibregl as unknown as { setWorkerUrl?: (u: string) => void }).setWorkerUrl?.("/maplibre-gl-worker.mjs"); } catch { /* default worker */ }
    try { map = new maplibregl.Map({ container: el.current, style: "https://demotiles.maplibre.org/style.json", bounds: [[Math.min(a[0], b[0]) - 8, Math.min(a[1], b[1]) - 6], [Math.max(a[0], b[0]) + 8, Math.max(a[1], b[1]) + 6]], attributionControl: { compact: true }, preserveDrawingBuffer: true } as maplibregl.MapOptions); }
    catch { setOk(false); onFail?.(); return; }
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    // gentle arc between ports
    const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - Math.abs(a[0] - b[0]) * 0.12];
    const pts: [number, number][] = Array.from({ length: 41 }, (_, i) => { const t = i / 40; return [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * mid[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * mid[1] + t * t * b[1]]; });
    const k = Math.round(Math.max(0, Math.min(1, progress)) * 40);
    map.on("load", () => {
      map.addSource("route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: pts } } });
      map.addLayer({ id: "route", type: "line", source: "route", paint: { "line-color": "#0F7C7A", "line-width": 3, "line-dasharray": [2, 1.5] } });
      map.addSource("done", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: pts.slice(0, Math.max(2, k + 1)) } } });
      map.addLayer({ id: "done", type: "line", source: "done", paint: { "line-color": "#0F7C7A", "line-width": 5 } });
    });
    const pin = (c: [number, number], color: string, text: string) => { const d = document.createElement("div"); d.style.cssText = `background:${color};color:#fff;font:600 11px Inter,sans-serif;padding:3px 8px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.25);white-space:nowrap`; d.textContent = text; new maplibregl.Marker({ element: d }).setLngLat(c).addTo(map); };
    pin(a, "#1F2A5C", labels[0]); pin(b, "#9A4A2A", labels[1]);
    const now = document.createElement("div"); now.setAttribute("role", "img"); now.setAttribute("aria-label", "Current position (estimate)"); now.style.cssText = "width:18px;height:18px;border-radius:50%;background:#E39B2D;border:3px solid #fff;box-shadow:0 0 0 6px rgba(227,155,45,.3)"; new maplibregl.Marker({ element: now }).setLngLat(pts[k]).addTo(map);
    map.on("error", () => {});
    return () => map.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go, a.join(), b.join(), progress, labels.join()]);
  return ok ? <div ref={el} className="h-full w-full bg-muted" role="region" aria-label={`Map: ${labels[0]} to ${labels[1]}`} /> : null;
}
