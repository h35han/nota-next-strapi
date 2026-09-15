# NŌTA porting brief (reference to Next.js)

We are rebuilding <https://nota.uprock.pro/> (a Taptop-generated site) as a
Next.js app. **The old "inspired by" implementation is being replaced by a
faithful port.** Everything you need is in this repo.

## Source of truth

- `.reference/index.html`: the live reference page (raw)
- `.reference/sections/_full_body.html`: same body, pretty-printed, one tag per line. **Read this**
- `.reference/sections/<id>__*.html`: per-section slices
- `frontend/app/styles/reference/base.css`: Taptop base reset + `.section/.div/.text/.container/.text-block-wrap-div`
- `frontend/app/styles/reference/shared.css`: the design's semantic classes (typography, colours, every `cover__*/specs__*/who__*/paper__*/inside__*/details__*/section-colors__*/header__*/footer__*`)
- `frontend/app/styles/reference/design.css`: per-element rules emitted by Taptop (`--u-<id>` classes)
- `frontend/app/styles/reference/animations.css`: the "before" states of animated elements
- `frontend/lib/taptop/spec.json`: the whole Taptop animation spec (element → animation)
- `.reference/animations_full.json`: the same spec, human-readable

All four CSS files are already imported by `frontend/app/globals.css`, in that
order, **after** Tailwind. **Do not edit them.** Use the reference class names
directly. Do not translate them to Tailwind.

## The golden rule: keep the DOM identical

The reference DOM carries two things we depend on:

1. **Class names.** `design.css` and `shared.css` style them by exact name
   (`div--u-ig5resaoj`, `specs__content`, `bc--main-white`, `effect--glass`, …).
2. **Element ids.** `frontend/lib/taptop/engine.ts` auto-wires every scroll
   animation by looking up `id="<9 chars>_0"` in `spec.json`.

So: reproduce the reference element tree **verbatim**, including the
`id='xxxxxxxxx_0'` attributes and every wrapper `div`, and just swap the
hard-coded copy/media for Strapi data. If you drop a wrapper or rename an id,
the layout or the animation breaks.

React notes:

- `class` → `className`, `for` → `htmlFor`.
- Self-close void elements (`<img … />`).
- `&nbsp;` is fine as `{"\u00a0"}` or `&nbsp;` in JSX.
- Inline `<svg>`: convert attributes to camelCase (`fill-rule` → `fillRule`,
  `stroke-width` → `strokeWidth`, `stroke-linecap` → `strokeLinecap`,
  `xmlns:xlink` → drop it, `class` → `className`). Keep every `d` path verbatim.

## Animation engine

```ts
import { initTaptopAnimations } from "../lib/taptop/engine";
```

`initTaptopAnimations()` is called once in `app/components/Providers.tsx` after
the DOM is mounted. **You normally do not call it yourself.** You just have to
keep the element ids intact and the engine does the rest (ScrollTrigger with the
reference's `start`/`end`/`scrub`, keyframes in % of the trigger's scroll
range).

What this means in practice:

- Elements listed in `spec.json` are animated automatically. Nothing to write.
- Elements *not* in the spec (hover states, CSS transitions, click handlers,
  the colour-slider, the handwritten-text scrub) have their behaviour described
  in the reference's inline scripts. See `.reference/scripts/inline_*.js`.
  Those you implement by hand with GSAP/Lenis, matching the reference values.
- Desktop-only vs mobile: the reference ships two parallel section families.
  The desktop ones (`section specs`, `section who`, …) are styled
  `display: none` under 991px and the `*-static` ones are `display: none` above
  991px, purely via CSS. Port **both** families; the CSS toggles them.

## Media and data

Data comes from `lib/api.ts` (already bound to Strapi). Media URLs are absolute
(`http://localhost:1337/uploads/...`). Use plain `<img src>` /
`<video src>`, not `next/image`, to keep the layout identical to the reference.

The reference's own hard-coded media lives on the Taptop CDN. Some of it is
painted by the vendored CSS. The frontend ships **no local images**: every
image comes from Strapi. Where a vendored CSS rule paints a `/d/…` asset,
bind the element to the matching CMS media with an inline style instead, and
strip the dead declaration from the vendored sheet.

## Reference asset paths (original → local)

The reference's `/d/library_image-…` and `/thumb/2/…` URLs have been removed
from the vendored CSS entirely. `frontend/public/` no longer exists.

## Scroll behaviour (from the reference's own scripts)

- **Lenis** (desktop ≥ 992px only, started ~2.7 s after load):
  `{ duration: 1.2, lerp: 0.08, wheelMultiplier: 1, smoothWheel: true, smoothTouch: false, touchMultiplier: 1, normalizeWheel: true }`,
  wired to `ScrollTrigger.update` via `gsap.ticker`.
- **Preloader**: counts `0 %` → `100 %` over 1400 ms with `easeInOutQuart`,
  scroll locked for 2600 ms.
- **Header** (desktop): hides on scroll-down past 6 % of the page, shows on
  scroll-up; its colour flips white/black by scroll percent
  (0 to 8.17, 20.51 to 37.58, 40.83 to 58.60, and 76.29 and above give white, otherwise black).
- **Header** (≤ 991px): colour follows which `*-static` section crosses the
  header's bottom edge.

These live in `frontend/lib/smooth.ts` and the components. See
`frontend/app/components/Header.tsx` and `frontend/app/components/Preloader.tsx`
for the house style (plain functions, `useGSAP` or `useEffect`, cleanup
returned, `prefers-reduced-motion` respected).

## House style

- TypeScript, function components, `"use client"` only when the file uses
  hooks/browser APIs.
- Default-export one section/component per file.
- Fixed props: name them exactly as the existing `page.tsx` calls them.
- No new dependencies.
- Keep tsc clean (`npm run typecheck --workspace frontend`).

## Definition of done for a section

1. The rendered DOM (ids + classes) matches the reference slice, modulo data
   bindings and JSX attribute casing.
2. Copy/media come from Strapi props where the CMS has them.
3. Any non-spec animation (hover, click, custom scrub) matches the reference
   script's values.
4. `npx tsc --noEmit` passes for the files you touched.
