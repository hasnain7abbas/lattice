import { Viewport } from "../scene/Viewport";
import { TopBar } from "../ui/TopBar";
import { SidePanel } from "../ui/SidePanel";
import { StructureSwitcher } from "../ui/StructureSwitcher";
import { MorphScrubber } from "../ui/MorphScrubber";
import { LoadingScreen } from "../ui/LoadingScreen";
import { HelpHint } from "../ui/HelpHint";

export function App() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <Viewport />
      <TopBar />
      <SidePanel />
      <MorphScrubber />
      <StructureSwitcher />
      <HelpHint />
      <LoadingScreen />
    </div>
  );
}
