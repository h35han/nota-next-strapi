"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Product } from "../../lib/api";
import ScrubMedia from "../components/ScrubMedia";

gsap.registerPlugin(ScrollTrigger);

const SCRUB = 0.5;

/**
 * Hero — fullscreen pinned scroll-scrubbed cover animation.
 *
 * A 250vh spacer holds a sticky 100vh viewport. A ScrollTrigger maps
 * scroll progress over that span (0 → 1, scrubbed) into frame-by-frame
 * advancement of the animated WebP / video via the hosting component's
 * `setScrubProgress`. The headline slides down + fades out from 40% → 100%.
 */
export default function Hero({ product }: { product: Product }) {
  const section = useRef<HTMLElement>(null);
  const spacer = useRef<HTMLDivElement>(null);
  const mediaHost = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const host = mediaHost.current;
      const h = heading.current;
      if (!host || !h) return;

      if (reduced) {
        gsap.set(h, { autoAlpha: 1, y: 0 });
        return;
      }

      const setProgress = (p: number) => {
        (host as HTMLElement & { setScrubProgress?: (p: number) => void }).setScrubProgress?.(p);
      };

      ScrollTrigger.create({
        trigger: spacer.current,
        start: "top top",
        end: "bottom bottom",
        scrub: SCRUB,
        onUpdate: (self) => setProgress(self.progress)
      });

      // Headline: bottom-left, pinned; from 40% → 100% scroll it drops
      // 100px and fades out while the pen rotates horizontal.
      gsap.fromTo(
        h,
        { autoAlpha: 1, y: 0 },
        {
          autoAlpha: 0,
          y: 100,
          ease: "none",
          scrollTrigger: {
            trigger: spacer.current,
            start: "40% top",
            end: "bottom bottom",
            scrub: SCRUB
          }
        }
      );
    },
    { scope: section }
  );

  return (
    <section id="main" ref={section} className="bg-ink">
      <div ref={spacer} style={{ height: "250vh" }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <div ref={mediaHost} className="absolute inset-0 z-0">
            <ScrubMedia
              src={product.heroCoverVideo}
              videoSrc={product.heroVideo}
              fallback={product.coverImage}
              cover
            />
          </div>

          {/* Gradient scrim so the headline stays legible */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Headline — bottom-left */}
          <div
            ref={heading}
            className="absolute inset-x-0 bottom-0 z-10 px-5 pb-10 md:px-10 md:pb-14 lg:px-[max(2rem,calc((100vw-76rem)/2))] lg:pb-16"
          >
            <h1 className="font-serif text-headline-1">
              <span className="block text-paper">{product.heading || "Smart pen"}</span>
              <span className="block italic text-paper/80">{product.subheading || "for real thinking"}</span>
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}