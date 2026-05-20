# Lattice — Build Spec for Claude Code

> A browser-based, animation-first crystal structure explorer built for students learning solid-state physics and materials science. The thesis: incumbents (VESTA, Jmol, Crystal Toolkit) are correct but joyless. Lattice is correct **and** delightful, and treats motion as a teaching tool rather than decoration.

---

## 0. North Star

A 16-year-old who has never heard of a Bravais lattice should be able to open Lattice on their phone, watch BCC iron transform into FCC iron in a single tap, and walk away understanding *why* the transformation matters. A grad student should be able to drop in a CIF file, annotate it, and share a URL of their exact scene with their advisor.

Every design decision answers to one of three principles:

1. **Motion teaches.** No instant state changes. Every transition is animated with intent — atoms slide along physical paths, planes sweep in, cameras choreograph.
2. **Pedagogy is the product.** Glossary on every term. Guided tours over feature dumps. "Explain what I'm looking at" is a button.
3. **Frictionless sharing.** Whole scene encoded in the URL. No accounts required to view.

**Anti-goals:** matching VESTA's feature surface, supporting every space group on day one, becoming a CAD tool, requiring installation.

---

## 1. Tech Stack

Pin these. Don't substitute without reason.

| Layer | Choice | Why |
|---|---|---|
| Build | **Vite 5** + React 18 + TypeScript (strict) | Fast HMR, modern defaults |
| 3D | **React Three Fiber 8** + **@react-three/drei** + **@react-three/postprocessing** | Declarative Three.js, batteries included |
| 3D animation | **@react-spring/three** | Physics-based spring animation for atoms/cameras |
| UI animation | **Framer Motion 11** | UI choreography, layout animations, gesture handling |
| State | **Zustand 4** with `subscribeWithSelector` middleware | Tiny, no boilerplate, plays well with R3F |
| Routing/URL state | **React Router 6** + custom URL serializer (LZ-string compressed) | Whole-scene URL encoding |
| Math | **gl-matrix** for matrix ops, custom for crystal-specific math | Don't roll your own mat4 |
| Parsing | Custom CIF parser in a **Web Worker** | Existing libs are server-side / heavyweight |
| Export | **ffmpeg.wasm** for video, native `<canvas>.toBlob` for stills | Client-side, no backend |
| Styling | **Tailwind CSS 3** + **shadcn/ui** primitives, customized | Don't ship a generic shadcn site |
| Icons | **Lucide React** | Consistent, beautiful |
| Audio (optional, Phase 4) | **Web Audio API** for soft UI sounds, narration via `<audio>` | Subtle, off by default |

**No backend in MVP.** Everything client-side. If we add server later, it's only for shareable scene shortener (optional) and a curated CIF library.

---

## 2. Folder Structure

```
/lattice
  /src
    /app                    # Routes & top-level layout
    /scene                  # R3F components (atoms, bonds, cells, planes)
      /primitives          # Atom, Bond, UnitCellWireframe, MillerPlane
      /effects             # Postprocessing stack
      /camera              # Choreographed camera rig
    /controls              # Interactive UI controls (lattice sliders, scrubbers)
    /ui                    # Student-facing chrome (panels, tour overlays, glossary)
    /tours                 # Guided lesson definitions (data + components)
    /lib
      /crystal             # Lattice math, generators, symmetry helpers
      /morph               # Inter-structure morphing paths (Bain, Burgers, etc.)
      /parsers             # CIF parser (worker entry)
      /url                 # Scene <-> URL serialization
      /animation           # Shared easings, spring presets, choreographers
    /stores                # Zustand stores
    /data
      /presets             # Preset structures (BCC, FCC, HCP, diamond, NaCl, perovskite...)
      /elements            # Element data (radii, colors, names)
      /tours               # Tour JSON
    /workers               # Web worker entries
    /styles                # Tailwind config, design tokens
```

---

## 3. Design System

This is the single most important section for getting the look right. Generic shadcn defaults are forbidden.

### 3.1 Visual identity

