import { useMemo } from "react";
import { useScene } from "../stores/useScene";
import { getPreset } from "../data/presets";
import { buildSupercell, getLatticeVectors, lerpStructure, distance } from "../lib/crystal/lattice";
import { derivePerovskite, applyPerovskiteDistortion } from "../lib/crystal/perovskite";
import { AtomMesh } from "./primitives/Atom";
import { Bond } from "./primitives/Bond";
import { OctahedronMesh } from "./primitives/Octahedron";
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
  const showAllSites = useScene((s) => s.showAllSites);
  const showOctahedra = useScene((s) => s.showOctahedra);
  const selected = useScene((s) => s.selected);
  const select = useScene((s) => s.select);
  const doping = useScene((s) => s.doping);

  const baseStructure = useMemo(() => {
    const cur = getPreset(currentId);
    if (!previousId || morph >= 1) return cur;
    const prev = getPreset(previousId);
    // Only morph if basis counts match — otherwise hard switch at midpoint.
    if (prev.basis.length === cur.basis.length) return lerpStructure(prev, cur, morph);
    return morph < 0.5 ? prev : cur;
  }, [currentId, previousId, morph]);

  // Resolve A/B-site doping into an effective (possibly resized) perovskite cell.
  const derived = useMemo(
    () => (baseStructure.perovskite ? derivePerovskite(baseStructure.perovskite, doping) : null),
    [baseStructure, doping],
  );

  const structure = useMemo(() => {
    if (!derived) return baseStructure;
    const a = derived.aPC;
    const ang = derived.cellAngle; // rhombohedral shear (90° = cubic)
    return {
      ...baseStructure,
      params: { ...baseStructure.params, a, b: a, c: a, alpha: ang, beta: ang, gamma: ang },
    };
  }, [baseStructure, derived]);

  const lattice = useMemo(() => getLatticeVectors(structure), [structure]);
  const atoms = useMemo(() => {
    const built = buildSupercell(structure, supercell, showAllSites);
    return derived ? applyPerovskiteDistortion(built, derived) : built;
  }, [structure, supercell, showAllSites, derived]);

  // BO₆ coordination octahedra (perovskites only) — drawn so tilting is visible.
  const octahedra = useMemo(() => {
    if (!derived || !showOctahedra) return [];
    const reach = derived.aPC * 0.85;
    const bAtoms = atoms.filter((a) => a.element === derived.B || a.element === derived.bDopant);
    const oAtoms = atoms.filter((a) => a.element === derived.X);
    const out: { vertices: Vec3[]; element: string; key: string }[] = [];
    for (const b of bAtoms) {
      const near = oAtoms
        .map((o) => ({ p: o.position, d: distance(b.position, o.position) }))
        .filter((x) => x.d <= reach)
        .sort((x, y) => x.d - y.d)
        .slice(0, 6);
      if (near.length >= 4) {
        out.push({ vertices: near.map((x) => x.p), element: b.element, key: b.key });
      }
    }
    return out.slice(0, 220);
  }, [atoms, derived, showOctahedra]);

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
      {octahedra.map((o) => (
        <OctahedronMesh key={o.key} vertices={o.vertices} element={o.element} />
      ))}
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
        <Bond key={i} a={b.a} b={b.b} elementA={b.ea} elementB={b.eb} radius={Math.min(0.042, getElement(b.ea).radius * 0.11)} />
      ))}
    </group>
  );
}
