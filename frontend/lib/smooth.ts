"use client";

import Lenis from "lenis";

/**
 * Lenis configuration, matching the reference site exactly
 * (see `.reference/scripts/inline_05.js`).
 *
 * The reference only initialises Lenis on desktop (≥ 992px) and starts it
 * roughly 2.7 s after load — after the preloader has finished. Below that
 * breakpoint the page uses native scrolling.
 */
export const LENIS_OPTIONS = {
  duration: 1.2,
  lerp: 0.08,
  wheelMultiplier: 1,
  smoothWheel: true,
  smoothTouch: false,
  touchMultiplier: 1,
  normalizeWheel: true
} as const;

let lenis: Lenis | null = null;

export function isDesktop(): boolean {
  return typeof window !== "undefined" && window.innerWidth >= 992;
}

export function initSmooth(): Lenis | null {
  if (typeof window === "undefined") return null;
  if (!lenis && isDesktop()) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lenis = new Lenis(reduced ? { ...LENIS_OPTIONS, lerp: 1, smoothWheel: false } : LENIS_OPTIONS);
    // The reference exposes the instance as `window.lenis`; keeping the same
    // handle makes the page debuggable and scriptable the same way.
    (window as unknown as { lenis?: Lenis }).lenis = lenis;
  }
  return lenis;
}

export function destroySmooth(): void {
  lenis?.destroy();
  lenis = null;
  if (typeof window !== "undefined") {
    delete (window as unknown as { lenis?: Lenis }).lenis;
  }
}

export function getSmooth(): Lenis | null {
  return lenis;
}

/**
 * Scroll locking is reference-counted by owner so the preloader, the menu
 * popup and the order popup can lock independently and release in any order
 * without unlocking the page early.
 */
const lockOwners = new Set<string>();

function applyLock(): void {
  const locked = lockOwners.size > 0;
  document.body.classList.toggle("nota-locked", locked);
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

/** Locks or unlocks scrolling (preloader, open popups, open mobile menu). */
export function setScrollLock(locked: boolean, owner = "default"): void {
  if (typeof document === "undefined") return;
  if (locked) lockOwners.add(owner);
  else lockOwners.delete(owner);
  applyLock();
}

export function isScrollLocked(): boolean {
  return lockOwners.size > 0;
}

const EASE_OUT = (t: number): number => 1 - Math.pow(1 - t, 4);

/**
 * Scroll to an element by id.
 *
 * The reference does an *instant* jump (stop Lenis → `window.scrollTo` →
 * refresh ScrollTrigger → start Lenis) so the pinned "camera" sections land
 * on an exact scroll offset. We do the same, which is what makes the in-page
 * anchors feel correct on a scrollytelling page where sections are sticky
 * and overlap each other.
 */
export function scrollToId(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!lenis || reduced) {
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    return;
  }

  lenis.stop();
  const top = el.getBoundingClientRect().top + window.pageYOffset;
  window.scrollTo(0, top);
  if (typeof history !== "undefined") history.replaceState(null, "", `#${id}`);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => ScrollTrigger.refresh());
      lenis?.start();
    });
  });
}

/** Smooth-scroll to an arbitrary offset (used by the popups/anchors). */
export function scrollToTop(): void {
  if (lenis) lenis.scrollTo(0, { duration: 1.2, easing: EASE_OUT });
  else window.scrollTo({ top: 0, behavior: "smooth" });
}

/** Emitted by the preloader once the page intro may begin. */
let ready = false;

export function announceReady(): void {
  ready = true;
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("nota:ready"));
}

export function onReady(cb: () => void): () => void {
  if (ready) {
    cb();
    return () => {};
  }
  const handler = () => cb();
  window.addEventListener("nota:ready", handler);
  return () => window.removeEventListener("nota:ready", handler);
}
