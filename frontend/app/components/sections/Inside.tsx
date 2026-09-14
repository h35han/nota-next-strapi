"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { BoxItem, Homepage } from "../../../lib/api";

export default function Inside({
  items,
  homepage,
}: {
  items: BoxItem[];
  homepage: Homepage;
}) {
  const section = useRef<HTMLElement>(null);
  const setImg = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.current!.querySelectorAll("[data-reveal]"),
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: section.current, start: "top 70%", once: true },
        }
      );

      if (setImg.current) {
        gsap.fromTo(
          setImg.current,
          { yPercent: 14, scale: 1.12 },
          {
            yPercent: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: setImg.current.parentElement,
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
    <section ref={section} id="inside" className="relative overflow-hidden bg-ink py-[clamp(6rem,16vw,14rem)]">
      <div className="px-[max(1.25rem,4.5vw)]">
        <div className="grid grid-cols-1 gap-[clamp(2rem,4vw,4rem)] lg:grid-cols-12">
          <h2
            data-reveal
            className="col-span-7 font-(--font-instrument-serif) text-[clamp(3rem,11vw,14rem)] leading-[0.85] tracking-tighter text-paper"
          >
            Inside
            <br />
            <span className="italic text-white-40">the box</span>
          </h2>
          <p data-reveal className="col-span-5 self-end text-card text-white-40 lg:pb-4">
            {homepage.insideIntro}
          </p>
        </div>

        <div data-reveal className="relative mt-[clamp(3rem,8vw,7rem)] h-[52vw] max-h-[70vh] min-h-[36vh] w-full overflow-hidden rounded-sm">
          {homepage.insideSetImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={setImg}
              src={homepage.insideSetImage}
              alt="Complete NŌTA set"
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
            />
          )}
        </div>

        <div className="mt-[clamp(4rem,10vw,8rem)] grid grid-cols-1 gap-x-[clamp(2rem,6vw,6rem)] gap-y-[clamp(3rem,6vw,5rem)] lg:grid-cols-2">
          {items.map((item, i) => (
            <article key={item.title} data-reveal className="group">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {item.imageHover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageHover}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                )}
                <div className="absolute left-4 top-4 text-footer text-white-40">
                  0{i + 1}
                </div>
              </div>
              <h3 className="mt-6 text-headline-3 text-paper">{item.title}</h3>
              <p className="mt-3 max-w-[42ch] text-card text-white-40">{item.description}</p>
            </article>
          ))}
        </div>

        <div
          data-reveal
          className="mt-[clamp(5rem,12vw,10rem)] flex flex-col gap-[clamp(2rem,4vw,4rem)] border-t border-black-20 pt-[clamp(2.5rem,5vw,4rem)] md:flex-row md:items-end md:justify-between"
        >
          <h3 className="max-w-[14ch] font-(--font-instrument-serif) text-[clamp(2.4rem,6vw,7rem)] leading-[0.9] tracking-tighter text-paper">
            {homepage.insideCompleteHeading}
          </h3>
          <p className="max-w-[32ch] text-card text-white-40">
            {homepage.insideCompleteText}
          </p>
        </div>
      </div>
    </section>
  );
}