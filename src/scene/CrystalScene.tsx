import { useMemo } from "react";
import { useScene } from "../stores/useScene";
import { getPreset } from "../data/presets";
import { buildSupercell, getLatticeVectors, lerpStructure, distance } from "../lib/crystal/lattice";
import { AtomMesh } from "./primitives/Atom";
import { Bond } from "./primitives/Bond";
import { UnitCellWireframe } from "./primitives/UnitCellWireframe";
import type { Vec3 } from "../lib/crystal/types";
import { getElement } from "../data/elements";

export function CrystalScene() {
  const currentId = useScene((s) => s.currentId);
  const previousId = useScene((s) => s.previousId);
  const morph = useScene((s) => s.morph);
  const supercell = useScene((s) => s.supercell);
  const showCell = useScene((s) => s.showCell);
  const showBonds = useScene((s) => s.showBonds);
  const selected = useScene((s) => s.selected);
  const select = useScene((s) => s.select);

  const structure = useMemo(() => {
    const cur = getPreset(currentId);
    if (!previousId || morph >= 1) return cur;
    const prev = getPreset(previousId);
    // Only morph if basis counts match — otherwise hard switch at midpoint.
    if (prev.basis.length === cur.basis.length) return lerpStructure(prev, cur, morph);
    return morph < 0.5 ? prev : cur;
  }, [currentId, previousId, morph]);

  const lattice = useMemo(() => getLatticeVectors(structure), [structure]);
  const atoms = useMemo(() => buildSupercell(structure, supercell), [structure, supercell]);

  // Center the whole scene so it sits at origin.
  const center: Vec3 = useMemo(() => {
    if (atoms.length === 0) return [0, 0, 0];
    let cx = 0, cy = 0, cz = 0;
    for (const a of atoms) { cx += a.position[0]; cy += a.position[1]; cz += a.position[2]; }
    return [cx / atoms.length, cy / atoms.length, cz / atoms.length];
  }, [atoms]);

  const bonds = useMemo(() => {
    if (!showBonds) return [];
    const out: { a: Vec3; b: Vec3; ea: string; eb: string }[] = [];
    // Quick distance threshold: ~1.15 × nearest-pair distance for the structure.
    // Heuristic — find min pair distance from first ~24 atoms vs all.
    let minD = Infinity;
    const sample = Math.min(24, atoms.length);
    for (let i = 0; i < sample; i++) {
      for (let j = 0; j < atoms.length; j++) {
        if (i === j) continue;
        const d = distance(atoms[i].position, atoms[j].position);
        if (d > 0.4 && d < minD) minD = d;
      }
    }
    if (!isFinite(minD)) return [];
    const cutoff = minD * 1.18;
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const d = distance(atoms[i].position, atoms[j].position);
        if (d > 0.3 && d <= cutoff) {
          out.push({ a: atoms[i].position, b: atoms[j].position, ea: atoms[i].element, eb: atoms[j].element });
        }
      }
    }
    // Cap to keep frame budget reasonable in big supercells.
    return out.slice(0, 800);
  }, [atoms, showBonds]);

  return (
    <group position={[-center[0], -center[1], -center[2]]}>
      {showCell && <UnitCellWireframe lattice={lattice} n={supercell} />}
      {atoms.map((a) => (
        <AtomMesh
          key={a.key}
          element={a.element}
          position={a.position}
          selected={selected === a.key}
          onClick={() => select(selected === a.key ? null : a.key)}
        />
      ))}
      {bonds.map((b, i) => (
        <Bond key={i} a={b.a} b={b.b} elementA={b.ea} elementB={b.eb} radius={Math.min(0.07, getElement(b.ea).radius * 0.18)} />
      ))}
    </group>
  );
}
