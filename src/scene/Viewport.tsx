import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";
import { CrystalScene } from "./CrystalScene";
import { Effects } from "./Effects";
import { useIsMobile } from "../lib/useMediaQuery";
import { useTheme } from "../stores/useTheme";

export function Viewport() {
  const isMobile = useIsMobile();
  const theme = useTheme((s) => s.theme);
  const isDark = theme === "dark";

  return (
    <div className="absolute inset-0" style={{ background: "var(--canvas-bg)" }}>
      <Canvas
        shadows={!isMobile}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: isMobile ? [7, 6, 10] : [6, 5, 8], fov: isMobile ? 42 : 38, near: 0.1, far: 200 }}
      >
        <ambientLight intensity={isDark ? 0.18 : 0.35} />
        <directionalLight
          position={[6, 8, 4]}
          intensity={isDark ? 1.1 : 0.9}
          color={isDark ? "#ffe4c4" : "#fff5dc"}
          castShadow={!isMobile}
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-6, 3, -4]} intensity={isDark ? 0.45 : 0.5} color="#88a0ff" />
        <directionalLight position={[0, -4, 6]} intensity={0.25} color="#1d93ab" />

        <Suspense fallback={null}>
          <CrystalScene />
          <Environment preset={isDark ? "city" : "apartment"} environmentIntensity={isDark ? 0.25 : 0.4} background={false} />
        </Suspense>

        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          minDistance={2}
          maxDistance={60}
          rotateSpeed={isMobile ? 0.85 : 0.7}
          zoomSpeed={isMobile ? 0.9 : 1}
          autoRotate
          autoRotateSpeed={0.55}
          enablePan={!isMobile}
          touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
        />

        <Effects mobile={isMobile} />
      </Canvas>
    </div>
  );
}
