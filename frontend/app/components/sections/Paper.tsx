"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Feature } from "../../../lib/api";

export default function Paper({ features }: { features: Feature[] }) {
  const section = useRef<HTMLElement>(null);
  const pinWrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (features.length === 0) return;
    const ctx = gsap.context(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced || window.innerWidth < 992) return;

      const getDistance = () => {
        const trackEl = track.current!;
        return Math.max(0, trackEl.scrollWidth - window.innerWidth);
      };

      const st = ScrollTrigger.create({
        trigger: pinWrap.current,
        start: "top top",
        end: () => `+=${getDistance()}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (track.current) {
            gsap.set(track.current, { x: -self.progress * getDistance() });
          }
          const idx = Math.min(features.length - 1, Math.floor(self.progress * features.length));
          if (counter.current) {
            counter.current.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(
              features.length
            ).padStart(2, "0")}`;
          }
        },
      });

      return () => st.kill();
    }, section);
    return () => ctx.revert();
  }, [features]);

  return (
    <section ref={section} id="paper" className="relative overflow-hidden bg-ink">
      <header className="flex items-end justify-between px-[max(1.25rem,4.5vw)] pb-[clamp(2rem,5vw,4rem)] pt-[clamp(5rem,12vw,10rem)]">
        <h2 className="max-w-[14ch] font-(--font-instrument-serif) text-[clamp(3rem,10.5vw,14rem)] leading-[0.9] tracking-tighter text-paper">
          Works with
          <br />
          <span className="italic text-white-40">smart paper</span>
        </h2>
        <div ref={counter} className="hidden text-menu-link text-white-40 lg:block">
          01 / {String(features.length).padStart(2, "0")}
        </div>
      </header>

      <div ref={pinWrap} className="relative">
        <div
          ref={track}
          className="flex flex-col lg:h-screen lg:flex-row lg:flex-nowrap lg:will-change-transform"
        >
          {features.map((f, i) => (
            <article
              key={f.title}
              className="group relative h-[80vh] w-full shrink-0 overflow-hidden lg:h-screen lg:w-screen"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.image}
                alt={f.title}
                loading="lazy"
                className="absolute inset-0 hidden h-full w-full object-cover lg:block"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.imageMobile}
                alt={f.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover lg:hidden"
              />
              <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-transparent to-ink/20" />

              <div className="absolute inset-x-0 bottom-0 z-10 px-[max(1.25rem,4.5vw)] pb-[clamp(2rem,6vw,5rem)]">
                <p className="mb-6 max-w-[30ch] text-descriptor text-white-40 lg:mb-8">
                  {f.eyebrow}
                </p>
                <h3 className="max-w-[14ch] font-(--font-instrument-serif) text-[clamp(2.4rem,7.2vw,9rem)] leading-[0.9] tracking-tighter text-paper">
                  {f.title}
                </h3>
                <p className="mt-6 max-w-[34ch] text-card text-white-40">{f.body}</p>
              </div>

              <div className="absolute left-[max(1.25rem,4.5vw)] top-6 text-footer text-white-40 lg:hidden">
                {String(i + 1).padStart(2, "0")}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}