"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { DetailCard, Homepage } from "../../../lib/api";

export default function Details({
  cards,
  homepage,
}: {
  cards: DetailCard[];
  homepage: Homepage;
}) {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.current!.querySelectorAll("[data-reveal]"),
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: 1.1,
          ease: "power4.inOut",
          stagger: 0.12,
          scrollTrigger: { trigger: section.current, start: "top 75%", once: true },
        }
      );

      gsap.fromTo(
        section.current!.querySelectorAll("[data-title]"),
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: section.current, start: "top 60%", once: true },
        }
      );
    }, section);
    return () => ctx.revert();
  }, [cards]);

  return (
    <section ref={section} id="details" className="relative overflow-hidden bg-ink py-[clamp(5rem,13vw,11rem)]">
      <div className="px-[max(1.25rem,4.5vw)]">
        <div className="mb-[clamp(2.5rem,6vw,5rem)] flex items-end justify-between">
          <div className="text-descriptor text-white-40">Details</div>
          <div className="text-footer text-white-40">
            {String(cards.length).padStart(2, "0")} pieces of attention
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <figure
              key={i}
              data-reveal
              className="group relative aspect-4/5 w-full overflow-hidden rounded-xs"
            >
              {card.video ? (
                <video
                  src={card.video || homepage.detailsVideo}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                card.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.image}
                    alt={card.title || "NŌTA detail"}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )
              )}
              <div className="absolute inset-0 bg-linear-to-t from-ink/50 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-8">
                <figcaption data-title className="text-descriptor text-paper">
                  {card.title}
                </figcaption>
                <span className="shrink-0 text-footer text-white-40">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}