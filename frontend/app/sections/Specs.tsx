"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Product, SpecItem } from "../../lib/api";

gsap.registerPlugin(ScrollTrigger);

/**
 * Specifications — editorial 3-column grid + rising pen render.
 *
 * A large serif title sits centered at the top. The pen nib render
 * translates up from below center. Three asymmetric spec cards
 * (Writing System / Capture Technology / Digital Continuity) fade up
 * staggered as they enter the viewport.
 */
export default function Specs({ product, specs }: { product: Product; specs: SpecItem[] }) {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const title = section.current?.querySelector<HTMLElement>("[data-specs-title]");
      const pen = section.current?.querySelector<HTMLElement>("[data-specs-pen]");
      const rows = section.current?.querySelectorAll<HTMLElement>("[data-specs-card]");

      const set = (el: HTMLElement, from: gsap.TweenVars, to: gsap.TweenVars, trigger: Element) => {
        if (reduced) {
          gsap.set(el, { ...to, opacity: 1, y: 0 });
          return;
        }
        gsap.fromTo(
          el,
          from,
          {
            ...to,
            opacity: 1,
            ease: "power3.out",
            scrollTrigger: { trigger, start: "top 80%", once: true }
          }
        );
      };

      if (title) set(title, { y: 40 }, { y: 0, duration: 1 }, title);
      if (pen) set(pen, { y: 120, opacity: 0 }, { y: 0, duration: 1.2 }, section.current!);
      rows?.forEach((row, i) => {
        set(row, { y: 30, opacity: 0 }, { y: 0, duration: 0.9, delay: i * 0.1 }, row);
      });
    },
    { scope: section }
  );

  return (
    <section id="specs" ref={section} className="relative bg-paper text-ink">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32 lg:py-40">
        <div data-specs-title className="mb-20 text-center md:mb-24">
          <h2 className="font-serif text-headline-1">
            <span className="block text-mist">{product.name || "Nota pen"}</span>
            <span className="block">Specifications</span>
          </h2>
        </div>

        <div className="flex flex-col gap-16">
          {/* Central pen render rising from the bottom */}
          <div className="relative flex h-[70vh] items-end justify-center overflow-hidden md:h-[80vh]">
            <div data-specs-pen className="will-scale h-full">
              {product.specsImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.specsImage}
                  alt={product.name}
                  className="h-full w-auto object-contain"
                />
              ) : (
                <div className="h-full w-16 bg-mist/20" aria-hidden />
              )}
            </div>
          </div>

          {/* 3-column asymmetric spec grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {specs.map((spec) => (
              <article
                key={spec.title}
                data-specs-card
                className="group flex flex-col overflow-hidden rounded-3xl bg-ink text-paper"
              >
                <header className="p-6 md:p-8">
                  <h3 className="text-headline-3">{spec.title}</h3>
                </header>
                <div className="flex flex-1 flex-col gap-3 border-t border-white/10 p-6 md:p-8">
                  {spec.items.map((item, j) => (
                    <div key={j} className="flex items-baseline gap-3">
                      <span className="h-1.5 w-1.5 shrink-0 translate-y-[-2px] rounded-full bg-white/30" />
                      <p className="text-card text-paper/80">{item}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}