export type Vec3 = [number, number, number];

export type LatticeVectors = {
  a: Vec3;
  b: Vec3;
  c: Vec3;
};

export type LatticeParams = {
  a: number; b: number; c: number;
  alpha: number; beta: number; gamma: number; // degrees
};

export type BasisAtom = {
  element: string;
  /** Fractional coords in [0,1) */
  frac: Vec3;
};

export type Structure = {
  id: string;
  name: string;
  blurb: string;
  params: LatticeParams;
  basis: BasisAtom[];
  /** Optional override of lattice vectors (otherwise derived from params) */
  lattice?: LatticeVectors;
};

export type Atom = {
  element: string;
  /** Cartesian position (Å) */
  position: Vec3;
  /** Fractional coords */
  frac: Vec3;
  /** Stable id across supercell rebuilds */
  key: string;
};
