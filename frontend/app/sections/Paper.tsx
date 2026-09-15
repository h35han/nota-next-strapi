"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Feature } from "../../lib/api";

gsap.registerPlugin(ScrollTrigger);

/**
 * Paper — horizontal scroll showcase (Smart Paper System).
 *
 * A 300vh wrapper pins a sticky viewport. Vertical scroll is converted
 * into a horizontal `translateX` of the inner track (0% → -66.6% for
 * three 100vw panels). Feature panels render the closed notebook, the
 * open notebook with handwriting, and the phone mockup with live OCR.
 */
export default function Paper({ features }: { features: Feature[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  const panels = features.length > 0 ? features.slice(0, 3) : [];

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced || track.current === null) return;
      const n = panels.length;
      if (n < 2) return;

      const x = -(100 - 100 / n);

      const tl = gsap.to(track.current, {
        xPercent: x,
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1
        }
      });

      // Handwriting path draws itself as the track scrolls.
      const path = section.current?.querySelector<SVGPathElement>("[data-hand-path]");
      if (path) {
        const len = path.getTotalLength();
        gsap.fromTo(
          path,
          { strokeDashoffset: len },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section.current,
              start: "top top",
              end: "center bottom",
              scrub: true
            }
          }
        );
      }

      return () => {
        tl.scrollTrigger?.kill();
      };
    },
    { scope: section }
  );

  return (
    <section id="paper" ref={section} className="relative bg-[#0A0A0A] text-paper">
      <div className="relative" style={{ height: "300vh" }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <p className="pointer-events-none absolute left-5 top-8 z-10 text-descriptor text-paper/40 md:left-10">
            Smart paper system
          </p>
          <div ref={track} className="h-track">
            {panels.map((feature, i) => (
              <div
                key={feature.title + i}
                className={`h-panel relative px-5 md:px-10 ${
                  i === 0 ? "bg-gradient-to-b from-[#111] to-[#0A0A0A]" : ""
                } ${i === 1 ? "bg-gradient-to-b from-[#141414] to-[#0A0A0A]" : ""} ${
                  i === 2 ? "bg-gradient-to-b from-[#181818] to-[#0A0A0A]" : ""
                }`}
              >
                <div className="flex w-full max-w-6xl flex-col items-center gap-8 md:flex-row md:gap-16">
                  <div className="relative w-full max-w-md flex-1">
                    {feature.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="h-auto w-full max-h-[70vh] rounded-3xl object-contain"
                      />
                    ) : (
                      <div className="aspect-[4/3] w-full rounded-3xl bg-white/5" />
                    )}

                    {/* Decorative handwriting stroke scrubbed by scroll */}
                    <svg
                      aria-hidden
                      viewBox="0 0 320 120"
                      className="pointer-events-none absolute -bottom-6 right-0 w-40 md:w-56"
                    >
                      <path
                        data-hand-path
                        d="M8 84 C 60 40, 96 110, 132 72 S 210 30, 240 64 S 286 92, 312 44"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="2.5"
                        className="text-paper/60"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-descriptor text-paper/40">{feature.eyebrow}</p>
                    <h3 className="mt-4 text-headline-4">{feature.title}</h3>
                    <p className="mt-4 max-w-md text-main text-paper/70">{feature.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}