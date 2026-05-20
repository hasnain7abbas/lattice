<div align="center">

<img src="src-tauri/icons/128x128@2x.png" width="128" alt="Lattice logo"/>

<h1 align="center">Lattice</h1>

Crystal structures, animated. An animation-first solid-state physics explorer for desktop and mobile.

[![Windows][Windows-image]][download-url]
[![Android][Android-image]][download-url]
[![Tauri][Tauri-image]][tauri-url]
[![React][React-image]][react-url]
[![Three.js][Three-image]][three-url]

[Download][download-url] · [Features](#-features) · [Crystals](#-included-crystals) · [Build from source](#-build-from-source) · [Roadmap](#-roadmap)

[download-url]: https://github.com/hasnain7abbas/lattice/releases/latest
[tauri-url]: https://tauri.app
[react-url]: https://react.dev
[three-url]: https://threejs.org
[Windows-image]: https://img.shields.io/badge/-Windows-0078D4?logo=windows&logoColor=white
[Android-image]: https://img.shields.io/badge/-Android-3DDC84?logo=android&logoColor=white
[Tauri-image]: https://img.shields.io/badge/Tauri-2.x-FFC131?logo=tauri&logoColor=black
[React-image]: https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black
[Three-image]: https://img.shields.io/badge/Three.js-r169-000000?logo=three.js&logoColor=white

</div>

## Lattice

Lattice is a desktop and mobile app for exploring crystal structures through motion. Switch between BCC, FCC, diamond, rock salt and more — scrub through transitions, inspect Miller planes, and learn solid-state physics the way it actually behaves: in three dimensions, animated.

Built with Tauri 2, React 18 and Three.js. Native binaries for Windows and Android — small footprint, no Electron.

## 📥 Download

Grab the latest release from the [Releases page](https://github.com/hasnain7abbas/lattice/releases/latest):

| Platform | File | Size |
| --- | --- | --- |
| Windows (installer) | `Lattice_0.1.0_x64-setup.exe` | ~2.3 MB |
| Windows (MSI) | `Lattice_0.1.0_x64_en-US.msi` | ~3.3 MB |
| Windows (portable) | `Lattice.exe` | ~9.3 MB |
| Android (arm64) | `Lattice_0.1.0_arm64-debug.apk` | ~16 MB |

> The Android build is a debug-signed APK — enable "Install unknown apps" for your file manager to side-load it.

## ✨ Features

- **Animated crystal lattice viewer** — every structure renders as a live 3D scene, not a static diagram
- **Morph scrubber** — drag between two structures to see the atomic rearrangement in real time
- **10 built-in presets** spanning metals, covalent and ionic solids (see below)
- **Miller plane overlay** — visualise (hkl) planes against the unit cell
- **Element-aware colouring** sourced from a built-in periodic table dataset
- **Dark, NextChat-inspired UI** with a responsive sidebar that collapses to a mobile drawer
- **Native cross-platform** — single Tauri codebase, ~3 MB Windows installer, native Android APK
- **Offline-first** — no network calls, no telemetry, nothing leaves your machine

## 🔬 Included crystals

| Family | Structures |
| --- | --- |
| Metals (BCC) | Iron (α-Fe) |
| Metals (FCC) | Iron (γ-Fe), Copper, Gold |
| Simple cubic | Polonium-style reference cell |
| Covalent | Diamond |
| Ionic | Rock Salt (NaCl), Cesium Chloride (CsCl) |
| Compound | Zincblende (ZnS), Fluorite (CaF₂) |

More presets land with each release — open an issue if there's a structure you want next.

## 🚀 Get Started

1. Download the installer for your platform from the [Releases page][download-url]
2. Run it. On Windows, the NSIS `*-setup.exe` is the smallest and recommended; the `.msi` is for managed deployments
3. Launch **Lattice** — the sidebar lists every preset, click one to render
4. Use the **morph scrubber** at the bottom to transition between two structures

No accounts, no API keys, no sign-in. It just runs.

## 🛠 Build from source

Requirements:
- [Node.js 20+](https://nodejs.org/)
- [Rust](https://rustup.rs/) (stable)
- Platform toolchain: MSVC build tools (Windows) / Android SDK + NDK (mobile)

```bash
git clone https://github.com/hasnain7abbas/lattice.git
cd lattice
npm install
npm run tauri dev      # desktop, hot reload
npm run tauri build    # desktop installers → src-tauri/target/release/bundle
```

### Android

```bash
npm run android:prepare
npm run android:init        # first time only
npm run android:dev         # connect a device or start an emulator
npm run android:apk         # → src-tauri/gen/android/app/build/outputs/apk
```

For release signing, see `scripts/setup-android-signing.mjs` and run `npm run android:signing`.

### Doctor

If something looks off, run `npm run doctor` — it checks Node/Rust/Tauri/Android toolchain versions and prints what's missing.

## 🗺 Roadmap

- [x] BCC, FCC, simple cubic, diamond
- [x] Ionic structures (NaCl, CsCl)
- [x] Compound structures (ZnS, CaF₂)
- [x] Morph scrubber between presets
- [x] Mobile-responsive UI
- [x] Windows installers (NSIS + MSI)
- [x] Android APK
- [ ] Miller plane editor (custom hkl input)
- [ ] HCP family (Mg, Zn, Ti)
- [ ] Perovskite (CaTiO₃) and spinel structures
- [ ] iOS build via `tauri ios`
- [ ] macOS + Linux installers in CI
- [ ] Signed release-mode Android APK on the Play Store
- [ ] User-defined unit cells (paste a CIF)

## 📰 What's new

- **v0.1.0** — first public release. Windows installers (NSIS, MSI, portable), Android debug APK, 10 built-in crystal presets, mobile-responsive NextChat-style UI, simple-cubic logo.

## 🏗 Architecture

```
src/
├── app/        # top-level app shell + routing
├── scene/      # Three.js / R3F viewport, effects, primitives
├── ui/         # sidebar, drawer, scrubber, window chrome
├── data/       # crystal presets + periodic-table data
├── stores/     # Zustand state
└── styles/     # Tailwind config
src-tauri/      # Rust backend, Tauri config, native bundles
```

| Layer | Stack |
| --- | --- |
| Shell | Tauri 2 (Rust + WebView2 / Android WebView) |
| Frontend | React 18, TypeScript, Vite |
| 3D | Three.js r169, @react-three/fiber, @react-three/drei, postprocessing |
| State | Zustand |
| Motion | Framer Motion, @react-spring/three |
| Style | Tailwind CSS |
| Icons | lucide-react |

## 🤝 Contributing

Issues and pull requests welcome. If you're adding a new crystal preset, drop it into `src/data/presets.ts` and the sidebar will pick it up automatically.

## 📄 License

Source under the MIT License. Bundled font, icon and dataset assets retain their original licenses — see the individual files for details.

---

<div align="center">

Built with [Tauri](https://tauri.app), [React](https://react.dev) and [Three.js](https://threejs.org).

</div>
