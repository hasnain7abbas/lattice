import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1200);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="absolute inset-0 z-50 grid place-items-center bg-[var(--bg)]"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col items-center gap-6">
            <svg width="80" height="80" viewBox="0 0 80 80">
              {[
                [40, 14], [14, 56], [66, 56],
                [40, 40], [27, 32], [53, 32], [27, 50], [53, 50],
              ].map(([cx, cy], i) => (
                <motion.circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill="#7df9ff"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                />
              ))}
              {[
                [40, 14, 14, 56], [40, 14, 66, 56], [14, 56, 66, 56],
                [40, 40, 27, 32], [40, 40, 53, 32], [40, 40, 27, 50], [40, 40, 53, 50],
              ].map(([x1, y1, x2, y2], i) => (
                <motion.line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#7df9ff" strokeWidth={1} opacity={0.35}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                />
              ))}
            </svg>
            <div className="text-center">
              <div className="serif text-3xl">Lattice</div>
              <div className="text-[10px] mono tracking-[0.3em] uppercase text-fg-subtle mt-1">forming the unit cell</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
