"use client";

import { useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { BoxItem, DetailCard, Homepage } from "../../lib/api";

gsap.registerPlugin(ScrollTrigger);

type BentoItem = { title: string; description?: string; image: string; video?: string };

/** Map cards (macro renders) onto the asymmetric bento grid. */
function buildItems(box: BoxItem[], details: DetailCard[]): BentoItem[] {
  const fromBox: BentoItem[] = box.map((b) => ({
    title: b.title,
    description: b.description,
    image: b.image || b.imageHover
  }));
  const fromDetails: BentoItem[] = details.map((d) => ({
    title: d.title,
    image: d.image,
    video: d.video
  }));
  return [...fromBox, ...fromDetails].filter((i) => i.image || i.video);
}

/** Asymmetric 4-column spans: 12, 4, 8, 8, 4, 12, … */
function spanFor(index: number): string {
  const pattern = ["col-span-12", "col-span-4", "col-span-8", "col-span-8", "col-span-4", "col-span-12"];
  return pattern[index % pattern.length];
}

/**
 * Inside — unboxing display + asymmetric bento grid gallery.
 *
 * A centered overhead view of the structured packaging tray sits below
 * an editorial heading. An asymmetric 12-col grid shows macro detail
 * renders with `rounded-3xl` corners and hover-scale images.
 */
export default function Inside({
  items,
  homepage,
  cards
}: {
  items: BoxItem[];
  homepage: Homepage;
  cards: DetailCard[];
}) {
  const section = useRef<HTMLElement>(null);
  const bento = useMemo(() => buildItems(items, cards), [items, cards]);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const els = section.current?.querySelectorAll<HTMLElement>("[data-inside-reveal]");
      if (!els || els.length === 0) return;

      if (reduced) {
        gsap.set(els, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        els,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: section.current,
            start: "top 80%",
            once: true
          }
        }
      );
    },
    { scope: section }
  );

  return (
    <section id="inside" ref={section} className="bg-paper text-ink">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32 lg:py-40">
        <div className="mb-16 text-center md:mb-24" data-inside-reveal>
          <h2 className="font-serif text-headline-1">
            <span className="block">{homepage.insideCompleteHeading || "Inside the box"}</span>
            {homepage.insideCompleteText && (
              <span className="mt-4 block font-sans text-large-3 text-mist">
                {homepage.insideCompleteText}
              </span>
            )}
          </h2>
        </div>

        {/* Unboxing display */}
        {homepage.insideSetImage && (
          <div className="mb-20 flex justify-center md:mb-24" data-inside-reveal>
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={homepage.insideSetImage}
                alt=""
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Bento grid gallery */}
        <div className="grid grid-cols-12 gap-4">
          {bento.map((item, i) => (
            <div key={i} data-inside-reveal className={`${spanFor(i)} group relative`}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-black-10">
                {item.video ? (
                  <video
                    src={item.video}
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                )}
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-16 md:p-6 md:pt-20">
                <h3 className="text-headline-4 text-paper">{item.title}</h3>
                {item.description && (
                  <p className="mt-2 max-w-md text-card text-paper/80">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}