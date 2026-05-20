import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

export function LoadingScreen() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1000);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center"
          style={{ background: "var(--gray)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center gap-5">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <Logo size={84} />
            </motion.div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: "var(--primary)" }}>
                Lattice
              </div>
              <div
                className="text-[10px] mono tracking-[0.3em] uppercase mt-1.5 opacity-60"
                style={{ color: "var(--black)" }}
              >
                forming the unit cell
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
