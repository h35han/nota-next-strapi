"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import type { Audience, Product } from "../../../lib/api";

export default function Who({
  product,
  audiences,
}: {
  product: Product;
  audiences: Audience[];
}) {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const stage = section.current!.querySelector("[data-stage]");
      const lines = section.current!.querySelectorAll("[data-line]");
      const wordEls: Element[] = [];
      lines.forEach((line) => {
        const sp = new SplitText(line, { type: "words" });
        wordEls.push(...sp.words);
      });
      const theses = section.current!.querySelector("[data-theses]");
      const intro = section.current!.querySelector("[data-intro]");

      gsap.set(theses, { autoAlpha: 0, y: 40 });
      gsap.set(intro, { autoAlpha: 0, y: 40 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "+=260%",
          scrub: 0.6,
          pin: stage as HTMLElement,
        },
      });

      tl.fromTo(
        wordEls,
        { opacity: 0.08 },
        { opacity: 1, stagger: 0.05, ease: "none", duration: 0.35 },
        0
      );

      tl.to(
        wordEls,
        { opacity: 0.12, stagger: 0.04, ease: "none", duration: 0.3 },
        "theses-=0.15"
      );
      tl.fromTo(
        theses,
        { autoAlpha: 0, y: 60 },
        { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: 0.08 },
        "theses"
      );
      tl.addLabel("intro", "+=0.05");
      tl.to(theses, { autoAlpha: 0, y: -50, duration: 0.35, ease: "power2.in" }, "intro");
      tl.fromTo(
        intro,
        { autoAlpha: 0, y: 60 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "intro+=0.05"
      );
    }, section);
    return () => ctx.revert();
  }, []);

  const aboutLines = (product.about ?? "Some thoughts need time, space, and a physical trace to exist.")
    .split(/(?<=[.!?])\s+/);

  return (
    <section
      ref={section}
      id="who"
      className="relative overflow-hidden bg-ink text-paper"
    >
      <div className="absolute inset-0 z-0">
        {product.whoVideo && (
          <video
            src={product.whoVideo}
            muted
            loop
            playsInline
            autoPlay
            className="h-full w-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-ink/40" />
      </div>

      <div data-stage className="relative z-10 flex min-h-screen flex-col px-[max(1.25rem,4.5vw)] py-24">
        <div className="text-descriptor text-white-40">
          Who it&rsquo;s for<span className="text-violet">:</span>
        </div>

        <p className="mt-auto flex max-w-[16ch] flex-col gap-[0.35em] font-(--font-instrument-serif) text-[clamp(2rem,6.05vw,8.7rem)] leading-[0.95] tracking-tighter">
          {aboutLines.map((line) => (
            <span key={line} data-line aria-hidden>
              {line}
            </span>
          ))}
        </p>

        <div className="mt-auto pt-16">
          <div
            data-theses
            className="grid grid-cols-1 gap-[clamp(2rem,4vw,4rem)] md:grid-cols-3"
          >
            {audiences.map((a, i) => (
              <article key={a.title} className="flex flex-col gap-4">
                <div className="text-footer text-white-40">0{i + 1}</div>
                <h3 className="text-headline-4 text-paper">{a.title}</h3>
                <p className="text-card text-white-40">{a.description}</p>
              </article>
            ))}
          </div>

          <div data-intro className="max-w-[34ch]">
            <p className="text-large-2 text-paper">
              {product.whoForIntro?.split("\n").map((t, i) => (
                <span key={i}>
                  {t}
                  {i < (product.whoForIntro ?? "").split("\n").length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}