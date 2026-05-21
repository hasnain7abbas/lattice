import { PRESETS } from "../data/presets";
import { useScene } from "../stores/useScene";
import { useTheme } from "../stores/useTheme";
import { Logo } from "./Logo";
import { Github, Moon, Settings2, Sun, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type Props = {
  onOpenSettings: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export function Sidebar({ onOpenSettings, mobileOpen, onMobileClose }: Props) {
  const currentId = useScene((s) => s.currentId);
  const setStructure = useScene((s) => s.setStructure);
  const theme = useTheme((s) => s.theme);
  const toggleTheme = useTheme((s) => s.toggle);

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
            className="absolute inset-0 bg-black/40 z-30 sm:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`flex flex-col p-4 sm:p-5 bg-second border-r border-black/5 dark:border-white/10
          fixed sm:relative inset-y-0 left-0 z-40 transition-transform safe-top safe-bottom
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}
        style={{
          width: "var(--sidebar-width)",
          background: "var(--second)",
          boxShadow: "inset -2px 0px 2px 0px rgb(0 0 0 / 5%)",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start pb-5">
          <div className="flex items-center gap-3">
            <Logo size={44} />
            <div className="flex flex-col">
              <div className="text-[20px] font-bold leading-tight" style={{ color: "var(--primary)" }}>
                Lattice
              </div>
              <div className="text-[11px] opacity-70 leading-tight mt-0.5" style={{ color: "var(--black)" }}>
                Crystal structures, animated.
              </div>
              <div className="mt-2 text-[10px] opacity-50 mono">
                Built by{" "}
                <a
                  href="https://github.com/hasnain7abbas"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  hasnain7abbas
                </a>
              </div>
            </div>
          </div>
          {/* Close button (mobile) */}
          <button
            onClick={onMobileClose}
            className="sm:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={onOpenSettings}
            className="flex-1 h-9 rounded-card text-xs font-medium flex items-center justify-center gap-1.5
              border transition-colors"
            style={{
              borderColor: "var(--border-in-light)" as any,
              borderWidth: 1,
              borderStyle: "solid",
              background: "var(--white)",
              color: "var(--black)",
            }}
          >
            <Settings2 size={14} />
            Controls
          </button>
          <button
            onClick={toggleTheme}
            className="h-9 px-3 rounded-card text-xs font-medium flex items-center justify-center gap-1.5
              border transition-colors"
            style={{
              borderColor: "var(--border-in-light)" as any,
              borderWidth: 1,
              borderStyle: "solid",
              background: "var(--white)",
              color: "var(--black)",
            }}
            aria-label="Toggle theme"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>

        <div className="text-[11px] uppercase tracking-widest opacity-60 mb-2 mono">
          Structures · {PRESETS.length}
        </div>

        {/* Structure list (chat-item style) */}
        <div className="flex-1 overflow-y-auto -mx-1 px-1">
          {PRESETS.map((p) => {
            const active = p.id === currentId;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setStructure(p.id);
                  onMobileClose();
                }}
                className="w-full text-left mb-2.5 p-[10px_14px] rounded-card transition-colors block
                  border-2 group cursor-pointer"
                style={{
                  background: "var(--white)",
                  borderColor: active ? "var(--primary)" : "transparent",
                  boxShadow: "var(--card-shadow)",
                  animation: "slide-in 0.3s ease",
                }}
              >
                <div className="text-[14px] font-bold truncate" style={{ color: "var(--black)" }}>
                  {p.name}
                </div>
                <div
                  className="text-[12px] mt-1 opacity-70 line-clamp-2"
                  style={{ color: "var(--black)" }}
                >
                  {p.blurb}
                </div>
                <div
                  className="text-[10px] mt-1.5 mono opacity-50"
                  style={{ color: active ? "var(--primary)" : "var(--black)" }}
                >
                  {p.basis.length} {p.basis.length === 1 ? "atom" : "atoms"} · a = {p.params.a.toFixed(3)} Å
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] opacity-60">
          <span className="mono">v0.2.0</span>
          <a
            href="https://github.com/hasnain7abbas/lattice"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:opacity-100"
          >
            <Github size={12} /> Source
          </a>
        </div>
      </aside>
    </>
  );
}

// Re-export a hook for callers
export function useSidebarOpen() {
  return useState(false);
}
