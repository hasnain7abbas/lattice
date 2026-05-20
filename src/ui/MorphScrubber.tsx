import { useEffect } from "react";
import { useScene } from "../stores/useScene";
import { getPreset } from "../data/presets";
import { motion, AnimatePresence } from "framer-motion";

export function MorphScrubber() {
  const previousId = useScene((s) => s.previousId);
  const currentId = useScene((s) => s.currentId);
  const morph = useScene((s) => s.morph);
  const setMorph = useScene((s) => s.setMorph);

  useEffect(() => {
    if (!previousId || morph >= 1) return;
    let raf = 0;
    const start = performance.now();
    const from = morph;
    const duration = 1400;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
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
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 px-5 py-3 w-[420px] max-w-[92%] rounded-card border"
        style={{
          background: "var(--white)",
          borderColor: "var(--border-in-light)" as any,
          borderWidth: 1,
          borderStyle: "solid",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <div
          className="flex justify-between text-[10px] mono uppercase tracking-widest mb-2"
          style={{ color: "var(--black)", opacity: 0.6 }}
        >
          <span className="truncate max-w-[35%]">{prev.name}</span>
          <span style={{ color: "var(--primary)", opacity: 1 }} className="hidden sm:inline">
            scrub
          </span>
          <span className="truncate max-w-[35%] text-right">{cur.name}</span>
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