- **Mood:** physical, tactile, scientific-but-warm. Think *Bret Victor essay* meets *Linear app* meets a high-end physics textbook.
- **Surface:** mostly dark by default (atoms pop against black), with a true light mode that isn't just inverted.
- **Type:** Inter for UI, **JetBrains Mono** for numeric readouts (lattice params, Miller indices, coordinates). Display headings in **Instrument Serif** for editorial weight on lesson titles.

### 3.2 Color tokens (CSS vars)

```css
:root {
  /* Surfaces */
  --bg: #0a0a0c;
  --bg-elevated: #14141a;
  --bg-panel: rgba(20, 20, 26, 0.72); /* backdrop-blur panels */
  --border: rgba(255, 255, 255, 0.08);

  /* Text */
  --fg: #f4f4f6;
  --fg-muted: #9696a3;
  --fg-subtle: #5a5a66;

  /* Brand: a warm phosphor cyan for highlights — not generic blue */
  --accent: #7df9ff;
  --accent-glow: rgba(125, 249, 255, 0.4);

  /* Semantic */
  --plane: #ff7ab6;          /* Miller planes */
  --direction: #ffd166;       /* Miller directions */
  --bond-highlight: #b8f561;  /* selected bonds */
  --error: #ff6b6b;
}
```

Element colors follow **Jmol CPK convention** as base but with elevated saturation. Store in `/data/elements`.

### 3.3 Motion language

Every animation pulls from these presets in `/lib/animation/springs.ts`. No ad-hoc durations.

```ts
export const springs = {
  // Atom motion — heavy, deliberate, like real mass
  atom:     { mass: 1.2, tension: 180, friction: 26 },
  // Camera — smooth, slightly underdamped for a cinematic feel
  camera:   { mass: 1,   tension: 120, friction: 30 },
  // UI panels — snappy
  ui:       { mass: 0.6, tension: 280, friction: 28 },
  // Plane sweeps — slow, hypnotic
  plane:    { mass: 1.5, tension: 90,  friction: 32 },
  // Morph between structures — slowest, the centerpiece
  morph:    { mass: 2,   tension: 70,  friction: 38 },
};
```

**Easing principle:** atoms accelerate and decelerate like they have mass. Never linear, never instant.

### 3.4 Rendering quality

Required postprocessing stack (in order):

1. **SSAO** (depth-aware ambient occlusion) — gives atoms 3D presence
2. **Bloom** (selective, threshold 0.9) — selected atoms glow softly
3. **MSAA / SMAA** — clean edges, no jaggies on bonds
4. **Vignette** (subtle, 0.2) — pulls focus to center
5. **Depth of field** (toggleable, off by default; on for "presentation mode")

Atoms are **MeshStandardMaterial** with `roughness: 0.4, metalness: 0.1`. Three-point lighting: key (warm), fill (cool), rim (accent color, for selected atom highlights).

---

## 4. Feature Spec

Build in this order. Don't skip ahead.

### Phase 1 — Foundation (Week 1)

**Goal:** Render any preset structure beautifully, orbit around it, swap between presets with animation.

- [ ] R3F canvas with three-point lighting + postprocessing stack from §3.4
- [ ] `Atom` component: instanced meshes for perf, individual atoms when selected (for outline shader)
- [ ] `Bond` component: cylinder geometry, two-tone gradient when atoms differ
- [ ] `UnitCellWireframe`: thin emissive lines with subtle pulse animation
- [ ] Camera rig with `OrbitControls`, damping enabled, smooth zoom
- [ ] Preset registry: BCC, FCC, HCP, simple cubic, diamond, NaCl, CsCl, fluorite, perovskite, graphene/graphite, zincblende, wurtzite
- [ ] Bottom-of-screen "structure switcher" — tappable cards with mini-previews. Tapping triggers Phase 2's morph.
- [ ] Loading screen that's actually nice (animated lattice forming).

**Definition of done:** Open the app, see BCC iron rotating slowly with bloom on the corner atoms. Tap "FCC" — atoms slide to new positions over ~1.2s with spring physics. Phone-friendly.

