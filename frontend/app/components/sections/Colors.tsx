"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { ColorVariant } from "../../../lib/api";
import { useOrder } from "../chrome";

export default function Colors({ colors }: { colors: ColorVariant[] }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const { openOrder } = useOrder();

  useEffect(() => {
    if (colors.length === 0) return;
    const ctx = gsap.context(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const slides = stage.current!.querySelectorAll("[data-slide]");
      const captions = stage.current!.querySelectorAll("[data-caption]");
      const counter = stage.current!.querySelector("[data-counter]");

      gsap.set(slides, { autoAlpha: 0 });
      gsap.set(slides[0], { autoAlpha: 1 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: `+=${(colors.length - 1) * 100 + 60}%`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const idx = Math.min(
              colors.length - 1,
              Math.floor(self.progress * colors.length)
            );
            if (counter) {
              counter.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(
                colors.length
              ).padStart(2, "0")}`;
            }
          },
        },
      });

      colors.forEach((_, i) => {
        if (i === 0) return;
        const prev = i - 1;
        const at = prev / (colors.length - 1);
        tl.to(slides[i], { autoAlpha: 1, duration: 0.55, ease: "none", immediateRender: false }, at);
        tl.to(
          slides[prev],
          { autoAlpha: 0, duration: 0.55, ease: "none" },
          at + 0.12
        );

        tl.fromTo(
          captions[i],
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out", immediateRender: false },
          at + 0.05
        );
        tl.to(captions[prev], { autoAlpha: 0, y: -30, duration: 0.4, ease: "power2.in" }, at + 0.18);
      });

      if (reduced) {
        tl.progress(1);
        tl.pause();
      }
    }, section);
    return () => ctx.revert();
  }, [colors]);

  return (
    <section ref={section} id="colors" className="relative bg-ink text-paper">
      <div ref={stage} className="relative h-screen w-full overflow-hidden">
        {colors.map((c, i) => {
          const violet = c.accent === "violet";
          return (
            <article key={c.name} data-slide className="absolute inset-0 will-change-[opacity]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.image}
                alt={c.name}
                loading={i === 0 ? "eager" : "lazy"}
                className="h-full w-full object-cover"
              />

              <div className="absolute left-[max(1.25rem,4.5vw)] top-24">
                <div
                  data-caption
                  className={`font-(--font-instrument-serif) text-[clamp(2.2rem,6vw,7.5rem)] leading-[0.9] tracking-tighter ${
                    violet ? "text-violet" : "text-paper"
                  }`}
                >
                  {c.name}
                  <span className="text-[0.5em] align-super">.</span>
                </div>
                <p
                  data-caption
                  className={`mt-3 max-w-[14ch] text-card ${
                    violet ? "text-violet/90" : "text-white-40"
                  }`}
                >
                  {c.tagline}
                </p>
              </div>
            </article>
          );
        })}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-[max(1.25rem,4.5vw)] pb-[max(1.25rem,3vw)]">
          <button
            onClick={openOrder}
            className="pointer-events-auto rounded-full border border-white/40 px-6 py-3 text-menu-link text-paper transition-[background-color,color] duration-300 hover:bg-paper hover:text-ink"
          >
            Order
          </button>
          <div data-counter className="text-menu-link text-white-40">
            01 / {String(colors.length).padStart(2, "0")}
          </div>
        </div>
      </div>
    </section>
  );
}