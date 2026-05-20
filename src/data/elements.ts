// Subset of element data — symbol, name, atomic radius (Å, visual), CPK-ish color (boosted saturation).
export type Element = {
  symbol: string;
  name: string;
  radius: number;
  color: string;
};

export const ELEMENTS: Record<string, Element> = {
  H:  { symbol: "H",  name: "Hydrogen",  radius: 0.31, color: "#f4f4f6" },
  C:  { symbol: "C",  name: "Carbon",    radius: 0.55, color: "#2a2a30" },
  N:  { symbol: "N",  name: "Nitrogen",  radius: 0.56, color: "#5a8dff" },
  O:  { symbol: "O",  name: "Oxygen",    radius: 0.50, color: "#ff5a5a" },
  Na: { symbol: "Na", name: "Sodium",    radius: 0.85, color: "#b56cff" },
  Mg: { symbol: "Mg", name: "Magnesium", radius: 0.72, color: "#7df96f" },
  Al: { symbol: "Al", name: "Aluminum",  radius: 0.78, color: "#c0bbe0" },
  Si: { symbol: "Si", name: "Silicon",   radius: 0.76, color: "#e8a25a" },
  S:  { symbol: "S",  name: "Sulfur",    radius: 0.72, color: "#ffd166" },
  Cl: { symbol: "Cl", name: "Chlorine",  radius: 0.70, color: "#7df96f" },
  K:  { symbol: "K",  name: "Potassium", radius: 1.05, color: "#a45cff" },
  Ca: { symbol: "Ca", name: "Calcium",   radius: 0.95, color: "#5cffb1" },
  Ti: { symbol: "Ti", name: "Titanium",  radius: 0.86, color: "#b5b8c6" },
  Cr: { symbol: "Cr", name: "Chromium",  radius: 0.78, color: "#8aa0c0" },
  Fe: { symbol: "Fe", name: "Iron",      radius: 0.78, color: "#ff8a4f" },
  Cu: { symbol: "Cu", name: "Copper",    radius: 0.86, color: "#ff8050" },
  Zn: { symbol: "Zn", name: "Zinc",      radius: 0.88, color: "#88a0c0" },
  Ga: { symbol: "Ga", name: "Gallium",   radius: 0.80, color: "#c08070" },
  Ge: { symbol: "Ge", name: "Germanium", radius: 0.78, color: "#5a8a70" },
  As: { symbol: "As", name: "Arsenic",   radius: 0.74, color: "#bd80ff" },
  Cs: { symbol: "Cs", name: "Cesium",    radius: 1.40, color: "#9050d0" },
  Au: { symbol: "Au", name: "Gold",      radius: 0.92, color: "#ffd166" },
};

export function getElement(symbol: string): Element {
  return ELEMENTS[symbol] ?? { symbol, name: symbol, radius: 0.6, color: "#cccccc" };
}
