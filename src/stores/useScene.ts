import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { PRESETS } from "../data/presets";
import type { Doping } from "../lib/crystal/perovskite";

type SceneState = {
  currentId: string;
  previousId: string | null;
  /** Morph 0..1 from previous → current. 1 means fully on current. */
  morph: number;
  /** Supercell repetition */
  supercell: [number, number, number];
  /** Show unit-cell wireframe(s) */
  showCell: boolean;
  /** Show bonds */
  showBonds: boolean;
  /** Mirror atoms across every equivalent lattice site of the unit cell
   *  (e.g. all 8 corners of a cube, both ends of edges/faces). */
  showAllSites: boolean;
  /** Draw BO₆ coordination octahedra for perovskites (makes tilting visible) */
  showOctahedra: boolean;
  /** Selected atom key */
  selected: string | null;
  /** Tap target during transitions, exposed for HUD */
  morphing: boolean;
  /** A/B-site doping applied to perovskite structures (ignored by other lattices). */
  doping: Doping;
  setStructure: (id: string) => void;
  setMorph: (v: number) => void;
  setSupercell: (n: [number, number, number]) => void;
  toggleCell: () => void;
  toggleBonds: () => void;
  toggleAllSites: () => void;
  toggleOctahedra: () => void;
  select: (key: string | null) => void;
  setADopant: (symbol: string | null) => void;
  setAFraction: (x: number) => void;
  setBDopant: (symbol: string | null) => void;
  setBFraction: (x: number) => void;
  resetDoping: () => void;
};

export const useScene = create<SceneState>()(
  subscribeWithSelector((set, get) => ({
    currentId: PRESETS[0].id,
    previousId: null,
    morph: 1,
    supercell: [1, 1, 1],
    showCell: true,
    showBonds: true,
    showAllSites: true,
    showOctahedra: true,
    selected: null,
    morphing: false,
    doping: { aDopant: null, xA: 0.2, bDopant: null, xB: 0.2 },
    setStructure: (id) => {
      const { currentId } = get();
      if (id === currentId) return;
      // Each structure starts undoped so it reads as its pure phase.
      set({
        previousId: currentId,
        currentId: id,
        morph: 0,
        morphing: true,
        doping: { aDopant: null, xA: 0.2, bDopant: null, xB: 0.2 },
      });
    },
    setMorph: (v) => set({ morph: Math.max(0, Math.min(1, v)), morphing: v < 1 }),
    setSupercell: (n) => set({ supercell: n }),
    toggleCell: () => set((s) => ({ showCell: !s.showCell })),
    toggleBonds: () => set((s) => ({ showBonds: !s.showBonds })),
    toggleAllSites: () => set((s) => ({ showAllSites: !s.showAllSites })),
    toggleOctahedra: () => set((s) => ({ showOctahedra: !s.showOctahedra })),
    select: (key) => set({ selected: key }),
    setADopant: (symbol) =>
      set((s) => ({ doping: { ...s.doping, aDopant: symbol, xA: s.doping.xA || 0.2 } })),
    setAFraction: (x) => set((s) => ({ doping: { ...s.doping, xA: Math.max(0, Math.min(1, x)) } })),
    setBDopant: (symbol) =>
      set((s) => ({ doping: { ...s.doping, bDopant: symbol, xB: s.doping.xB || 0.2 } })),
    setBFraction: (x) => set((s) => ({ doping: { ...s.doping, xB: Math.max(0, Math.min(1, x)) } })),
    resetDoping: () => set({ doping: { aDopant: null, xA: 0.2, bDopant: null, xB: 0.2 } }),
  })),
);
