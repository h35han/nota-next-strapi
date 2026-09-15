"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Transition 1 — staggered vertical blinds.
 *
 * Entering directly after the hero, five white 20vw columns sweep down
 * from `translateY(-100%)` to `0`, left-to-right with a 0.08s stagger.
 * Because the panels are translated one viewport-height above the section
 * they cover the still-visible hero viewport while the section scrolls in,
 * wiping the dark hero away and revealing the white specs canvas.
 */
export default function Transition1({ accent = "white" }: { accent?: "white" | "dark" }) {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const panels = section.current?.querySelectorAll<HTMLElement>(".blind-panel");
      if (!panels || panels.length === 0) return;

      if (reduced) {
        gsap.set(panels, { yPercent: 0 });
        return;
      }

      gsap.fromTo(
        panels,
        { yPercent: -100 },
        {
          yPercent: 0,
          ease: "power2.inOut",
          stagger: 0.08,
          scrollTrigger: {
            trigger: section.current,
            start: "top bottom",
            end: "top top",
            scrub: true
          }
        }
      );
    },
    { scope: section }
  );

  const panelClass = accent === "dark" ? "bg-[#0A0A0A]" : "bg-white";

  return (
    <section
      ref={section}
      aria-hidden
      className="pointer-events-none relative z-20 h-screen"
    >
      <div className="absolute inset-0 flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`blind-panel h-full w-[20vw] ${panelClass}`} />
        ))}
      </div>
    </section>
  );
}