### Phase 2 — Morphing Core (Week 2) ★ The differentiator

**Goal:** Animated transitions between any two structures along *physically meaningful paths*.

- [ ] `lib/morph/paths.ts` defines named morph paths:
  - **Bain path**: BCC ⇄ FCC (lattice strain along c-axis)
  - **Burgers path**: BCC ⇄ HCP
  - **Diamond ⇄ graphite**: bond rearrangement
  - **Cubic ⇄ tetragonal ⇄ orthorhombic**: free continuous deformation
- [ ] Each path is a function `t => Structure` where `t ∈ [0, 1]`. Atoms interpolate position; lattice vectors interpolate.
- [ ] **Morph scrubber UI**: a horizontal slider at the bottom that the student can drag to scrub the transformation manually. Spring-loaded — let go and it snaps to nearest endpoint.
- [ ] During morph: bonds dynamically re-evaluate (atoms within cutoff get bonded). Use distance-based threshold, fade bonds in/out with opacity.
- [ ] During morph: subtitle text at the top updates ("Atoms shifting along ⟨110⟩...") — pre-authored per morph.
- [ ] Camera optionally pans to highlight what's happening (camera choreography in `/scene/camera`).

**Definition of done:** Drag the scrubber from BCC to FCC and back. Watch atoms physically translate. Subtitles narrate it. The motion is *good* — smooth, weighty, intentional.

### Phase 3 — Interactive Controls (Week 3)

**Goal:** Students can poke at the structure and see real-time response.

- [ ] **Lattice parameter sliders** (a, b, c, α, β, γ): drag to deform, spring-back to defaults available
- [ ] **Supercell builder**: 1×1×1 → 4×4×4 with animated growth (new atoms spawn with scale-in spring)
- [ ] **Miller plane scrubber**: three sliders (h, k, l) + toggleable plane visualization
  - Plane is a translucent pink (var(--plane)) quad clipped to the visible cell
  - Atoms it intersects get highlighted
  - Plane sweeps in with a directional reveal animation
  - Display the (hkl) notation in JetBrains Mono, large
- [ ] **Miller direction arrows**: [uvw] inputs, arrow renders along that vector with animated entrance
- [ ] **Atom inspector**: tap an atom → side panel slides in with element, position (fractional + cartesian), nearest neighbors, coordination number. Tapping a neighbor in the list flies the camera to it.

**Definition of done:** A student can construct the (111) plane in FCC, see which atoms it cuts, and confirm the close-packing visually.

### Phase 4 — Education Layer (Week 4)

**Goal:** This is where Lattice becomes a *teaching tool*, not just a viewer.

- [ ] **Guided tours**: JSON-defined lesson sequences. Each step has:
  - Camera target + zoom level
  - Highlighted atoms/planes/directions
  - Subtitle text + optional audio narration file
  - "Next" gated on student action ("now drag to FCC")
- [ ] Ship with these tours minimum:
  1. *"What's a unit cell?"* (5 min)
  2. *"BCC vs FCC: same atoms, different packing"* (8 min)
  3. *"Miller indices, made physical"* (7 min)
  4. *"Why iron rusts differently when it's hot"* (the phase transition story, 10 min)
  5. *"Close packing: nature's favorite trick"* (10 min)
- [ ] **Glossary tooltips**: hover/tap any term (rendered with a subtle dotted underline) → definition popover with cross-references
- [ ] **"Explain this view" button**: generates a plain-language description of the current scene (template-based, not LLM in MVP — deterministic + offline-capable)
- [ ] **Challenge mode**: "Find the (110) plane in BCC" — student manipulates Miller sliders, gets confetti animation when correct
- [ ] **Progress is local-only** in MVP (localStorage). No account.

**Definition of done:** A student opens the BCC vs FCC tour with no prior knowledge and finishes able to explain the difference.

### Phase 5 — Sharing & Annotations (Week 5)

