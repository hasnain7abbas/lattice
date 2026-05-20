import { useEffect } from "react";
import { useScene } from "../stores/useScene";
import { getPreset } from "../data/presets";
import { motion, AnimatePresence } from "framer-motion";

export function MorphScrubber() {
  const previousId = useScene((s) => s.previousId);
  const currentId = useScene((s) => s.currentId);
  const morph = useScene((s) => s.morph);
  const setMorph = useScene((s) => s.setMorph);

  // Auto-advance the morph after a structure switch.
  useEffect(() => {
    if (!previousId || morph >= 1) return;
    let raf = 0;
    const start = performance.now();
    const from = morph;
    const duration = 1400; // ms
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // Ease-in-out cubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setMorph(from + (1 - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previousId, currentId]);

  if (!previousId) return null;
  const prev = getPreset(previousId);
  const cur = getPreset(currentId);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 panel px-5 py-4 w-[420px] max-w-[92vw] pointer-events-auto"
      >
        <div className="flex justify-between text-[10px] mono uppercase tracking-widest text-fg-muted mb-2">
          <span>{prev.name}</span>
          <span className="text-accent">scrub the transformation</span>
          <span>{cur.name}</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={morph}
          onChange={(e) => setMorph(parseFloat(e.target.value))}
          className="scrub w-full"
        />
      </motion.div>
    </AnimatePresence>
  );
}
