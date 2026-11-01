"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Edges, Html, ContactShadows } from "@react-three/drei";
import type { Placed } from "@/lib/pack";
export default function Load3D({ space, placed, colorBy, palette, cog = { x: space.L / 2, y: space.W / 2 }, view = "iso", upto, highlight }: { upto?: number; highlight?: string; view?: "iso" | "top" | "side" | "door"; space: { L: number; W: number; H: number }; placed: Placed[]; colorBy: "group" | "sku"; palette: Record<string, string>; cog?: { x: number; y: number } }) {
  const s = 0.01; // cm -> m
  const L = space.L * s, W = space.W * s, H = space.H * s;
  const dist = Math.max(L, 3) * 1.1;
  const cam: Record<string, [number, number, number]> = { iso: [dist * 0.8, dist * 0.55, dist * 0.8], top: [0, dist * 1.5, 0.001], side: [0, H * 0.5, dist * 1.35], door: [dist * 1.2, H * 0.55, 0] };
  return <Canvas key={view} gl={{ preserveDrawingBuffer: true }} camera={{ position: cam[view], fov: 35 }} dpr={[1, 2]} frameloop="demand" style={{ background: "hsl(var(--muted))" }}>
    <hemisphereLight args={["#f8fafc", "#8b7355", 0.65]} /><ambientLight intensity={0.25} /><directionalLight position={[6, 12, 4]} intensity={1.15} /><directionalLight position={[-6, 5, -4]} intensity={0.35} color="#cfe8ff" />
    <ContactShadows position={[0, -0.015, 0]} scale={Math.max(L, W) * 1.6} blur={2.4} opacity={0.35} far={H * 1.5} />
    <group position={[-L / 2, 0, -W / 2]}>
      <mesh position={[L / 2, H / 2, W / 2]}><boxGeometry args={[L, H, W]} /><meshPhysicalMaterial color="#9fb8c4" transparent opacity={0.1} roughness={0.35} metalness={0.4} clearcoat={0.6} /><Edges color="#475569" /></mesh>
      <mesh position={[L / 2, -0.01, W / 2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[L, W]} /><meshStandardMaterial color="#C9B9A3" /></mesh>
      {(upto === undefined ? placed : placed.slice(0, upto)).map(p => <mesh key={p.id} position={[(p.x + p.L / 2) * s, (p.z + p.h / 2) * s, (p.y + p.W / 2) * s]}><boxGeometry args={[p.L * s * 0.98, p.h * s * 0.98, p.W * s * 0.98]} /><meshStandardMaterial color={palette[colorBy === "sku" ? p.sku : p.group] ?? p.color} roughness={0.55} metalness={0.05} emissive={highlight === p.id ? "#E39B2D" : "#000000"} emissiveIntensity={highlight === p.id ? 0.6 : 0} transparent={!!highlight && highlight !== p.id} opacity={highlight && highlight !== p.id ? 0.35 : 1} /><Edges color={highlight === p.id ? "#E39B2D" : "#0E1630"} />{p.stack === false && <mesh position={[0, p.h * s * 0.495, 0]}><boxGeometry args={[p.L * s * 0.98, 0.01, p.W * s * 0.98]} /><meshStandardMaterial color="#E39B2D" /></mesh>}</mesh>)}
      <Html position={[L + 0.1, H * 0.9, W / 2]} center><span style={{ background: "#E39B2D", color: "#0E1630", fontSize: 10, fontWeight: 600, padding: "1px 5px", borderRadius: 4 }}>DOOR</span></Html>
      <mesh position={[cog.x * s, 0.02, cog.y * s]}><cylinderGeometry args={[0.08, 0.08, 0.02, 24]} /><meshStandardMaterial color="#C0623B" /></mesh>
    </group>
    <gridHelper args={[Math.max(L, W) * 1.6, 20, "#cbd5e1", "#e2e8f0"]} position={[0, -0.02, 0]} />
    <OrbitControls makeDefault enableDamping maxPolarAngle={Math.PI / 2.05} />
  </Canvas>;
}
