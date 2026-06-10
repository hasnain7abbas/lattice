import type { Atom, PerovskiteTag, Vec3 } from "./types";

/**
 * Perovskite (ABO₃) doping + distortion model.
 *
 * The geometry you see is driven by *real* Shannon ionic radii. Mixing a dopant
 * into the A or B site shifts the composition-weighted radii, which changes the
 * Goldschmidt tolerance factor t = (r_A + r_O) / (√2 · (r_B + r_O)). That single
 * number then drives three visible effects:
 *
 *   • cell size      — pseudo-cubic a grows/shrinks with the cation radii
 *   • octahedral tilt — t < 1 tips the BO₆ octahedra (antiphase a⁻a⁻a⁻ about [111])
 *   • polarization    — A-site doping suppresses the ferroelectric cation shift
 *
 * so BiFeO₃ visibly walks between rhombohedral, cubic and tilted/orthorhombic
 * regimes as you dope it. Radii are Shannon values: A-site in 12-coordination,
 * B-site in 6-coordination, O²⁻ ≈ 1.40 Å.
 */

export const R_OXYGEN = 1.4;
const SQRT2 = Math.SQRT2;

/** Shannon effective ionic radii (Å). A-site = CN 12, B-site = CN 6. */
export const IONIC_RADII: Record<string, number> = {
  // A-site cations (CN 12)
  Bi: 1.36,
  La: 1.36,
  Nd: 1.27,
  Sm: 1.24,
  Gd: 1.215,
  Sr: 1.44,
  Ca: 1.34,
  // B-site cations (CN 6)
  Fe: 0.645,
  Mn: 0.645,
  Co: 0.61,
  Cr: 0.615,
  Ti: 0.605,
  Ni: 0.6,
};

export type DopantCategory =
  | "Rare earth (lanthanide)"
  | "Alkaline earth"
  | "Transition metal";

export type Dopant = {
  symbol: string;
  name: string;
  site: "A" | "B";
  category: DopantCategory;
  /** Shannon ionic radius (Å) at the relevant coordination. */
  ionic: number;
  /** Common oxidation state in the oxide, for the readout. */
  charge: string;
};

/** Large cations that substitute on the A-site (replacing Bi). */
export const A_DOPANTS: Dopant[] = [
  { symbol: "La", name: "Lanthanum", site: "A", category: "Rare earth (lanthanide)", ionic: 1.36, charge: "3+" },
  { symbol: "Nd", name: "Neodymium", site: "A", category: "Rare earth (lanthanide)", ionic: 1.27, charge: "3+" },
  { symbol: "Sm", name: "Samarium", site: "A", category: "Rare earth (lanthanide)", ionic: 1.24, charge: "3+" },
  { symbol: "Gd", name: "Gadolinium", site: "A", category: "Rare earth (lanthanide)", ionic: 1.215, charge: "3+" },
  { symbol: "Sr", name: "Strontium", site: "A", category: "Alkaline earth", ionic: 1.44, charge: "2+" },
  { symbol: "Ca", name: "Calcium", site: "A", category: "Alkaline earth", ionic: 1.34, charge: "2+" },
];

/** Small cations that substitute on the B-site (replacing Fe). */
export const B_DOPANTS: Dopant[] = [
  { symbol: "Mn", name: "Manganese", site: "B", category: "Transition metal", ionic: 0.645, charge: "3+" },
  { symbol: "Co", name: "Cobalt", site: "B", category: "Transition metal", ionic: 0.61, charge: "3+" },
  { symbol: "Cr", name: "Chromium", site: "B", category: "Transition metal", ionic: 0.615, charge: "3+" },
  { symbol: "Ti", name: "Titanium", site: "B", category: "Transition metal", ionic: 0.605, charge: "4+" },
  { symbol: "Ni", name: "Nickel", site: "B", category: "Transition metal", ionic: 0.6, charge: "2+" },
];

export type Doping = {
  aDopant: string | null;
  /** A-site dopant fraction, 0..1 */
  xA: number;
  bDopant: string | null;
  /** B-site dopant fraction, 0..1 */
  xB: number;
};

export const NO_DOPING: Doping = { aDopant: null, xA: 0, bDopant: null, xB: 0 };

