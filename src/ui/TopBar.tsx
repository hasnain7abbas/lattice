import { useScene } from "../stores/useScene";
import { getPreset } from "../data/presets";
import { motion, AnimatePresence } from "framer-motion";

export function TopBar() {
  const currentId = useScene((s) => s.currentId);
  const previousId = useScene((s) => s.previousId);
  const morph = useScene((s) => s.morph);
  const cur = getPreset(currentId);
  const prev = previousId ? getPreset(previousId) : null;
  const transitioning = !!prev && morph < 1;

  return (
    <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-5 pointer-events-none">
      <div className="pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl grid place-items-center"
               style={{ background: "linear-gradient(135deg,#7df9ff 0%,#5cc3d0 100%)", boxShadow: "0 0 28px var(--accent-glow)" }}>
            <span className="serif text-black text-lg">L</span>
          </div>
          <div>
            <div className="serif text-xl leading-none">Lattice</div>
            <div className="text-[10px] mono text-fg-subtle tracking-widest uppercase">Crystal structures, animated</div>
          </div>
        </div>
      </div>

      <div className="pointer-events-auto max-w-md text-right">
        <AnimatePresence mode="wait">
          <motion.div
            key={cur.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.35 }}
          >
            <div className="serif text-2xl">{cur.name}</div>
            <div className="text-xs text-fg-muted max-w-xs ml-auto">{cur.blurb}</div>
            {transitioning && prev && (
              <div className="mt-2 text-[10px] mono tracking-widest uppercase text-accent">
                {prev.name} → {cur.name} · {(morph * 100).toFixed(0)}%
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
