import { AnimatePresence, motion } from "framer-motion";
import { useScene } from "../stores/useScene";
import { getPreset } from "../data/presets";
import { paramsToVectors } from "../lib/crystal/lattice";
import {
  A_DOPANTS,
  B_DOPANTS,
  derivePerovskite,
  type Dopant,
} from "../lib/crystal/perovskite";
import { X, Layers3, Sparkles, Box, Grid3x3, Atom, RotateCcw } from "lucide-react";

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
  const showOctahedra = useScene((s) => s.showOctahedra);
  const toggleCell = useScene((s) => s.toggleCell);
  const toggleBonds = useScene((s) => s.toggleBonds);
  const toggleAllSites = useScene((s) => s.toggleAllSites);
  const toggleOctahedra = useScene((s) => s.toggleOctahedra);
  const doping = useScene((s) => s.doping);
  const cur = getPreset(currentId);
  const derived = cur.perovskite ? derivePerovskite(cur.perovskite, doping) : null;
  const effectiveParams = derived
    ? {
        ...cur.params,
        a: derived.aPC,
        b: derived.aPC,
        c: derived.aPC,
        alpha: derived.cellAngle,
        beta: derived.cellAngle,
        gamma: derived.cellAngle,
      }
    : cur.params;
  const L = paramsToVectors(effectiveParams);
  const det =
    L.a[0] * (L.b[1] * L.c[2] - L.b[2] * L.c[1]) -
    L.a[1] * (L.b[0] * L.c[2] - L.b[2] * L.c[0]) +
    L.a[2] * (L.b[0] * L.c[1] - L.b[1] * L.c[0]);
  const volume = Math.abs(det);
  const n = supercell[0];

  return (
    <>
      {cur.perovskite && <DopingSection />}

      <Section icon={<Sparkles size={13} />} label="Lattice parameters">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Stat label="a" value={effectiveParams.a.toFixed(3)} />
          <Stat label="b" value={effectiveParams.b.toFixed(3)} />
          <Stat label="c" value={effectiveParams.c.toFixed(3)} />
          <Stat label="α" value={effectiveParams.alpha.toFixed(1) + "°"} />
          <Stat label="β" value={effectiveParams.beta.toFixed(1) + "°"} />
          <Stat label="γ" value={effectiveParams.gamma.toFixed(1) + "°"} />
        </div>
        <Row label="Cell volume" value={`${volume.toFixed(2)} Å³`} />
        {derived && (
          <div className="text-[10px] mt-1 leading-snug opacity-60" style={{ color: "var(--black)" }}>
            Effective visualization cell after doping; not a refined diffraction structure.
          </div>
        )}
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
        {cur.perovskite && (
          <button
            onClick={toggleOctahedra}
            className="w-full h-10 rounded-card text-xs font-medium transition-colors border flex items-center justify-center gap-2 px-2 mb-2"
            style={{
              background: showOctahedra ? "var(--primary-soft)" : "var(--white)",
              color: showOctahedra ? "var(--primary)" : "var(--black)",
              borderColor: (showOctahedra ? "var(--primary)" : "var(--border-in-light)") as any,
              borderWidth: 1,
              borderStyle: "solid",
            }}
            title="Draw the BO₆ coordination octahedra so their tilt is visible"
          >
            <Box size={13} />
            {cur.perovskite.B}O₆ octahedra
          </button>
        )}
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

function DopingSection() {
  const currentId = useScene((s) => s.currentId);
  const doping = useScene((s) => s.doping);
  const setADopant = useScene((s) => s.setADopant);
  const setAFraction = useScene((s) => s.setAFraction);
  const setBDopant = useScene((s) => s.setBDopant);
  const setBFraction = useScene((s) => s.setBFraction);
  const resetDoping = useScene((s) => s.resetDoping);

  const cur = getPreset(currentId);
  const tag = cur.perovskite!;
  const d = derivePerovskite(tag, doping);

  // Direction-of-change hints relative to the undoped host.
  const tiltTrend =
    d.tiltDeg > tag.baseTilt + 0.3 ? "↑ more tilted" : d.tiltDeg < tag.baseTilt - 0.3 ? "↓ less tilted" : "≈ host";

  return (
    <Section icon={<Atom size={13} />} label="Doping & distortion">
      <div className="text-[12px] mb-3 leading-snug opacity-75" style={{ color: "var(--black)" }}>
        Substitute cations on the <b>A-site</b> (large, replaces {tag.A}) or the{" "}
        <b>B-site</b> (octahedral, replaces {tag.B}). Real ionic radii drive the
        tolerance factor, cell size, octahedral tilt and polarization.
      </div>

      <DopantSelect
        title={`A-site · replaces ${tag.A}`}
        host={tag.A}
        dopants={A_DOPANTS.filter((dp) => dp.symbol !== tag.A)}
        selected={doping.aDopant}
        fraction={doping.xA}
        onSelect={setADopant}
        onFraction={setAFraction}
      />
      <DopantSelect
        title={`B-site · replaces ${tag.B}`}
        host={tag.B}
        dopants={B_DOPANTS.filter((dp) => dp.symbol !== tag.B)}
        selected={doping.bDopant}
        fraction={doping.xB}
        onSelect={setBDopant}
        onFraction={setBFraction}
      />

      {/* Live readout */}
      <div
        className="rounded-card px-3 py-2.5 mt-1 border"
        style={{
          borderColor: "var(--border-in-light)" as any,
          borderWidth: 1,
          borderStyle: "solid",
          background: "var(--gray)",
        }}
      >
        <div className="mono text-[13px] font-bold mb-1.5" style={{ color: "var(--primary)" }}>
          {d.formula}
        </div>
        <Row label="Tolerance factor t" value={`${d.tolerance.toFixed(3)} (host ${d.hostTolerance.toFixed(3)})`} />
        <Row label="Pseudo-cubic a" value={`${d.aPC.toFixed(3)} Å`} />
        <Row label="Rendered cell angle" value={`${d.cellAngle.toFixed(1)}° ${d.cellAngle < 89.9 ? "(rhombohedral)" : "(cubic)"}`} />
        <Row label="Octahedral tilt" value={`${d.tiltDeg.toFixed(1)}° · ${tiltTrend}`} />
        <Row label="Polarization" value={d.polar > 0.005 ? `polar (${(d.polar * 100).toFixed(0)}%)` : "non-polar"} />
        <div
          className="text-[11px] mt-2 pt-2 leading-snug border-t"
          style={{ color: "var(--black)", borderColor: "var(--border-in-light)" as any, opacity: 0.85 }}
        >
          Model estimate: <b style={{ color: "var(--primary)" }}>{d.phase}</b>
        </div>
      </div>
      <div className="text-[10px] mt-2 leading-snug opacity-65" style={{ color: "var(--black)" }}>
        Ionic-radius trends are qualitative. Sr²⁺, Ti⁴⁺ and Ni²⁺ also require charge
        compensation (vacancies or mixed valence), which this geometry-only model
        does not calculate. Small supercells show the nearest discrete dopant count.
      </div>

      <button
        onClick={resetDoping}
        className="w-full h-9 rounded-card text-xs font-medium mt-2 border flex items-center justify-center gap-1.5"
        style={{
          background: "var(--white)",
          color: "var(--black)",
          borderColor: "var(--border-in-light)" as any,
          borderWidth: 1,
          borderStyle: "solid",
        }}
      >
        <RotateCcw size={13} /> Reset to pure {cur.name.split(" ")[0]}
      </button>
    </Section>
  );
}

function DopantSelect({
  title,
  host,
  dopants,
  selected,
  fraction,
  onSelect,
  onFraction,
}: {
  title: string;
  host: string;
  dopants: Dopant[];
  selected: string | null;
  fraction: number;
  onSelect: (s: string | null) => void;
  onFraction: (x: number) => void;
}) {
  // Group dopants by category for the <optgroup>s.
  const groups = dopants.reduce<Record<string, Dopant[]>>((acc, dp) => {
    (acc[dp.category] ??= []).push(dp);
    return acc;
  }, {});
  const pct = Math.round(fraction * 100);

  return (
    <div className="mb-3">
      <div className="text-[10px] mono uppercase tracking-widest opacity-55 mb-1.5" style={{ color: "var(--black)" }}>
        {title}
      </div>
      <select
        value={selected ?? ""}
        onChange={(e) => onSelect(e.target.value || null)}
        className="w-full h-9 rounded-card px-2 text-xs border mono"
        style={{
          background: "var(--white)",
          color: "var(--black)",
          borderColor: (selected ? "var(--primary)" : "var(--border-in-light)") as any,
          borderWidth: 1,
          borderStyle: "solid",
        }}
      >
        <option value="">None — pure {host}</option>
        {Object.entries(groups).map(([cat, list]) => (
          <optgroup key={cat} label={cat}>
            {list.map((dp) => (
              <option key={dp.symbol} value={dp.symbol}>
                {dp.symbol} · {dp.name} ({dp.charge}, r={dp.ionic.toFixed(2)} Å)
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {selected && (
        <div className="mt-2">
          <div className="flex justify-between text-[10px] mono opacity-60 mb-1">
            <span>{host}</span>
            <span style={{ color: "var(--primary)", opacity: 1 }}>x = {(fraction).toFixed(2)} ({pct}%)</span>
            <span>{selected}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={fraction}
            onChange={(e) => onFraction(parseFloat(e.target.value))}
            className="scrub w-full"
          />
        </div>
      )}
    </div>
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
