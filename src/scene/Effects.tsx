import { EffectComposer, Bloom, Vignette, SMAA } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";

export function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom intensity={0.6} luminanceThreshold={0.85} luminanceSmoothing={0.2} kernelSize={KernelSize.LARGE} mipmapBlur />
      <Vignette eskil={false} offset={0.2} darkness={0.55} />
      <SMAA />
    </EffectComposer>
  );
}
