import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { PRESETS } from "../data/presets";

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
  /** Selected atom key */
  selected: string | null;
  /** Tap target during transitions, exposed for HUD */
  morphing: boolean;
  setStructure: (id: string) => void;
  setMorph: (v: number) => void;
  setSupercell: (n: [number, number, number]) => void;
  toggleCell: () => void;
  toggleBonds: () => void;
  toggleAllSites: () => void;
  select: (key: string | null) => void;
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
    selected: null,
    morphing: false,
    setStructure: (id) => {
      const { currentId } = get();
      if (id === currentId) return;
      set({ previousId: currentId, currentId: id, morph: 0, morphing: true });
    },
    setMorph: (v) => set({ morph: Math.max(0, Math.min(1, v)), morphing: v < 1 }),
    setSupercell: (n) => set({ supercell: n }),
    toggleCell: () => set((s) => ({ showCell: !s.showCell })),
    toggleBonds: () => set((s) => ({ showBonds: !s.showBonds })),
    toggleAllSites: () => set((s) => ({ showAllSites: !s.showAllSites })),
    select: (key) => set({ selected: key }),
  })),
);
