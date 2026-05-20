import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense } from "react";
import { CrystalScene } from "./CrystalScene";
import { Effects } from "./Effects";

export function Viewport() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [6, 5, 8], fov: 38, near: 0.1, far: 200 }}
      style={{ background: "radial-gradient(ellipse at 50% 40%, #15151c 0%, #0a0a0c 70%)" }}
    >
      {/* Three-point lighting: warm key, cool fill, accent rim */}
      <ambientLight intensity={0.18} />
      <directionalLight position={[6, 8, 4]} intensity={1.1} color="#ffe4c4" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-6, 3, -4]} intensity={0.45} color="#88a0ff" />
      <directionalLight position={[0, -4, 6]} intensity={0.25} color="#7df9ff" />

      <Suspense fallback={null}>
        <CrystalScene />
        <Environment preset="city" environmentIntensity={0.25} background={false} />
      </Suspense>

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={2}
        maxDistance={60}
        rotateSpeed={0.7}
        autoRotate
        autoRotateSpeed={0.6}
      />

      <Effects />
    </Canvas>
  );
}