export type PerovskiteDerived = {
  A: string;
  B: string;
  X: string;
  aDopant: string | null;
  xA: number;
  bDopant: string | null;
  xB: number;
  /** Composition-weighted A / B ionic radii (Å). */
  rA: number;
  rB: number;
  /** Goldschmidt tolerance factor of the doped composition. */
  tolerance: number;
  /** Tolerance factor of the undoped host (for comparison). */
  hostTolerance: number;
  /** Pseudo-cubic lattice parameter (Å). */
  aPC: number;
  /** Octahedral antiphase tilt magnitude (degrees, physical-ish). */
  tiltDeg: number;
  /** Tilt actually rendered (exaggerated so it is legible). */
  renderTilt: number;
  /** Visualization cell angle α=β=γ (deg). 90 = cubic. */
  cellAngle: number;
  /** Ferroelectric cation displacement along [111], fractional. */
  polar: number;
  /** Human-readable formula, e.g. "Bi₀.₈₀La₀.₂₀FeO₃". */
  formula: string;
  /** Predicted symmetry/phase label. */
  phase: string;
};

/** Geometry in the 3D view is exaggerated by this factor so distortions read clearly. */
export const CLARITY_EXAGGERATION = 1.6;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const SUBS: Record<string, string> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉", ".": ".",
};
const sub = (s: string) => s.replace(/[0-9.]/g, (c) => SUBS[c] ?? c);

function sitePart(host: string, dopant: string | null, x: number): string {
  if (!dopant || x <= 0.0005) return host;
  const xh = (1 - x).toFixed(2);
  const xd = x.toFixed(2);
  return `${host}${sub(xh)}${dopant}${sub(xd)}`;
}

function classifyPhase(tolerance: number, tiltDeg: number, polar: number): string {
  if (polar > 0.02 && tiltDeg > 4) return "Rhombohedral R3c · polar (ferroelectric)";
  if (tiltDeg >= 9) return "Orthorhombic Pnma · tilted (GdFeO₃-type)";
  if (tiltDeg >= 2.5) return "Rhombohedral R3̄c · tilted";
  if (tolerance > 1.005) return "Tetragonal · A-site too large";
  return "Cubic Pm3̄m · undistorted";
}

/** Compute the doped geometry/labels for a perovskite host + doping state. */
export function derivePerovskite(tag: PerovskiteTag, dop: Doping): PerovskiteDerived {
  const rA0 = IONIC_RADII[tag.A] ?? 1.3;
  const rB0 = IONIC_RADII[tag.B] ?? 0.64;

  const rADop = dop.aDopant ? IONIC_RADII[dop.aDopant] ?? rA0 : rA0;
  const rBDop = dop.bDopant ? IONIC_RADII[dop.bDopant] ?? rB0 : rB0;

  const rA = lerp(rA0, rADop, dop.aDopant ? dop.xA : 0);
  const rB = lerp(rB0, rBDop, dop.bDopant ? dop.xB : 0);

  const tolerance = (rA + R_OXYGEN) / (SQRT2 * (rB + R_OXYGEN));
  const hostTolerance = (rA0 + R_OXYGEN) / (SQRT2 * (rB0 + R_OXYGEN));

  // a ≈ B–O bond (dominant) blended with A–O contribution. Exact at the host.
  const aPC =
    tag.baseA *
    (0.6 * ((rB + R_OXYGEN) / (rB0 + R_OXYGEN)) +
      0.4 * ((rA + R_OXYGEN) / (rA0 + R_OXYGEN)));

  // Lower tolerance → bigger octahedral tilt; higher → tips toward cubic.
  const tiltDeg = clamp(tag.baseTilt + 160 * (hostTolerance - tolerance), 0, 22);
  // Exaggerated values used purely for the 3D render so the eye can see them.
  const renderTilt = clamp(tiltDeg * CLARITY_EXAGGERATION, 0, 32);
  // Keep the cell shear illustrative rather than claiming a refined lattice.
  // The octahedra carry most of the visible tilt; a large shear (for example
  // 79° for pure BFO) would be crystallographically misleading.
  const cellAngle = 90 - clamp(renderTilt * 0.055, 0, 2);

  // A-site (rare-earth / alkaline-earth) substitution suppresses the Bi lone-pair
  // ferroelectric displacement; B-site doping dilutes it more weakly.
  const polar = Math.max(
    0,
    tag.basePolar * (1 - (dop.aDopant ? dop.xA : 0)) * (1 - 0.4 * (dop.bDopant ? dop.xB : 0)),
  );

  const formula =
    sitePart(tag.A, dop.aDopant, dop.aDopant ? dop.xA : 0) +
    sitePart(tag.B, dop.bDopant, dop.bDopant ? dop.xB : 0) +
    `${tag.X}${sub("3")}`;

  return {
    A: tag.A, B: tag.B, X: tag.X,
    aDopant: dop.aDopant, xA: dop.xA,
    bDopant: dop.bDopant, xB: dop.xB,
    rA, rB, tolerance, hostTolerance, aPC, tiltDeg, renderTilt, cellAngle, polar,
    formula,
    phase: classifyPhase(tolerance, tiltDeg, polar),
  };
}

