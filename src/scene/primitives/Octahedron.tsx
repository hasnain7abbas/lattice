import { useMemo } from "react";
import * as THREE from "three";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";
import { getElement } from "../../data/elements";
import type { Vec3 } from "../../lib/crystal/types";

type Props = {
  /** The 6 anion (oxygen) positions that make up the octahedron corners. */
  vertices: Vec3[];
  /** B-site element symbol — sets the polyhedron colour. */
  element: string;
};

/**
 * Renders one BO₆ coordination octahedron as a translucent polyhedron with
 * highlighted edges. Drawing the cage (rather than loose spheres) is what makes
 * the octahedral *tilting* obvious: the whole solid visibly rotates as the
 * tolerance factor drops.
 */
export function OctahedronMesh({ vertices, element }: Props) {
  const el = getElement(element);
  const geom = useMemo(() => {
    if (vertices.length < 4) return null;
    try {
      return new ConvexGeometry(vertices.map((v) => new THREE.Vector3(v[0], v[1], v[2])));
    } catch {
      return null;
    }
  }, [vertices]);

  const edges = useMemo(() => (geom ? new THREE.EdgesGeometry(geom, 1) : null), [geom]);
  if (!geom || !edges) return null;

  return (
    <group>
      <mesh geometry={geom}>
        <meshPhysicalMaterial
          color={el.color}
          transparent
          opacity={0.26}
          roughness={0.45}
          metalness={0.1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={el.color} transparent opacity={0.92} />
      </lineSegments>
    </group>
  );
}
