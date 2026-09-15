"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import spec from "./spec.json";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ *
 * Taptop animation runtime
 *
 * Port of the reference site's `tt_animation` engine. The reference is
 * built with Taptop, which ships a declarative animation spec: every
 * element with an id matching `<9 chars>_<n>` is looked up in
 * `tt_animation` and given a ScrollTrigger-driven GSAP timeline built
 * from a per-breakpoint list of effects (OPACITY / MOVE / SCALE / SIZE /
 * BACKGROUND_COLOR ...) whose keyframes are expressed as percentages of
 * the trigger's scroll range.
 *
 * This module keeps that data (see ./spec.json) and replays it with the
 * exact same semantics:
 *
 *   SCROLL_TRANSFORM → gsap.timeline({ scrollTrigger }).to(el, { keyframes })
 *                      start: `${startPosition}+=${startOffset} ${scrollerStartOffset}`
 *                      end:   `${endPosition}+=${endOffset} ${scrollerEndOffset}`
 *                      scrub: smoothing
 *   APPEAR_ON_SCREEN → gsap.timeline({ scrollTrigger }).fromTo(el, kf[0], kf[1])
 *                      start: `${stageOfAppear} bottom`
 *
 * Element ids are referenced by their 9-character base so the markup can
 * stay a faithful copy of the reference.
 * ------------------------------------------------------------------ */

type RawKeyframe = Record<string, unknown>;

type RawEffect = {
  n: string;
  k: RawKeyframe[];
  e?: string;
  s?: number;
  x?: number;
  d?: number;
  u?: number;
};

type RawParams = {
  off?: boolean;
  t?: string;
  sp?: string;
  ep?: string;
  so?: string;
  eo?: string;
  sso?: string;
  seo?: string;
  sm?: number;
  sa?: string;
  it?: number;
  lp?: string;
  f: RawEffect[];
};

type RawAnimation = {
  id: string;
  tr: "SCROLL_TRANSFORM" | "APPEAR_ON_SCREEN" | "CLICK" | "HOVER" | string;
  /**
   * One slot per entry in `bp`, already resolved at build time
   * (`scripts/gen-taptop-spec.py`). `null` means "identical to the base
   * slot" — the base index is a non-null entry.
   */
  sel: (RawParams | null)[];
};

type Spec = {
  bp: string[];
  base: number;
  m: Record<string, string>;
  a: Record<string, { a: RawAnimation[] }>;
};

const SPEC = spec as unknown as Spec;

/**
 * Media-query ladder, verbatim from Taptop's `O.Ay`
 * (`do.section.js`): big screens first, then the `screen` base, then the
 * max-width steps. `base` is the index of `"screen"`.
 */
const BREAKPOINTS = SPEC.bp;
const BASE = SPEC.base;

/** Resolve the active breakpoint index — first matching query in the ladder. */
function activeIndex(): number {
  if (typeof window === "undefined") return BASE;
  for (let i = 0; i < BREAKPOINTS.length; i += 1) {
    if (window.matchMedia(BREAKPOINTS[i]).matches) return i;
  }
  return BASE;
}

/**
 * Pick the params for the active breakpoint.
 *
 * Inheritance (Taptop's `R()`, including index-wise keyframe merging) is
 * resolved ahead of time by `scripts/gen-taptop-spec.py`, so this is just a
 * lookup: the slot for the active index, or the base slot when the
 * breakpoint is identical to it.
 */
function paramsFor(anim: RawAnimation, index: number): RawParams | null {
  return anim.sel[index] ?? anim.sel[BASE] ?? null;
}

/**
 * Collapse an ordered effect list into a GSAP keyframes object.
 * Mirrors Taptop's `a()`: each effect writes its first keyframe at
 * `startKeyframe%` (only once per property name) and its second at
 * `endKeyframe%`.
 */
