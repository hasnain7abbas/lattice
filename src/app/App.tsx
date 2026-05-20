import { useState } from "react";
import { Viewport } from "../scene/Viewport";
import { Sidebar } from "../ui/Sidebar";
import { WindowHeader } from "../ui/WindowHeader";
import { MorphScrubber } from "../ui/MorphScrubber";
import { SettingsDrawer } from "../ui/SettingsDrawer";
import { LoadingScreen } from "../ui/LoadingScreen";

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div
      className="h-full w-full flex items-center justify-center"
      style={{ background: "var(--gray)" }}
    >
      <div
        className="overflow-hidden flex relative"
        style={{
          width: "var(--window-width)",
          height: "var(--window-height)",
          maxWidth: "1280px",
          minWidth: "320px",
          minHeight: "480px",
          borderRadius: "var(--window-radius, 20px)",
          background: "var(--white)",
          border: "var(--border-in-light)" as any,
          borderWidth: 1,
          borderStyle: "solid",
          boxShadow: "var(--shadow)",
          color: "var(--black)",
        }}
      >
        <Sidebar
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <main className="flex-1 flex flex-col relative min-w-0">
          <WindowHeader onOpenSidebar={() => setSidebarOpen(true)} />
          <div className="relative flex-1 min-h-0">
            <Viewport />
            <MorphScrubber />
            <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
          </div>
        </main>
      </div>

      <LoadingScreen />
    </div>
  );
}
