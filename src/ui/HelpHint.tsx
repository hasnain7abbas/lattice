import { motion } from "framer-motion";
import { MousePointer2 } from "lucide-react";

export function HelpHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.6, duration: 0.6 }}
      className="absolute bottom-6 left-5 panel px-3 py-2 pointer-events-none flex items-center gap-2"
    >
      <MousePointer2 size={12} className="text-fg-subtle" />
      <span className="text-[10px] mono tracking-widest uppercase text-fg-subtle">
        Drag to orbit · Scroll to zoom · Tap atom to inspect
      </span>
    </motion.div>
  );
}
