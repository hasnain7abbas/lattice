import { useSpring, animated } from "@react-spring/three";
import { useMemo } from "react";
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
  return (
    <animated.group position={pos as unknown as [number, number, number]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[el.radius * 0.55 * scale, 32, 32]} />
        <animated.meshStandardMaterial
          color={el.color}
          roughness={0.4}
          metalness={0.1}
          emissive={el.color}
          emissiveIntensity={sel.to((v) => 0.05 + v * 0.6) as any}
        />
      </mesh>
      {selected && (
        <mesh>
          <sphereGeometry args={[el.radius * 0.62 * scale, 24, 24]} />
          <meshBasicMaterial color="#7df9ff" wireframe opacity={0.6} transparent />
        </mesh>
      )}
    </animated.group>
  );
}