const fmt = (n: number, p = 2) => n.toFixed(p);

/**
 * A plain-language, live cause → effect explanation of the current doping:
 * which cation went where, how its size moves the tolerance factor, and what
 * that does to the octahedra / cell. Drives the on-screen teaching label.
 */
export function explainDoping(tag: PerovskiteTag, dop: Doping, d: PerovskiteDerived): string[] {
  const lines: string[] = [];
  const rA0 = IONIC_RADII[tag.A] ?? 1.3;
  const rB0 = IONIC_RADII[tag.B] ?? 0.64;
  const aDoped = dop.aDopant && dop.xA > 0.005;
  const bDoped = dop.bDopant && dop.xB > 0.005;

  if (!aDoped && !bDoped) {
    if (tag.basePolar > 0 || tag.baseTilt > 0) {
      lines.push(
        `Pure ${tag.A}${tag.B}${tag.X}₃: the ${tag.A}³⁺ lone pair pushes the cations off-centre along [111] — it is ferroelectric.`,
      );
      lines.push(
        `The ${tag.B}${tag.X}₆ octahedra tilt ≈${fmt(d.tiltDeg, 0)}° in antiphase, shearing the cell into a rhombohedron (R3c).`,
      );
    } else {
      lines.push(
        `Pure ${tag.A}${tag.B}${tag.X}₃: tolerance factor t ≈ ${fmt(d.tolerance, 3)} ≈ 1, so the ${tag.B}${tag.X}₆ octahedra sit untilted — a cubic perovskite.`,
      );
    }
    return lines;
  }

  if (aDoped) {
    const r = IONIC_RADII[dop.aDopant!] ?? rA0;
    const diff = r - rA0;
    const size = Math.abs(diff) < 0.01 ? "almost the same size as" : diff > 0 ? "larger than" : "smaller than";
    const tDir = d.tolerance > d.hostTolerance + 0.0005 ? "rises" : d.tolerance < d.hostTolerance - 0.0005 ? "falls" : "barely moves";
    const geo =
      d.tolerance > d.hostTolerance + 0.0005
        ? "the octahedra straighten and the cell relaxes toward cubic"
        : d.tolerance < d.hostTolerance - 0.0005
          ? "the octahedra tilt further and the cell becomes more rhombohedral"
          : "the tilt is largely unchanged";
    lines.push(
      `A-site (${tag.A} → ${dop.aDopant}): ${dop.aDopant} (r=${fmt(r)} Å) is ${size} ${tag.A}³⁺ (r=${fmt(rA0)} Å).`,
    );
    lines.push(`→ tolerance t ${tDir} (${fmt(d.hostTolerance, 3)} → ${fmt(d.tolerance, 3)}); ${geo}.`);
    if (tag.basePolar > 0) {
      lines.push(
        d.polar > 0.005
          ? `→ replacing ${tag.A} dilutes the lone pair, so the polarization weakens.`
          : `→ the ${tag.A} lone pair is fully diluted: polarization is switched off.`,
      );
    }
  }

  if (bDoped) {
    const r = IONIC_RADII[dop.bDopant!] ?? rB0;
    const diff = r - rB0;
    const size = Math.abs(diff) < 0.01 ? "about the same size as" : diff > 0 ? "larger than" : "smaller than";
    lines.push(
      `B-site (${tag.B} → ${dop.bDopant}): ${dop.bDopant} (r=${fmt(r)} Å) is ${size} ${tag.B}³⁺ (r=${fmt(rB0)} Å), resizing the ${tag.B}${tag.X}₆ octahedron.`,
    );
    lines.push(
      `→ the cell ${d.aPC < tag.baseA - 0.002 ? "contracts" : d.aPC > tag.baseA + 0.002 ? "expands" : "holds"} (a = ${fmt(d.aPC, 3)} Å) and t shifts toward ${fmt(d.tolerance, 3)}.`,
    );
  }

  return lines;
}

