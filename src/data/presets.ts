import type { Structure } from "../lib/crystal/types";

const cubic = (a: number) => ({ a, b: a, c: a, alpha: 90, beta: 90, gamma: 90 });

export const PRESETS: Structure[] = [
  {
    id: "bcc-fe",
    name: "BCC Iron",
    blurb: "α-iron — body-centered cubic. Stable below 912 °C.",
    params: cubic(2.87),
    basis: [
      { element: "Fe", frac: [0, 0, 0] },
      { element: "Fe", frac: [0.5, 0.5, 0.5] },
    ],
  },
  {
    id: "fcc-fe",
    name: "FCC Iron",
    blurb: "γ-iron — face-centered cubic. The high-temperature phase.",
    params: cubic(3.65),
    basis: [
      { element: "Fe", frac: [0, 0, 0] },
      { element: "Fe", frac: [0.5, 0.5, 0] },
      { element: "Fe", frac: [0.5, 0, 0.5] },
      { element: "Fe", frac: [0, 0.5, 0.5] },
    ],
  },
  {
    id: "fcc-cu",
    name: "FCC Copper",
    blurb: "Close-packed copper. The textbook FCC metal.",
    params: cubic(3.61),
    basis: [
      { element: "Cu", frac: [0, 0, 0] },
      { element: "Cu", frac: [0.5, 0.5, 0] },
      { element: "Cu", frac: [0.5, 0, 0.5] },
      { element: "Cu", frac: [0, 0.5, 0.5] },
    ],
  },
  {
    id: "fcc-au",
    name: "FCC Gold",
    blurb: "Gold — FCC, brilliantly soft, brilliantly conductive.",
    params: cubic(4.08),
    basis: [
      { element: "Au", frac: [0, 0, 0] },
      { element: "Au", frac: [0.5, 0.5, 0] },
      { element: "Au", frac: [0.5, 0, 0.5] },
      { element: "Au", frac: [0, 0.5, 0.5] },
    ],
  },
  {
    id: "sc-po",
    name: "Simple Cubic",
    blurb: "The simplest 3D lattice. Rare in nature — α-Po is the textbook case.",
    params: cubic(3.36),
    basis: [{ element: "C", frac: [0, 0, 0] }],
  },
  {
    id: "diamond",
    name: "Diamond",
    blurb: "Carbon in tetrahedral coordination. The hardest natural mineral.",
    params: cubic(3.567),
    basis: [
      { element: "C", frac: [0, 0, 0] },
      { element: "C", frac: [0.5, 0.5, 0] },
      { element: "C", frac: [0.5, 0, 0.5] },
      { element: "C", frac: [0, 0.5, 0.5] },
      { element: "C", frac: [0.25, 0.25, 0.25] },
      { element: "C", frac: [0.75, 0.75, 0.25] },
      { element: "C", frac: [0.75, 0.25, 0.75] },
      { element: "C", frac: [0.25, 0.75, 0.75] },
    ],
  },
  {
    id: "nacl",
    name: "Rock Salt (NaCl)",
    blurb: "Two interpenetrating FCC lattices of Na⁺ and Cl⁻.",
    params: cubic(5.64),
    basis: [
      { element: "Na", frac: [0, 0, 0] },
      { element: "Na", frac: [0.5, 0.5, 0] },
      { element: "Na", frac: [0.5, 0, 0.5] },
      { element: "Na", frac: [0, 0.5, 0.5] },
      { element: "Cl", frac: [0.5, 0, 0] },
      { element: "Cl", frac: [0, 0.5, 0] },
      { element: "Cl", frac: [0, 0, 0.5] },
      { element: "Cl", frac: [0.5, 0.5, 0.5] },
    ],
  },
  {
    id: "cscl",
    name: "Cesium Chloride",
    blurb: "BCC-like with two species. Cs at corners, Cl at body center.",
    params: cubic(4.12),
    basis: [
      { element: "Cs", frac: [0, 0, 0] },
      { element: "Cl", frac: [0.5, 0.5, 0.5] },
    ],
  },
  {
    id: "zincblende",
    name: "Zincblende (ZnS)",
    blurb: "FCC with a two-atom tetrahedral basis. Parent of GaAs, InSb, ZnSe.",
    params: cubic(5.41),
    basis: [
      { element: "Zn", frac: [0, 0, 0] },
      { element: "Zn", frac: [0.5, 0.5, 0] },
      { element: "Zn", frac: [0.5, 0, 0.5] },
      { element: "Zn", frac: [0, 0.5, 0.5] },
      { element: "S",  frac: [0.25, 0.25, 0.25] },
      { element: "S",  frac: [0.75, 0.75, 0.25] },
      { element: "S",  frac: [0.75, 0.25, 0.75] },
      { element: "S",  frac: [0.25, 0.75, 0.75] },
    ],
  },
  {
    id: "fluorite",
    name: "Fluorite (CaF₂)",
    blurb: "Ca²⁺ on FCC sites, F⁻ filling every tetrahedral hole.",
    params: cubic(5.46),
    basis: [
      { element: "Ca", frac: [0, 0, 0] },
      { element: "Ca", frac: [0.5, 0.5, 0] },
      { element: "Ca", frac: [0.5, 0, 0.5] },
      { element: "Ca", frac: [0, 0.5, 0.5] },
      { element: "F" as any, frac: [0.25, 0.25, 0.25] },
      { element: "F" as any, frac: [0.75, 0.25, 0.25] },
      { element: "F" as any, frac: [0.25, 0.75, 0.25] },
      { element: "F" as any, frac: [0.25, 0.25, 0.75] },
      { element: "F" as any, frac: [0.75, 0.75, 0.25] },
      { element: "F" as any, frac: [0.75, 0.25, 0.75] },
      { element: "F" as any, frac: [0.25, 0.75, 0.75] },
      { element: "F" as any, frac: [0.75, 0.75, 0.75] },
    ],
  },
];

export function getPreset(id: string): Structure {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}
