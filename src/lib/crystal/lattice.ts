import type { Atom, BasisAtom, LatticeParams, LatticeVectors, Structure, Vec3 } from "./types";

const DEG = Math.PI / 180;

export function paramsToVectors(p: LatticeParams): LatticeVectors {
  const ca = Math.cos(p.alpha * DEG);
  const cb = Math.cos(p.beta * DEG);
  const cg = Math.cos(p.gamma * DEG);
  const sg = Math.sin(p.gamma * DEG);

  const ax: Vec3 = [p.a, 0, 0];
  const bx: Vec3 = [p.b * cg, p.b * sg, 0];
  const cx_x = p.c * cb;
  const cx_y = (p.c * (ca - cb * cg)) / sg;
  const cx_z = Math.sqrt(Math.max(0, p.c * p.c - cx_x * cx_x - cx_y * cx_y));
  const cx: Vec3 = [cx_x, cx_y, cx_z];
  return { a: ax, b: bx, c: cx };
}

export function fracToCart(f: Vec3, L: LatticeVectors): Vec3 {
  return [
    f[0] * L.a[0] + f[1] * L.b[0] + f[2] * L.c[0],
    f[0] * L.a[1] + f[1] * L.b[1] + f[2] * L.c[1],
    f[0] * L.a[2] + f[1] * L.b[2] + f[2] * L.c[2],
  ];
}

export function getLatticeVectors(s: Structure): LatticeVectors {
  return s.lattice ?? paramsToVectors(s.params);
}

export function buildSupercell(s: Structure, n: [number, number, number]): Atom[] {
  const L = getLatticeVectors(s);
  const out: Atom[] = [];
  for (let i = 0; i < n[0]; i++) {
    for (let j = 0; j < n[1]; j++) {
      for (let k = 0; k < n[2]; k++) {
        for (let bi = 0; bi < s.basis.length; bi++) {
          const ba: BasisAtom = s.basis[bi];
          const f: Vec3 = [ba.frac[0] + i, ba.frac[1] + j, ba.frac[2] + k];
          out.push({
            element: ba.element,
            frac: f,
            position: fracToCart(f, L),
            key: `${bi}-${i}-${j}-${k}`,
          });
        }
      }
    }
  }
  return out;
}

/** Center the supercell on origin by subtracting the geometric mean of its corners. */
export function supercellCenter(s: Structure, n: [number, number, number]): Vec3 {
  const L = getLatticeVectors(s);
  const c: Vec3 = [
    (n[0] * (L.a[0] + L.b[0] + L.c[0]) / 2),
    (n[1] * (L.a[1] + L.b[1] + L.c[1]) / 2),
    (n[2] * (L.a[2] + L.b[2] + L.c[2]) / 2),
  ];
  // Simpler: just average the 8 corner positions assuming axis-aligned-ish.
  return [
    (n[0] * L.a[0] + n[1] * L.b[0] + n[2] * L.c[0]) / 2,
    (n[0] * L.a[1] + n[1] * L.b[1] + n[2] * L.c[1]) / 2,
    (n[0] * L.a[2] + n[1] * L.b[2] + n[2] * L.c[2]) / 2,
  ];
  void c;
}

export function distance(a: Vec3, b: Vec3): number {
  const dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** Interpolate two structures' lattice params and basis (assumes same basis order). */
export function lerpStructure(a: Structure, b: Structure, t: number): Structure {
  const u = 1 - t;
  const params: LatticeParams = {
    a: u * a.params.a + t * b.params.a,
    b: u * a.params.b + t * b.params.b,
    c: u * a.params.c + t * b.params.c,
    alpha: u * a.params.alpha + t * b.params.alpha,
    beta: u * a.params.beta + t * b.params.beta,
    gamma: u * a.params.gamma + t * b.params.gamma,
  };
  // Match basis by index if same length, else just use a's basis interpolated to nearest in b.
  const basis: BasisAtom[] = a.basis.map((ba, i) => {
    const bb = b.basis[i] ?? ba;
    return {
      element: t < 0.5 ? ba.element : bb.element,
      frac: [
        u * ba.frac[0] + t * bb.frac[0],
        u * ba.frac[1] + t * bb.frac[1],
        u * ba.frac[2] + t * bb.frac[2],
      ],
    };
  });
  return { id: `${a.id}->${b.id}@${t.toFixed(2)}`, name: `${a.name} → ${b.name}`, blurb: "", params, basis };
}
