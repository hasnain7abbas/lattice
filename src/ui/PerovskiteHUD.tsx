import { AnimatePresence, motion } from "framer-motion";
import { useScene } from "../stores/useScene";
import { getPreset } from "../data/presets";
import { getElement } from "../data/elements";
import { derivePerovskite, explainDoping } from "../lib/crystal/perovskite";

/**
 * On-canvas teaching label for perovskites. Shows the live formula, the
 * model-estimated phase, and a plain-language cause → effect note explaining how the
 * chosen dopant distorts the geometry. This is the "what am I looking at?"
 * annotation that turns the 3D distortion into something you can read.
 */
export function PerovskiteHUD() {
  const currentId = useScene((s) => s.currentId);
  const doping = useScene((s) => s.doping);

  const cur = getPreset(currentId);
  const tag = cur.perovskite;
  if (!tag) return null;

  const d = derivePerovskite(tag, doping);
  const lines = explainDoping(tag, doping, d);

  const aEl = getElement(d.aDopant && d.xA > 0.005 ? d.aDopant : tag.A);
  const bEl = getElement(d.bDopant && d.xB > 0.005 ? d.bDopant : tag.B);
  const xEl = getElement(tag.X);

  return (
    <AnimatePresence>
      <motion.div
        key={currentId}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="absolute top-3 left-3 z-20 w-[290px] max-w-[calc(100%-24px)] rounded-card border p-3 pointer-events-none"
        style={{
          background: "var(--white)",
          borderColor: "var(--border-in-light)" as any,
          borderWidth: 1,
          borderStyle: "solid",
          boxShadow: "var(--card-shadow)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="mono text-[15px] font-bold leading-none" style={{ color: "var(--black)" }}>
            {d.formula}
          </div>
          <span
            className="text-[9px] mono uppercase tracking-wide px-1.5 py-1 rounded-md whitespace-nowrap"
            style={{ background: "var(--primary-soft)", color: "var(--primary)" }}
          >
            {d.cellAngle < 89.9 ? "rhombohedral" : "cubic"}
          </span>
        </div>

        <div className="text-[11px] font-semibold mb-1.5" style={{ color: "var(--primary)" }}>
          {d.phase}
        </div>

        <ul className="space-y-1 mb-2">
          {lines.map((ln, i) => (
            <li key={i} className="text-[11px] leading-snug" style={{ color: "var(--black)", opacity: 0.85 }}>
              {ln}
            </li>
          ))}
        </ul>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-2 border-t" style={{ borderColor: "var(--border-in-light)" as any }}>
          <LegendDot color={aEl.color} label={`A-site · ${aEl.symbol}`} />
          <LegendDot color={bEl.color} label={`B-site · ${bEl.symbol}O₆`} />
          <LegendDot color={xEl.color} label={`${xEl.symbol} (anion)`} />
        </div>

        <div className="text-[9px] mono mt-1.5 leading-snug" style={{ color: "var(--black)", opacity: 0.45 }}>
          Octahedral tilt exaggerated ~1.6×; cell shear is illustrative.
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--black)", opacity: 0.75 }}>
      <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
