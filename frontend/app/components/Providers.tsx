"use client";

import { useEffect, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { initSmooth, destroySmooth, setScrollLock } from "../../lib/smooth";
import { initTaptopAnimations } from "../../lib/taptop/engine";
import { initScrambleText } from "../../lib/scramble";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

/**
 * Providers — boots the page's motion system, mirroring the reference's load
 * sequence:
 *
 *   1. `history.scrollRestoration = "manual"` + jump to the top, so a reload
 *      always starts the scrollytelling from the cover.
 *   2. lock scrolling while the preloader counts (released after 2600 ms by
 *      `Preloader`).
 *   3. build every Taptop spec animation (`lib/taptop/engine`).
 *   4. start the scramble-text intros (`lib/scramble`).
 *   5. create Lenis on desktop (≥ 992px) and hand its RAF to the GSAP ticker,
 *      exactly like `.reference/scripts/inline_05.js`.
 */
export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    setScrollLock(true, "preload");

    const destroyAnimations = initTaptopAnimations();
    const destroyScramble = initScrambleText();

    const lenis = initSmooth();
    let raf: ((time: number) => void) | null = null;

    if (lenis) {
      const onScroll = () => ScrollTrigger.update();
      lenis.on("scroll", onScroll);
      raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready?.then(refresh).catch(() => {});

    const settle = window.setTimeout(refresh, 3000);
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", onResize);
      if (raf) gsap.ticker.remove(raf);
      destroyScramble();
      destroyAnimations();
      destroySmooth();
    };
  }, []);

  return <>{children}</>;
}
