"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Audience, Product } from "../../lib/api";

gsap.registerPlugin(ScrollTrigger);

/**
 * Who — dark editorial section with audience theses.
 *
 * Follows Transition 2 (dark mode). A descriptor label, generous
 * introduction copy, and a stacked list of audience cards each fade up
 * as they enter the viewport.
 */
export default function Who({ product, audiences }: { product: Product; audiences: Audience[] }) {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const els = section.current?.querySelectorAll<HTMLElement>("[data-who-reveal]");
      if (!els || els.length === 0) return;

      if (reduced) {
        gsap.set(els, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        els,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: section.current,
            start: "top 75%",
            once: true
          }
        }
      );
    },
    { scope: section }
  );

  return (
    <section id="who" ref={section} className="bg-[#0A0A0A] text-paper">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32 lg:py-40">
        <div className="mb-16 max-w-4xl md:mb-24">
          <p className="text-descriptor text-paper/40" data-who-reveal>
            Who it&apos;s for:
          </p>
          <p className="mt-8 text-large-2 leading-[1.2]" data-who-reveal>
            {product.whoForIntro ||
              "This tool is made for people who think on paper. It keeps handwriting natural and focused, letting you write the way you always have — without distractions or screens getting in the way."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden bg-white/10 md:grid-cols-3">
          {audiences.map((audience) => (
            <article
              key={audience.title}
              data-who-reveal
              className="flex flex-col gap-4 bg-[#0A0A0A] p-8 md:p-12"
            >
              <h3 className="text-headline-3">{audience.title}</h3>
              <p className="text-main text-paper/70">{audience.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}