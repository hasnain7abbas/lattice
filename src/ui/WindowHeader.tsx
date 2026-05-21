import { Menu, RotateCcw, Eye, EyeOff, Grid3x3 } from "lucide-react";
import { useScene } from "../stores/useScene";
import { getPreset } from "../data/presets";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  onOpenSidebar: () => void;
};

export function WindowHeader({ onOpenSidebar }: Props) {
  const currentId = useScene((s) => s.currentId);
  const previousId = useScene((s) => s.previousId);
  const morph = useScene((s) => s.morph);
  const showCell = useScene((s) => s.showCell);
  const showBonds = useScene((s) => s.showBonds);
  const showAllSites = useScene((s) => s.showAllSites);
  const toggleCell = useScene((s) => s.toggleCell);
  const toggleBonds = useScene((s) => s.toggleBonds);
  const toggleAllSites = useScene((s) => s.toggleAllSites);
  const setStructure = useScene((s) => s.setStructure);
  const cur = getPreset(currentId);
  const prev = previousId ? getPreset(previousId) : null;
  const transitioning = !!prev && morph < 1;

  return (
    <header
      className="flex items-center justify-between px-3 sm:px-6 h-[52px] sm:h-[60px] border-b shrink-0"
      style={{
        borderColor: "var(--border-in-light)" as any,
        borderBottomWidth: 1,
        borderBottomStyle: "solid",
        background: "var(--white)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          className="sm:hidden p-2 -ml-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={cur.id}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.25 }}
              className="min-w-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-[18px] font-bold truncate" style={{ color: "var(--black)" }}>
                  {cur.name}
                </div>
                {transitioning && prev && (
                  <span
                    className="text-[10px] mono px-1.5 py-0.5 rounded-full whitespace-nowrap"
                    style={{ background: "var(--primary-soft)", color: "var(--primary)" }}
                  >
                    {prev.name} → {cur.name} · {(morph * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <div
                className="text-[12px] mt-0.5 truncate hidden sm:block"
                style={{ color: "var(--black)", opacity: 0.6 }}
              >
                {cur.basis.length} {cur.basis.length === 1 ? "atom" : "atoms"}/cell · {cur.blurb}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <ToolbarButton
          on={showCell}
          onClick={toggleCell}
          icon={showCell ? <Eye size={14} /> : <EyeOff size={14} />}
          label="Cell"
          title="Toggle unit-cell wireframe"
        />
        <ToolbarButton
          on={showAllSites}
          onClick={toggleAllSites}
          icon={<Grid3x3 size={14} />}
          label="Sites"
          title="Atoms at every equivalent lattice site"
        />
        <ToolbarButton
          on={showBonds}
          onClick={toggleBonds}
          icon={null}
          label="Bonds"
          title="Toggle bonds"
        />
        <button
          onClick={() => setStructure(cur.id)}
          className="p-2 rounded-card text-xs flex items-center gap-1.5 transition-colors"
          style={{ color: "var(--black)", opacity: 0.7 }}
          title="Reset view"
          aria-label="Reset view"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </header>
  );
}

function ToolbarButton({
  on,
  onClick,
  icon,
  label,
  title,
}: {
  on: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title ?? label}
      aria-label={label}
      aria-pressed={on}
      className="h-8 px-2 sm:px-2.5 rounded-card text-xs font-medium flex items-center gap-1.5 transition-colors border min-w-[34px] justify-center"
      style={{
        background: on ? "var(--primary-soft)" : "var(--white)",
        color: on ? "var(--primary)" : "var(--black)",
        borderColor: on ? "var(--primary)" : "var(--border-in-light)" as any,
        borderWidth: 1,
        borderStyle: "solid",
        opacity: on ? 1 : 0.8,
      }}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
