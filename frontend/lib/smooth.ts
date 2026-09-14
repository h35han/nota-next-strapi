"use client";

import Lenis from "lenis";

let lenis: Lenis | null = null;

export function initSmooth(): Lenis {
  if (!lenis) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lenis = new Lenis({ lerp: reduced ? 1 : 0.09, smoothWheel: !reduced });
  }
  return lenis;
}

export function destroySmooth(): void {
  lenis?.destroy();
  lenis = null;
}

export function getSmooth(): Lenis | null {
  return lenis;
}

/** Locks or unlocks scrolling (preloader, open popups, open mobile menu). */
export function setScrollLock(locked: boolean): void {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

export function isScrollLocked(): boolean {
  return lenis?.isStopped ?? false;
}

const EASE_OUT = (t: number): number => 1 - Math.pow(1 - t, 4);

/** Smooth-scroll to an element by id (falls back to native scrolling). */
export function scrollToId(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { duration: 1.4, easing: EASE_OUT });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

/** Emitted by the preloader once the page intro may begin. */
let ready = false;

export function announceReady(): void {
  ready = true;
  window.dispatchEvent(new CustomEvent("nota:ready"));
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