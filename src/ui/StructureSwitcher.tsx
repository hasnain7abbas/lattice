import { motion } from "framer-motion";
import { PRESETS } from "../data/presets";
import { useScene } from "../stores/useScene";

export function StructureSwitcher() {
  const currentId = useScene((s) => s.currentId);
  const setStructure = useScene((s) => s.setStructure);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-[92vw] overflow-x-auto px-2">
      <div className="flex gap-2 panel px-3 py-3">
        {PRESETS.map((p) => {
          const active = p.id === currentId;
          return (
            <motion.button
              key={p.id}
              onClick={() => setStructure(p.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                active
                  ? "bg-[var(--accent)] text-black font-medium shadow-[0_0_24px_var(--accent-glow)]"
                  : "text-fg-muted hover:text-fg hover:bg-white/5"
              }`}
              title={p.blurb}
            >
              {p.name}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
