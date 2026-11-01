"use client";
import { useEffect, useState } from "react";
/** Small localStorage-backed state shared across components (v4 mock features). */
export function usePersist<T>(key: string, init: T): [T, (v: T | ((p: T) => T)) => void] {
  const K = "tc-v4-" + key;
  const [v, setV] = useState<T>(init);
  useEffect(() => {
    try { const s = localStorage.getItem(K); if (s) setV(JSON.parse(s)); } catch { /* ignore */ }
    const h = (e: Event) => { const d = (e as CustomEvent).detail; if (d?.k === K) setV(d.v); };
    window.addEventListener("tc-persist", h); return () => window.removeEventListener("tc-persist", h);
  }, [K]);
  const set = (x: T | ((p: T) => T)) => setV(p => { const n = typeof x === "function" ? (x as (p: T) => T)(p) : x; try { localStorage.setItem(K, JSON.stringify(n)); } catch { /* ignore */ } setTimeout(() => window.dispatchEvent(new CustomEvent("tc-persist", { detail: { k: K, v: n } })), 0); return n; });
  return [v, set];
}
