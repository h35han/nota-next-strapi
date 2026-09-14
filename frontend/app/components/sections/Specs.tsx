"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { Product, SpecItem } from "../../../lib/api";

export default function Specs({
  product,
  specs,
}: {
  product: Product;
  specs: SpecItem[];
}) {
  const section = useRef<HTMLElement>(null);
  const pen = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.current!.querySelectorAll("[data-reveal]"),
        { y: 90, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: section.current, start: "top 72%", once: true },
        }
      );

      if (pen.current) {
        gsap.fromTo(
          pen.current,
          { scale: 1.25, yPercent: 10 },
          {
            scale: 1,
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          }
        );
      }
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={section}
      id="specs"
      className="relative overflow-hidden bg-ink py-[clamp(6rem,18vw,16rem)]"
    >
      <div className="px-[max(1.25rem,4.5vw)]">
        <div data-reveal className="mb-[clamp(3rem,8vw,7rem)] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={pen}
            src={product.specsImageTablet || product.specsImage}
            alt="NŌTA smart pen"
            className="mx-auto w-[min(78vw,64rem)] will-change-transform"
          />
        </div>

        <div className="grid grid-cols-1 gap-y-[clamp(3rem,6vw,5rem)] lg:grid-cols-3">
          {specs.map((spec, i) => (
            <article
              key={spec.title}
              data-reveal
              className="flex flex-col gap-5 border-t border-black-20 pt-7 lg:gap-7 lg:pr-8"
            >
              <div className="text-footer text-white-40">0{i + 1}</div>
              <h3 className="text-headline-3 text-paper">{spec.title}</h3>
              <ul className="flex flex-col gap-3">
                {spec.items.map((item) => (
                  <li key={item} className="text-card text-white-40">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}