/** Deterministic 0..1 hash so a given site keeps its dopant identity across rebuilds. */
function hash01(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

/** Strip the boundary-mirror suffix so a corner site and its 7 images stay in sync. */
function siteKey(key: string): string {
  const i = key.indexOf("-img");
  return i === -1 ? key : key.slice(0, i);
}

function selectedSites(atoms: Atom[], element: string, fraction: number, prefix: string): Set<string> {
  const keys = [...new Set(
    atoms
      .filter((at) => at.element === element)
      .map((at) => siteKey(at.key)),
  )];
  const count = Math.round(clamp(fraction, 0, 1) * keys.length);
  keys.sort((a, b) => hash01(`${prefix}:${a}`) - hash01(`${prefix}:${b}`));
  return new Set(keys.slice(0, count));
}

/** Parse the cell index (i+j+k) out of an atom key "bi-i-j-k[-img...]". */
function cellParity(key: string): number {
  const base = siteKey(key);
  const parts = base.split("-");
  const i = parseInt(parts[1], 10) || 0;
  const j = parseInt(parts[2], 10) || 0;
  const k = parseInt(parts[3], 10) || 0;
  return (i + j + k) & 1;
}

const distance = (a: Vec3, b: Vec3) => {
  const dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/**
 * Apply doping substitution + radius-driven distortion to a built supercell.
 * Mutates and returns the same array.
 *
 *   1. octahedral tilt — each oxygen is rotated about its nearest B-site cation
 *      by ±tiltDeg around [111], the sign alternating between neighbouring cells
 *      (antiphase a⁻a⁻a⁻, the BiFeO₃ tilt system).
 *   2. ferroelectric polarization — A and B cations shift together along [111]
 *      while oxygens stay put, opening the off-centring that makes BFO polar.
 *   3. solid-solution substitution — a deterministic fraction of A / B sites are
 *      relabelled to the dopant so colour and (visual) size change on those sites.
 */
export function applyPerovskiteDistortion(
  atoms: Atom[],
  d: PerovskiteDerived,
): Atom[] {
  const a = d.aPC;

  // Original site membership, captured before any relabelling.
  const isA = (el: string) => el === d.A;
  const isB = (el: string) => el === d.B;
  const isX = (el: string) => el === d.X;

  // --- 1. octahedral tilt (rotate oxygens about nearest B center) ---
  if (d.renderTilt > 0.05) {
    const bAtoms = atoms.filter((at) => isB(at.element));
    const k: Vec3 = [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3)];
    const reach = a * 0.85; // B–O ≈ a/2; anything beyond is not this octahedron
    for (const o of atoms) {
      if (!isX(o.element)) continue;
      // nearest B center
      let best: Atom | null = null;
      let bestD = Infinity;
      for (const b of bAtoms) {
        const dd = distance(o.position, b.position);
        if (dd < bestD) { bestD = dd; best = b; }
      }
      if (!best || bestD > reach) continue;
      const sign = cellParity(best.key) === 0 ? 1 : -1;
      const theta = (sign * d.renderTilt * Math.PI) / 180;
      const cos = Math.cos(theta), sin = Math.sin(theta);
      const c = best.position;
      const v: Vec3 = [o.position[0] - c[0], o.position[1] - c[1], o.position[2] - c[2]];
      // Rodrigues rotation of v about unit axis k
      const dot = k[0] * v[0] + k[1] * v[1] + k[2] * v[2];
      const cross: Vec3 = [
        k[1] * v[2] - k[2] * v[1],
        k[2] * v[0] - k[0] * v[2],
        k[0] * v[1] - k[1] * v[0],
      ];
      o.position = [
        c[0] + v[0] * cos + cross[0] * sin + k[0] * dot * (1 - cos),
        c[1] + v[1] * cos + cross[1] * sin + k[1] * dot * (1 - cos),
        c[2] + v[2] * cos + cross[2] * sin + k[2] * dot * (1 - cos),
      ];
    }
  }

  // --- 2. ferroelectric polarization (shift cations along [111]) ---
  if (d.polar > 0.0005) {
    const shift = d.polar * a; // per-axis Cartesian shift
    for (const at of atoms) {
      if (isA(at.element) || isB(at.element)) {
        at.position = [at.position[0] + shift, at.position[1] + shift, at.position[2] + shift];
      }
    }
  }

  // --- 3. solid-solution substitution (relabel the nearest possible fraction) ---
  const aSites =
    d.aDopant && d.xA > 0 ? selectedSites(atoms, d.A, d.xA, "A") : new Set<string>();
  const bSites =
    d.bDopant && d.xB > 0 ? selectedSites(atoms, d.B, d.xB, "B") : new Set<string>();
  for (const at of atoms) {
    if (d.aDopant && isA(at.element) && aSites.has(siteKey(at.key))) {
      at.element = d.aDopant;
    } else if (d.bDopant && isB(at.element) && bSites.has(siteKey(at.key))) {
      at.element = d.bDopant;
    }
  }

  return atoms;
}