- [ ] **URL state serialization**: structure ID, lattice params, camera pose, active planes/directions, supercell size, annotations, all in URL hash. LZ-string compressed. Aim for <500 chars typical.
- [ ] **Annotation layer**:
  - Pin a labeled note to an atom (note follows in 3D space, billboards to camera, fades when occluded)
  - Draw freehand on the canvas (2D overlay, persists with scene)
  - Annotations included in URL state
- [ ] **Snapshot export**: PNG, transparent background option, 2× / 4× resolution
- [ ] **Side-by-side compare**: split-screen with locked cameras (Phase 5b if scope tight)

**Definition of done:** Teacher constructs a scene with annotations, copies the URL, pastes into a slide. Student clicks it months later, sees the exact view.

### Phase 6 — Advanced (Later)

- [ ] CIF import via Web Worker parser, with the *good* error messages (line numbers, visual diff of interpretation, suggestions)
- [ ] POSCAR import
- [ ] Video export of guided tours via ffmpeg.wasm
- [ ] Phase-transition keyframe editor
- [ ] Optional: Pyodide + pymatgen for symmetry analysis

---

## 5. Crystal Math — Don't Get This Wrong

A small library in `/lib/crystal`:

```ts
// Convert fractional to cartesian
fracToCart(frac: Vec3, lattice: LatticeVectors): Vec3

// Build atoms for an N×N×N supercell of a Structure
buildSupercell(structure: Structure, n: [number, number, number]): Atom[]

// Distance with periodic boundary conditions
distancePBC(a: Vec3, b: Vec3, lattice: LatticeVectors): number

// Miller plane → world-space quad clipped to cell
millerPlaneGeometry(hkl: [number, number, number], lattice: LatticeVectors): BufferGeometry

// Reciprocal lattice vectors
reciprocal(lattice: LatticeVectors): LatticeVectors
```

Unit-test these with known structures. **A wrong (111) plane in FCC is a credibility-killing bug for any student who's checking against their textbook.**

---

## 6. Performance Budget

- **60 fps** on a 2020 MacBook Air at supercells up to 5×5×5 (~125 unit cells)
- Use `<Instances>` from drei for atom rendering above 50 atoms
- Bonds: regenerate on a Web Worker when structure changes, debounce 100ms
- Don't recompute Miller plane geometry every frame — only on (hkl) change
- Postprocessing stack costs ~3ms; profile and disable bloom on low-power devices (detect via `navigator.deviceMemory`)

---

## 7. Accessibility (Non-negotiable)

- Every action reachable via keyboard
- Glossary tooltips also expose terms in a list view for screen readers
- Animations respect `prefers-reduced-motion` — fall back to faster, simpler transitions (still animated, but 200ms linear instead of springs)
- Color is never the only signal — Miller planes labeled in text, not just by color
- Minimum touch target 44×44px on mobile

---

## 8. Things Claude Code Should Decide Itself

These are intentionally left to craftsmanship — don't ask, just do it well:

- Exact spring values within the ranges in §3.3
- Icon choices from Lucide
- The micro-copy on tooltips
- Loading screen animation specifics
- Easter eggs (a Konda-pong-style atom game in an `?easter=true` URL would be welcome)
- The exact phrasing of tour narration

---

## 9. Getting Started

1. `npm create vite@latest lattice -- --template react-ts`
2. Install the stack from §1
3. Set up Tailwind with the tokens in §3.2 as CSS vars in `index.css`
4. Build Phase 1 end-to-end before touching Phase 2. **Resist the temptation to scaffold everything at once.**
5. The first commit should render a single rotating BCC unit cell with the postprocessing stack working. If that doesn't look beautiful, fix it before going further.

---

## 10. Definition of Done (Whole Product)

A high schooler can open the URL on their phone, tap "BCC vs FCC", scrub through the Bain transformation, drop a (111) plane on the FCC state, pin a note to a corner atom that says "this is what my chemistry teacher meant," and share the URL with a classmate who sees the exact same scene seconds later.

If we hit that, we've shipped something the existing tools haven't.
