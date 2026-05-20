import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { LatticeVectors, Vec3 } from "../../lib/crystal/types";

type Props = {
  lattice: LatticeVectors;
  n?: [number, number, number];
  color?: string;
};

function add(...v: Vec3[]): Vec3 {
  return v.reduce<Vec3>((acc, cur) => [acc[0] + cur[0], acc[1] + cur[1], acc[2] + cur[2]], [0, 0, 0]);
}
function scale(v: Vec3, s: number): Vec3 { return [v[0] * s, v[1] * s, v[2] * s]; }

export function UnitCellWireframe({ lattice, n = [1, 1, 1], color = "#7df9ff" }: Props) {
  const matRef = useRef<THREE.LineBasicMaterial>(null);
  const lines = useMemo(() => {
    const segs: Vec3[] = [];
    for (let i = 0; i < n[0]; i++) {
      for (let j = 0; j < n[1]; j++) {
        for (let k = 0; k < n[2]; k++) {
          const o: Vec3 = add(scale(lattice.a, i), scale(lattice.b, j), scale(lattice.c, k));
          const A = lattice.a, B = lattice.b, C = lattice.c;
          const verts: Vec3[] = [
            o, add(o, A),
            o, add(o, B),
            o, add(o, C),
            add(o, A), add(o, A, B),
            add(o, A), add(o, A, C),
            add(o, B), add(o, A, B),
            add(o, B), add(o, B, C),
            add(o, C), add(o, A, C),
            add(o, C), add(o, B, C),
            add(o, A, B), add(o, A, B, C),
            add(o, A, C), add(o, A, B, C),
            add(o, B, C), add(o, A, B, C),
          ];
          segs.push(...verts);
        }
      }
    }
    const arr = new Float32Array(segs.length * 3);
    for (let i = 0; i < segs.length; i++) {
      arr[i * 3] = segs[i][0];
      arr[i * 3 + 1] = segs[i][1];
      arr[i * 3 + 2] = segs[i][2];
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return geom;
  }, [lattice, n]);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.opacity = 0.35 + Math.sin(clock.elapsedTime * 1.2) * 0.08;
    }
  });

  return (
    <lineSegments geometry={lines}>
      <lineBasicMaterial ref={matRef} color={color} transparent opacity={0.4} />
    </lineSegments>
  );
}
