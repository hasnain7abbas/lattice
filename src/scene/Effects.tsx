import { EffectComposer, Bloom, Vignette, SMAA } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";

export function Effects({ mobile = false }: { mobile?: boolean }) {
  return (
    <EffectComposer multisampling={mobile ? 0 : 4}>
      <Bloom
        intensity={mobile ? 0.4 : 0.6}
        luminanceThreshold={0.85}
        luminanceSmoothing={0.2}
        kernelSize={mobile ? KernelSize.MEDIUM : KernelSize.LARGE}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.2} darkness={0.55} />
      <SMAA />
    </EffectComposer>
  );
}
