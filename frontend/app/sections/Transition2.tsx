"use client";

import { useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Product } from "../../lib/api";

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_QUOTE =
  "Some thoughts need time, space, and a physical trace to exist. Writing by hand creates focus, presence, and a deeper connection with ideas. This tool is built around that simple truth.";

/**
 * Transition 2 — inverted dark theme wipe + text scrubbing.
 *
 * A 180vh outer section holds a sticky full-screen viewport. While the
 * section enters: (1) a `#0A0A0A` overlay fades up from the bottom,
 * rising over the white specs canvas to invert the theme to dark; (2) the
 * inner viewport pins and a large statement scrubs word-by-word (opacity
 * 0.2 → 1, stagger 0.1) across the now-dark backdrop. The following dark
 * sections continue seamlessly.
 */
export default function Transition2({ product }: { product: Product }) {
  const section = useRef<HTMLElement>(null);
  const copy = useMemo(() => product.about || FALLBACK_QUOTE, [product.about]);
  const words = useMemo(() => copy.split(/\s+/), [copy]);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const overlay = section.current?.querySelector<HTMLElement>(".theme-overlay");
      const scrubWords = section.current?.querySelectorAll<HTMLElement>("[data-scrub-word]");

      if (reduced) {
        if (overlay) gsap.set(overlay, { opacity: 1 });
        if (scrubWords) gsap.set(scrubWords, { opacity: 1 });
        return;
      }

      if (overlay) {
        gsap.fromTo(
          overlay,
          { opacity: 0 },
          {
            opacity: 1,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: section.current,
              start: "top bottom",
              end: "top top",
              scrub: true
            }
          }
        );
      }

      if (scrubWords && scrubWords.length > 0) {
        gsap.fromTo(
          scrubWords,
          { opacity: 0.2 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: {
              trigger: section.current,
              start: "top top",
              end: "bottom top",
              scrub: true
            }
          }
        );
      }
    },
    { scope: section }
  );

  return (
    <section ref={section} className="relative h-[180vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Dark overlay that rises as the section enters */}
        <div aria-hidden className="theme-overlay absolute inset-0 bg-[#0A0A0A]" />

        {/* Scrubbing statement */}
        <div className="absolute inset-0 flex items-center justify-center px-5 md:px-10">
          <p className="text-large-1 leading-[1.1] text-paper">
            {words.map((word, i) => (
              <span key={i} className="inline-block whitespace-pre">
                <span data-scrub-word>{word}</span>
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}