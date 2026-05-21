import { AnimatePresence, motion } from "framer-motion";
import { useScene } from "../stores/useScene";
import { getPreset } from "../data/presets";
import { paramsToVectors } from "../lib/crystal/lattice";
import { X, Layers3, Sparkles, Box, Grid3x3 } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SettingsDrawer({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 z-30"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", mass: 0.6, tension: 280, friction: 28 } as any}
            className="absolute right-0 top-0 bottom-0 w-[340px] max-w-full z-40 p-5 overflow-y-auto"
            style={{
              background: "var(--white)",
              borderLeft: "var(--border-in-light)" as any,
              boxShadow: "-20px 0 60px rgb(0 0 0 / 15%)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="text-[16px] font-bold" style={{ color: "var(--black)" }}>
                Controls
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <DrawerBody />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerBody() {
  const currentId = useScene((s) => s.currentId);
  const supercell = useScene((s) => s.supercell);
  const setSupercell = useScene((s) => s.setSupercell);
  const showCell = useScene((s) => s.showCell);
  const showBonds = useScene((s) => s.showBonds);
  const showAllSites = useScene((s) => s.showAllSites);
  const toggleCell = useScene((s) => s.toggleCell);
  const toggleBonds = useScene((s) => s.toggleBonds);
  const toggleAllSites = useScene((s) => s.toggleAllSites);
  const cur = getPreset(currentId);
  const L = paramsToVectors(cur.params);
  const det =
    L.a[0] * (L.b[1] * L.c[2] - L.b[2] * L.c[1]) -
    L.a[1] * (L.b[0] * L.c[2] - L.b[2] * L.c[0]) +
    L.a[2] * (L.b[0] * L.c[1] - L.b[1] * L.c[0]);
  const volume = Math.abs(det);
  const n = supercell[0];

  return (
    <>
      <Section icon={<Sparkles size={13} />} label="Lattice parameters">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Stat label="a" value={cur.params.a.toFixed(3)} />
          <Stat label="b" value={cur.params.b.toFixed(3)} />
          <Stat label="c" value={cur.params.c.toFixed(3)} />
          <Stat label="α" value={cur.params.alpha.toFixed(1) + "°"} />
          <Stat label="β" value={cur.params.beta.toFixed(1) + "°"} />
          <Stat label="γ" value={cur.params.gamma.toFixed(1) + "°"} />
        </div>
        <Row label="Cell volume" value={`${volume.toFixed(2)} Å³`} />
      </Section>

      <Section icon={<Layers3 size={13} />} label={`Supercell · ${n}×${n}×${n}`}>
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
          className="scrub w-full"
        />
        <div className="flex justify-between text-[10px] mono opacity-60 mt-1">
          <span>1</span><span>2</span><span>3</span><span>4</span>
        </div>
      </Section>

      <Section icon={<Box size={13} />} label="Display">
        <div className="flex gap-2 mb-2">
          <Toggle on={showCell} onClick={toggleCell} label="Cell" />
          <Toggle on={showBonds} onClick={toggleBonds} label="Bonds" />
        </div>
        <button
          onClick={toggleAllSites}
          className="w-full h-10 rounded-card text-xs font-medium transition-colors border flex items-center justify-center gap-2 px-2"
          style={{
            background: showAllSites ? "var(--primary-soft)" : "var(--white)",
            color: showAllSites ? "var(--primary)" : "var(--black)",
            borderColor: (showAllSites ? "var(--primary)" : "var(--border-in-light)") as any,
            borderWidth: 1,
            borderStyle: "solid",
          }}
          title="Draw an atom at every equivalent lattice site (8 corners, face centers, etc.)"
        >
          <Grid3x3 size={13} />
          All lattice sites
        </button>
        <div
          className="text-[10px] mt-1.5 leading-snug opacity-60"
          style={{ color: "var(--black)" }}
        >
          {showAllSites
            ? "Drawing atoms at every cell corner / face mirror."
            : "Showing just the primitive basis (no boundary mirrors)."}
        </div>
      </Section>
    </>
  );
}

function Section({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div
        className="flex items-center gap-1.5 mb-2.5 text-[11px] mono uppercase tracking-widest"
        style={{ color: "var(--black)", opacity: 0.6 }}
      >
        <span style={{ color: "var(--primary)", opacity: 1 }}>{icon}</span>
        {label}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-card px-2 py-2 border"
      style={{
        borderColor: "var(--border-in-light)" as any,
        borderWidth: 1,
        borderStyle: "solid",
        background: "var(--gray)",
      }}
    >
      <div className="text-[9px] uppercase tracking-widest mono opacity-50" style={{ color: "var(--black)" }}>
        {label}
      </div>
      <div className="mono text-sm" style={{ color: "var(--black)" }}>
        {value}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs py-1.5 opacity-80" style={{ color: "var(--black)" }}>
      <span>{label}</span>
      <span className="mono">{value}</span>
    </div>
  );
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 h-10 rounded-card text-xs font-medium transition-colors border"
      style={{
        background: on ? "var(--primary-soft)" : "var(--white)",
        color: on ? "var(--primary)" : "var(--black)",
        borderColor: on ? "var(--primary)" : "var(--border-in-light)" as any,
        borderWidth: 1,
        borderStyle: "solid",
      }}
    >
      {label}
    </button>
  );
}