function buildKeyframes(effects: RawEffect[]): Record<string, RawKeyframe> {
  const seen = new Set<string>();
  const out: Record<string, RawKeyframe> = {};
  for (const { n, k, s, x } of effects) {
    if (!k || k.length < 2) continue;
    const from = `${s ?? 0}%`;
    const to = `${x ?? 100}%`;
    if (!seen.has(n)) {
      out[from] = { ...(out[from] ?? {}), ...k[0] };
      seen.add(n);
    }
    out[to] = { ...(out[to] ?? {}), ...k[k.length - 1] };
  }
  return out;
}

/** Taptop's `f()`: resolve a `#base_suffix` trigger against the element's own id. */
function resolveTrigger(element: Element, triggerSelector: string): Element {
  if (!triggerSelector) return element;
  const base = triggerSelector.slice(1, 10);
  const suffix = element.id.slice(10);
  const scoped = document.querySelector(`#${base}_${suffix}`);
  return scoped ?? document.querySelector(triggerSelector) ?? element;
}

/**
 * The reference registers named eases (e.g. `custom-i123`) through GSAP's
 * `CustomEase`, a Club plugin we do not ship. Builtin `power*` / `none`
 * names are passed through untouched; anything else falls back to the
 * design's own default, `power1.inOut`.
 */
function easeFor(ease?: string) {
  if (!ease) return undefined;
  if (ease.startsWith("power") || ease.startsWith("none")) return ease;
  return "power1.inOut";
}

export type TaptopAnimationHandle = { revert: () => void };

let initialised = false;

/**
 * Boot every animation declared for elements inside `root`.
 * Idempotent — safe to call again after a route change or a hot reload.
 */
export function initTaptopAnimations(root: ParentNode = document): () => void {
  const timelines: gsap.core.Timeline[] = [];
  const idx = activeIndex();

  const nodes = root.querySelectorAll<HTMLElement>("[id]");
  nodes.forEach((el) => {
    const key = el.id.endsWith("_0") ? el.id.slice(0, 9) : el.id.split("_")[0];
    const animId = SPEC.m[key];
    if (!animId) return;
    const def = SPEC.a[animId];
    if (!def) return;

    for (const anim of def.a) {
      const params = paramsFor(anim, idx);
      if (!params || params.off) continue;
      const effects = (params.f ?? []).filter((e) => e.k && e.k.length >= 2);
      if (effects.length === 0) continue;

      if (anim.tr === "SCROLL_TRANSFORM") {
        const trigger = resolveTrigger(el, params.t ?? "");
        const keyframes = buildKeyframes(effects);
        // Exactly Taptop's call: `timeline.to(el, { keyframes })`. No ease
        // or duration override — the reference relies on GSAP's defaults
        // here, and the timeline is scrubbed, so its length is normalised.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger,
            start: `${params.sp ?? "top"}+=${params.so ?? "0%"} ${params.sso ?? "0%"}`,
            end: `${params.ep ?? "bottom"}+=${params.eo ?? "0%"} ${params.seo ?? "100%"}`,
            scrub: params.sm ?? true,
            invalidateOnRefresh: true
          }
        });
        tl.to(el, { keyframes });
        timelines.push(tl);
      } else if (anim.tr === "APPEAR_ON_SCREEN") {
        const trigger = resolveTrigger(el, params.t ?? "");
        const once = Number(params.it) === 1;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger,
            start: `${params.sa ?? "top"} bottom`,
            toggleActions: once ? "play none none none" : "play none restart reset",
            once
          }
        });
        effects.forEach((eff, i) => {
          const k = eff.k;
          tl.fromTo(
            el,
            { ...k[0] },
            {
              ...k[k.length - 1],
              duration: eff.u ?? 0.5,
              delay: eff.d ?? 0,
              ease: easeFor(eff.e),
              immediateRender: i === 0
            },
            0
          );
        });
        timelines.push(tl);
      }
    }
  });

  initialised = true;

  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts?.ready) document.fonts.ready.then(refresh).catch(() => {});
  window.addEventListener("load", refresh);

  return () => {
    window.removeEventListener("load", refresh);
    timelines.forEach((tl) => {
      tl.scrollTrigger?.kill();
      tl.kill();
    });
  };
}

export function isInitialised() {
  return initialised;
}

export { ScrollTrigger };
