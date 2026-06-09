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

/**
 * Marks a structure as an ABO₃ perovskite so it can accept A/B-site doping and
 * radius-driven distortion. Host radii are read from the perovskite catalog by
 * the A/B symbols; the values below describe the *undoped* host geometry.
 */
export type PerovskiteTag = {
  /** Host A-site cation (12-coordinate, the large corner cation). */
  A: string;
  /** Host B-site cation (6-coordinate, the small octahedral center). */
  B: string;
  /** Anion (oxygen). */
  X: string;
  /** Pseudo-cubic lattice parameter of the undoped host (Å). */
  baseA: number;
  /** Ferroelectric cation displacement of the host along [111], fractional. 0 = non-polar. */
  basePolar: number;
  /** Octahedral tilt of the host (degrees). 0 = untilted/cubic. */
  baseTilt: number;
};

export type Structure = {
  id: string;
  name: string;
  blurb: string;
  params: LatticeParams;
  basis: BasisAtom[];
  /** Optional override of lattice vectors (otherwise derived from params) */
  lattice?: LatticeVectors;
  /** Present iff this is an ABO₃ perovskite that supports doping/distortion. */
  perovskite?: PerovskiteTag;
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
