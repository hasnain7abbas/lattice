import { useSpring, animated } from "@react-spring/three";
import { useMemo } from "react";
import * as THREE from "three";
import { getElement } from "../../data/elements";
import type { Vec3 } from "../../lib/crystal/types";
import { springs } from "../../lib/animation/springs";

type Props = {
  element: string;
  position: Vec3;
  selected?: boolean;
  scale?: number;
  onClick?: () => void;
};

export function AtomMesh({ element, position, selected, scale = 1, onClick }: Props) {
  const el = useMemo(() => getElement(element), [element]);
  const { pos, sel } = useSpring({
    pos: position,
    sel: selected ? 1 : 0,
    config: springs.atom,
  });
  const r = el.radius * 0.55 * scale;
  const rimColor = useMemo(() => {
    const c = new THREE.Color(el.color);
    const hsl = { h: 0, s: 0, l: 0 };
    c.getHSL(hsl);
    c.setHSL(hsl.h, Math.min(1, hsl.s * 0.6 + 0.2), Math.min(1, hsl.l + 0.35));
    return `#${c.getHexString()}`;
  }, [el.color]);
  return (
    <animated.group position={pos as unknown as [number, number, number]}>
      {/* Core sphere — glossy with clearcoat highlight */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[r, 48, 48]} />
        <animated.meshPhysicalMaterial
          color={el.color}
          roughness={0.32}
          metalness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.18}
          reflectivity={0.5}
          emissive={el.color}
          emissiveIntensity={sel.to((v) => 0.03 + v * 0.55) as any}
        />
      </mesh>
      {/* Soft rim / atmosphere — outer back-rendered shell for a subtle halo */}
      <mesh scale={1.08}>
        <sphereGeometry args={[r, 24, 24]} />
        <meshBasicMaterial
          color={rimColor}
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {selected && (
        <mesh>
          <sphereGeometry args={[r * 1.13, 24, 24]} />
          <meshBasicMaterial color="#7df9ff" wireframe opacity={0.6} transparent />
        </mesh>
      )}
    </animated.group>
  );
}
