"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Edges, Html } from "@react-three/drei";
import type { Placed } from "@/lib/pack";
export default function Load3D({ space, placed, colorBy, palette, cog = { x: space.L / 2, y: space.W / 2 } }: { space: { L: number; W: number; H: number }; placed: Placed[]; colorBy: "group" | "sku"; palette: Record<string, string>; cog?: { x: number; y: number } }) {
  const s = 0.01; // cm -> m
  const L = space.L * s, W = space.W * s, H = space.H * s;
  const dist = Math.max(L, 3) * 1.1;
  return <Canvas gl={{ preserveDrawingBuffer: true }} camera={{ position: [dist * 0.8, dist * 0.55, dist * 0.8], fov: 35 }} dpr={[1, 2]} frameloop="demand" style={{ background: "hsl(var(--muted))" }}>
    <ambientLight intensity={0.7} /><directionalLight position={[5, 10, 5]} intensity={1} />
    <group position={[-L / 2, 0, -W / 2]}>
      <mesh position={[L / 2, H / 2, W / 2]}><boxGeometry args={[L, H, W]} /><meshStandardMaterial color="#0F7C7A" transparent opacity={0.06} /><Edges color="#64748B" /></mesh>
      <mesh position={[L / 2, -0.01, W / 2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[L, W]} /><meshStandardMaterial color="#C9B9A3" /></mesh>
      {placed.map(p => <mesh key={p.id} position={[(p.x + p.L / 2) * s, (p.z + p.h / 2) * s, (p.y + p.W / 2) * s]}><boxGeometry args={[p.L * s * 0.98, p.h * s * 0.98, p.W * s * 0.98]} /><meshStandardMaterial color={palette[colorBy === "sku" ? p.sku : p.group] ?? p.color} roughness={0.8} metalness={0} /><Edges color="#0E1630" />{p.stack === false && <mesh position={[0, p.h * s * 0.495, 0]}><boxGeometry args={[p.L * s * 0.98, 0.01, p.W * s * 0.98]} /><meshStandardMaterial color="#E39B2D" /></mesh>}</mesh>)}
      <Html position={[L + 0.1, H * 0.9, W / 2]} center><span style={{ background: "#E39B2D", color: "#0E1630", fontSize: 10, fontWeight: 600, padding: "1px 5px", borderRadius: 4 }}>DOOR</span></Html>
      <mesh position={[cog.x * s, 0.02, cog.y * s]}><cylinderGeometry args={[0.08, 0.08, 0.02, 24]} /><meshStandardMaterial color="#C0623B" /></mesh>
    </group>
    <gridHelper args={[Math.max(L, W) * 1.6, 20, "#cbd5e1", "#e2e8f0"]} position={[0, -0.02, 0]} />
    <OrbitControls makeDefault enableDamping maxPolarAngle={Math.PI / 2.05} />
  </Canvas>;
}
