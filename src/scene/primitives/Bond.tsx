import { useMemo } from "react";
import * as THREE from "three";
import { getElement } from "../../data/elements";
import type { Vec3 } from "../../lib/crystal/types";

type Props = {
  a: Vec3;
  b: Vec3;
  elementA: string;
  elementB: string;
  radius?: number;
};

export function Bond({ a, b, elementA, elementB, radius = 0.035 }: Props) {
  const { mid, length, quat, midPoint, mid2 } = useMemo(() => {
    const av = new THREE.Vector3(...a);
    const bv = new THREE.Vector3(...b);
    const mid = av.clone().add(bv).multiplyScalar(0.5);
    const dir = bv.clone().sub(av);
    const length = dir.length();
    const up = new THREE.Vector3(0, 1, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
    const mp1 = av.clone().add(mid).multiplyScalar(0.5);
    const mp2 = bv.clone().add(mid).multiplyScalar(0.5);
    return { mid, length, quat: q, midPoint: mp1, mid2: mp2 };
  }, [a, b]);

  const colA = getElement(elementA).color;
  const colB = getElement(elementB).color;
  const half = length / 2;

  return (
    <group>
      <mesh position={midPoint} quaternion={quat}>
        <cylinderGeometry args={[radius, radius, half, 16, 1, true]} />
        <meshStandardMaterial color={colA} roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh position={mid2} quaternion={quat}>
        <cylinderGeometry args={[radius, radius, half, 16, 1, true]} />
        <meshStandardMaterial color={colB} roughness={0.55} metalness={0.15} />
      </mesh>
      {/* invisible debug node consuming mid to satisfy ts */}
      <group position={mid} visible={false} />
    </group>
  );
}
