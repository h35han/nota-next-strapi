"use client";

import { useEffect, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { initSmooth, destroySmooth, setScrollLock } from "../../lib/smooth";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin, ScrambleTextPlugin);

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = initSmooth();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Hold scroll while the preloader counts.
    setScrollLock(!reduced);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      gsap.ticker.remove(raf);
      destroySmooth();
    };
  }, []);

  return <>{children}</>;
}