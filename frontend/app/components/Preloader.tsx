"use client";

import { useEffect, useRef } from "react";
import { announceReady, setScrollLock } from "../../lib/smooth";

/**
 * Preloader — the radial-gradient curtain with a counting `0 % → 100 %`.
 *
 * Ported from the reference:
 *   · `.reference/scripts/inline_06.js` — the counter runs `0 → 100` over
 *     1400 ms with an `easeInOutQuart` curve, prefix `""`, suffix `"%"`,
 *     0 decimals, and starts when the element scrolls into view.
 *   · `.reference/scripts/inline_04.js` — the page is scroll-locked for
 *     2600 ms, then released.
 *
 * The curtain's fade-out itself is *not* hand-written: the section carries
 * `id="insu3xrls_0"`, and the Taptop spec (`frontend/lib/taptop/spec.json`,
 * animation `755724247`) fades it `1 → 0` with a 1.4 s delay and a 1 s
 * duration. The spec engine drives it.
 */
const EASE_IN_OUT_QUART = (t: number): number =>
  t < 0.5 ? 8 * t * t * t * t : 1 - 8 * Math.pow(1 - t, 3) * t;

const DURATION = 1400;
const UNLOCK_AT = 2600;

export default function Preloader() {
  const counter = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = counter.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let start = 0;

    const setText = (value: number) => {
      if (el) el.textContent = `${Math.round(value)}%`;
    };

    const tick = (now: number) => {
      if (!start) start = now;
      const progress = Math.min((now - start) / DURATION, 1);
      setText(100 * EASE_IN_OUT_QUART(progress));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        if (reduced) {
          setText(100);
          return;
        }
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    if (el) observer.observe(el);

    const unlock = window.setTimeout(() => {
      setScrollLock(false, "preload");
      announceReady();
    }, UNLOCK_AT);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      window.clearTimeout(unlock);
    };
  }, []);

  return (
    <section className="section preload bc--main-radial section--u-insu3xrls" id="insu3xrls_0">
      <div className="container container--primary" id="idkhuhgwv_0">
        <div className="div preload__wrapper" id="i6c0qm17s_0">
          <div
            ref={counter}
            className="text counter headline--1 tc--main-white text--u-i7ioeyaf7"
            id="i7ioeyaf7_0"
          >
            <span className="text-block-wrap-div">0 %</span>
          </div>
        </div>
      </div>
    </section>
  );
}
