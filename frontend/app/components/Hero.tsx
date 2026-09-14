"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import lottie, { type AnimationItem } from "lottie-web";
import type { Product } from "../../lib/api";
import { onReady, scrollToId } from "../../lib/smooth";

export default function Hero({ product }: { product: Product }) {
  const section = useRef<HTMLElement>(null);
  const lottieWrap = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const [anim, setAnim] = useState<AnimationItem | null>(null);
  const [hero, setHero] = useState<{ w: number; h: number } | null>(null);

  // Load the lottie animation (scrubs with scroll).
  useEffect(() => {
    if (!product.coverLottie) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const a = lottie.loadAnimation({
      container: lottieWrap.current!,
      renderer: "canvas",
      loop: false,
      autoplay: false,
      path: product.coverLottie,
    });
    setAnim(a);
    if (reduced) {
      a.addEventListener("DOMLoaded", () => a.goToAndStop(a.totalFrames - 1, true));
      return;
    }
    return () => a.destroy();
  }, [product.coverLottie]);

  // Cover-fit the 16:9 stage (canvas letterboxes, so size the box to overscan).
  useEffect(() => {
    const apply = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const ratio = 16 / 9;
      let w = vw;
      let h = w / ratio;
      if (h < vh) {
        h = vh;
        w = h * ratio;
      }
      setHero({ w, h });
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  // After the preloader, run the stamp-in intro, then arm scroll scrub.
  useEffect(() => {
    if (!anim || !hero) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scrub: ScrollTrigger | null = null;

    const armScrub = () => {
      if (!section.current) return;
      scrub = ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          if (anim) anim.goToAndStop((self.progress * (anim.totalFrames - 1)) | 0, true);
        },
      });
    };

    const playIntro = () => {
      const tl = gsap.timeline();
      const holder = headlineRef.current;
      if (holder && !reduced) {
        const words = holder.querySelectorAll<HTMLElement>("[data-split] > *");
        tl.fromTo(
          words,
          { yPercent: 120, rotate: 4, opacity: 0 },
          { yPercent: 0, rotate: 0, opacity: 1, duration: 1.1, ease: "power4.out", stagger: 0.06 },
          0.1
        );
      }
      if (anim && !reduced) {
        tl.to(
          {},
          {
            duration: 1,
            onUpdate: function () {
              anim.goToAndStop((this.progress() * 30) | 0, true);
            },
          },
          0.15
        );
      }
      tl.call(() => {
        if (document.body) {
          gsap.set(lottieWrap.current, { autoAlpha: 1 });
        }
        requestAnimationFrame(armScrub);
        ScrollTrigger.refresh();
      }, undefined, "+=0.1");
    };

    const off = onReady(() => {
      if (reduced) {
        armScrub();
        return;
      }
      playIntro();
    });

    return () => {
      off();
      scrub?.kill();
    };
  }, [anim, hero]);

  const lines = [product.heading || "Smart pen", product.subheading || "for real thinking"];

  return (
    <section ref={section} id="main" className="relative min-h-screen w-full overflow-hidden bg-ink">
      <div className="absolute inset-0 bg-radial" />
      <div
        ref={lottieWrap}
        className="pointer-events-none absolute left-1/2 top-1/2 z-1 -translate-x-1/2 -translate-y-1/2"
        style={hero ? { width: hero.w, height: hero.h } : undefined}
      />

      <h1
        ref={headlineRef}
        aria-label={lines.join(" ")}
        className="pointer-events-none relative z-2 flex min-h-screen w-full flex-col items-center justify-center text-center"
      >
        {lines.map((line, i) => (
          <span
            key={line}
            data-split
            className={`block ${i === 1 ? "italic" : ""} ${i === 0 ? "text-headline-1" : "text-headline-2"} text-paper`}
            aria-hidden
          >
            {line.split("").map((ch, j) => (
              <span key={j} className="inline-block will-change-transform">
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </span>
        ))}
      </h1>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-3 flex items-end justify-between px-[max(1.25rem,4.5vw)] pb-[max(1.25rem,3vw)]">
        <div className="text-menu-link text-white-40">{product.tagline}</div>
        <button
          onClick={() => scrollToId("specs")}
          aria-label="Scroll to specifications"
          className="text-menu-link text-paper"
        >
          Scroll
        </button>
      </div>
    </section>
  );
}