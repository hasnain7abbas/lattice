import { motion } from "framer-motion";
import { useScene } from "../stores/useScene";
import { getPreset } from "../data/presets";
import { paramsToVectors } from "../lib/crystal/lattice";
import { Box, Layers3, Sparkles } from "lucide-react";

export function SidePanel() {
  const currentId = useScene((s) => s.currentId);
  const supercell = useScene((s) => s.supercell);
  const setSupercell = useScene((s) => s.setSupercell);
  const showCell = useScene((s) => s.showCell);
  const showBonds = useScene((s) => s.showBonds);
  const toggleCell = useScene((s) => s.toggleCell);
  const toggleBonds = useScene((s) => s.toggleBonds);
  const cur = getPreset(currentId);
  const L = paramsToVectors(cur.params);
  const det =
    L.a[0] * (L.b[1] * L.c[2] - L.b[2] * L.c[1]) -
    L.a[1] * (L.b[0] * L.c[2] - L.b[2] * L.c[0]) +
    L.a[2] * (L.b[0] * L.c[1] - L.b[1] * L.c[0]);
  const volume = Math.abs(det);

  const n = supercell[0];

  return (
    <motion.div
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      className="absolute top-24 right-5 w-72 panel p-5 pointer-events-auto"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={14} className="text-accent" />
        <span className="text-[10px] mono tracking-widest uppercase text-fg-muted">Lattice parameters</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <Stat label="a" value={cur.params.a.toFixed(3)} />
        <Stat label="b" value={cur.params.b.toFixed(3)} />
        <Stat label="c" value={cur.params.c.toFixed(3)} />
        <Stat label="α" value={cur.params.alpha.toFixed(1) + "°"} />
        <Stat label="β" value={cur.params.beta.toFixed(1) + "°"} />
        <Stat label="γ" value={cur.params.gamma.toFixed(1) + "°"} />
      </div>

      <div className="text-xs text-fg-muted flex items-center justify-between mb-5">
        <span>Cell volume</span>
        <span className="mono text-fg">{volume.toFixed(2)} Å³</span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Layers3 size={14} className="text-accent" />
        <span className="text-[10px] mono tracking-widest uppercase text-fg-muted">Supercell · {n}×{n}×{n}</span>
      </div>
      <input
        type="range"
        min={1}
        max={4}
        step={1}
        value={n}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          setSupercell([v, v, v]);
        }}
        className="scrub w-full mb-5"
      />

      <div className="flex items-center gap-2 mb-2">
        <Box size={14} className="text-accent" />
        <span className="text-[10px] mono tracking-widest uppercase text-fg-muted">Display</span>
      </div>
      <div className="flex gap-2">
        <Toggle on={showCell} onClick={toggleCell} label="Cell" />
        <Toggle on={showBonds} onClick={toggleBonds} label="Bonds" />
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/5 px-2 py-2">
      <div className="text-[9px] uppercase tracking-widest text-fg-subtle mono">{label}</div>
      <div className="mono text-sm text-fg">{value}</div>
    </div>
  );
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-3 py-2 rounded-lg text-xs transition-colors border ${
        on
          ? "border-accent text-accent bg-[rgba(125,249,255,0.08)]"
          : "border-white/5 text-fg-muted hover:text-fg hover:bg-white/5"
      }`}
    >
      {label}
    </button>
  );
}
