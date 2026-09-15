"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Transition 3 — radial iris expansion mask.
 *
 * A 160vh outer section pins a full-screen viewport. A `#0A0A0A` backdrop
 * follows the dark Paper section, then a white overlay expands its
 * `clip-path` from `circle(0% at 50% 50%)` to `circle(150% at 50% 50%)`
 * with scroll scrub — a growing iris wiping the dark view to reveal the
 * white "Inside the box" section underneath.
 */
export default function Transition3() {
  const section = useRef<HTMLElement>(null);
  const iris = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!iris.current) return;

      if (reduced) {
        gsap.set(iris.current, { clipPath: "circle(150% at 50% 50%)" });
        return;
      }

      gsap.fromTo(
        iris.current,
        { clipPath: "circle(0% at 50% 50%)" },
        {
          clipPath: "circle(150% at 50% 50%)",
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        }
      );
    },
    { scope: section }
  );

  return (
    <section ref={section} className="relative h-[160vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0A0A0A]">
        <div ref={iris} aria-hidden className="absolute inset-0 bg-paper" />
      </div>
    </section>
  );
}