"use client";

import { useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ColorVariant } from "../../lib/api";

gsap.registerPlugin(ScrollTrigger);

/** Fallback palettes only used when the CMS is missing variants. */
const THEMES = [
  { name: "Silver", tagline: "Impossible to overthink", bg: ["#0A0A0A", "#2a2a30"] },
  { name: "Graphite Black", tagline: "Clarity in silence.", bg: ["#0A0A0A", "#1a1a1a"] },
  { name: "Mist Blue", tagline: "Light thinking.", bg: ["#0f2536", "#1b3a52"] },
  { name: "Precision Red", tagline: "Form follows thought.", bg: ["#5c0f18", "#831526"] },
  { name: "Bright Orange", tagline: "Steady focus.", bg: ["#f59e0b", "#d97706"] }
];

/**
 * Colors — fade carousel of color variants.
 *
 * A `N * 100vh` spacer + sticky viewport scrubs a GSAP timeline that
 * crossfades the stacked slides (background, pen render, and centered
 * serif title fade together). At the bottom, one thin horizontal line
 * per variant sits at 50% opacity and turns solid white when its slide
 * is active.
 */
export default function Colors({ colors }: { colors: ColorVariant[] }) {
  const section = useRef<HTMLElement>(null);
  const spacer = useRef<HTMLDivElement>(null);
  const indicators = useRef<(HTMLDivElement | null)[]>([]);

  const variants = useMemo(() => {
    const list = colors.slice(0, 5).map((c, i) => ({
      ...c,
      name: c.name || THEMES[i]?.name || "",
      tagline: c.tagline || THEMES[i]?.tagline || "",
      bg: THEMES[i]?.bg ?? ["#000", "#000"]
    }));
    while (list.length < 5) {
      const i = list.length;
      list.push({
        name: THEMES[i].name,
        tagline: THEMES[i].tagline,
        image: "",
        accent: "light" as const,
        bg: THEMES[i].bg
      });
    }
    return list;
  }, [colors]);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const sp = spacer.current;
      const inds = indicators.current;
      const n = variants.length;
      if (!sp || n === 0) return;

      const slides = Array.from(sp.querySelectorAll<HTMLElement>("[data-color-slide]"));

      // --- fit text: scale each label down to its column width ----------------
      const fitText = () => {
        sp.querySelectorAll<HTMLElement>("[data-color-name], [data-color-tag]").forEach((el) => {
          el.style.fontSize = "";
          const col = el.closest<HTMLElement>("[data-fit-col]");
          if (!col) return;
          const avail = col.clientWidth;
          if (avail <= 0) return;
          if (el.scrollWidth > avail) {
            const base = parseFloat(getComputedStyle(el).fontSize);
            el.style.fontSize = `${(base * (avail / el.scrollWidth)).toFixed(1)}px`;
          }
        });
      };
      const onResize = () => fitText();
      window.addEventListener("resize", onResize);
      document.fonts?.ready?.then(() => fitText()).catch(() => {});
      fitText();

      if (reduced) {
        gsap.set(slides, { autoAlpha: 0 });
        if (slides[0]) gsap.set(slides[0], { autoAlpha: 1 });
        inds.forEach((el, i) => { if (el) el.style.opacity = i === 0 ? "1" : "0.5"; });
        return () => window.removeEventListener("resize", onResize);
      }

      // --- crossfade choreography over N segments ----------------------------
      // With n slides the timeline is split into n equal segments; each
      // transition (fade-out of i + fade-in of i+1) occupies a 2*cross
      // window centered on the segment boundary.
      const seg = 1 / n;
      const cross = seg * 0.25;

      gsap.set(slides, { autoAlpha: 0 });
      if (slides[0]) gsap.set(slides[0], { autoAlpha: 1 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sp,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5
        }
      });

      for (let i = 0; i < n; i += 1) {
        if (i > 0) {
          tl.fromTo(
            slides[i],
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 2 * cross },
            i * seg - cross
          );
        }
        if (i < n - 1) {
          tl.to(slides[i], { autoAlpha: 0, duration: 2 * cross }, (i + 1) * seg - cross);
        }
      }

      // --- slide indicators: 50% opacity, solid white when active ------------
      inds.forEach((el) => { if (el) el.style.opacity = "0.5"; });
      for (let i = 0; i < n; i += 1) {
        if (i === 0) {
          if (inds[0]) tl.to(inds[0], { opacity: 0.5, duration: 2 * cross }, seg - cross);
        } else if (i === n - 1) {
          if (inds[i]) tl.fromTo(inds[i], { opacity: 0.5 }, { opacity: 1, duration: 2 * cross }, i * seg - cross);
        } else {
          if (inds[i]) tl.fromTo(inds[i], { opacity: 0.5 }, { opacity: 1, duration: 2 * cross }, i * seg - cross);
          if (inds[i]) tl.to(inds[i], { opacity: 0.5, duration: 2 * cross }, (i + 1) * seg - cross);
        }
      }

      return () => window.removeEventListener("resize", onResize);
    },
    { scope: section }
  );

  return (
    <section id="colors" ref={section} className="relative">
      <div ref={spacer} className="relative" style={{ height: `${variants.length * 100}vh` }}>
        <div className="sticky top-0 h-screen overflow-hidden text-paper">
          {/* Stacked fade slides */}
          {variants.map((v, i) => (
            <div
              key={`slide-${i}`}
              data-color-slide
              className="absolute inset-0"
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              {/* Background gradient */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ backgroundImage: `linear-gradient(180deg, ${v.bg[0]} 0%, ${v.bg[1]} 100%)` }}
              />

              {/* Pen render — centered on the background */}
              {v.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={v.image}
                  alt={v.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 mx-auto my-auto h-[60vh] w-10 rounded-full bg-white/30 mix-blend-screen md:w-12" />
              )}

              {/* Color text + title — equal columns, mirrored to the middle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div data-fit-col className="flex flex-1 justify-end overflow-visible pr-[2vw] md:pr-[3vw]">
                  <h2 data-color-name className="whitespace-nowrap font-serif text-large-3 leading-none">{v.name}</h2>
                </div>
                <div aria-hidden className="w-[4vw] shrink-0 md:w-[6vw]" />
                <div data-fit-col className="flex flex-1 justify-start overflow-visible pl-[2vw] md:pl-[3vw]">
                  <p data-color-tag className="whitespace-nowrap font-serif text-large-3 leading-none text-paper/75">{v.tagline}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Slide indicators — thin horizontal lines */}
          <div className="absolute inset-x-0 bottom-5 z-30 flex items-center justify-center gap-3 md:gap-4">
            {variants.map((v, i) => (
              <div
                key={`ind-${i}`}
                ref={(el) => { indicators.current[i] = el; }}
                className="h-[2px] w-12 bg-white md:w-16"
                style={{ opacity: i === 0 ? 1 : 0.5 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}