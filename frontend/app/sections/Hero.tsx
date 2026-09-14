"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Product } from "../../lib/api";

export default function Hero({ product }: { product: Product }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".hero-panel", root.current).forEach((panel) => {
          gsap.fromTo(
            panel.querySelectorAll<HTMLElement>(".hero-reveal"),
            { autoAlpha: 0, y: 80 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              ease: "power3.out",
              stagger: 0.12,
              scrollTrigger: {
                trigger: panel,
                start: "top 75%",
                toggleActions: "play none none reverse"
              }
            }
          );
        });
      });

      gsap.utils.toArray<HTMLElement>(".hero-panel", root.current).forEach((panel) => {
        const progress = panel.querySelector<HTMLElement>(".hero-progress");
        ScrollTrigger.create({
          trigger: panel,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            if (!progress) return;
            const value = Math.min(100, Math.max(0, Math.round(self.progress * 100)));
            progress.textContent = `${value}%`;
          }
        });
      });
    },
    { scope: root }
  );

  return (
    <section id="main" ref={root} className="relative">
      <div className="hero-panel pin" style={{ background: "#0b0b0b" }}>
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
          <p className="hero-reveal text-button text-paper/50">01</p>
          <h2 className="hero-reveal text-headline-1">Intro</h2>
          <p className="hero-reveal text-card text-paper/60">Placeholder intro for {product.name}</p>
        </div>
        <div className="absolute top-0 left-0 gap-3">
          <span className="text-button text-paper/50">01</span>
          <span className="hero-progress text-descriptor text-paper">0%</span>
        </div>
      </div>

      <div className="hero-panel pin" style={{ background: "#111111" }}>
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
          <p className="hero-reveal text-button text-paper/50">02</p>
          <h2 className="hero-reveal text-headline-1">Skyline</h2>
          <p className="hero-reveal text-card text-paper/60">Placeholder copy for panel 02</p>
        </div>
        <div className="absolute top-0 left-0 gap-3">
          <span className="text-button text-paper/50">02</span>
          <span className="hero-progress text-descriptor text-paper">0%</span>
        </div>
      </div>

      <div className="hero-panel pin" style={{ background: "#171717" }}>
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
          <p className="hero-reveal text-button text-paper/50">03</p>
          <h2 className="hero-reveal text-headline-1">Form</h2>
          <p className="hero-reveal text-card text-paper/60">Placeholder copy for panel 03</p>
        </div>
        <div className="absolute top-0 left-0 gap-3">
          <span className="text-button text-paper/50">03</span>
          <span className="hero-progress text-descriptor text-paper">0%</span>
        </div>
      </div>

      <div className="hero-panel pin" style={{ background: "#1d1d1d" }}>
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
          <p className="hero-reveal text-button text-paper/50">04</p>
          <h2 className="hero-reveal text-headline-1">Comfort</h2>
          <p className="hero-reveal text-card text-paper/60">Placeholder copy for panel 04</p>
        </div>
        <div className="absolute top-0 left-0 gap-3">
          <span className="text-button text-paper/50">04</span>
          <span className="hero-progress text-descriptor text-paper">0%</span>
        </div>
      </div>

      <div className="hero-panel pin" style={{ background: "#242424" }}>
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
          <p className="hero-reveal text-button text-paper/50">05</p>
          <h2 className="hero-reveal text-headline-1">Moment</h2>
          <p className="hero-reveal text-card text-paper/60">Placeholder copy for panel 05</p>
        </div>
        <div className="absolute top-0 left-0 gap-3">
          <span className="text-button text-paper/50">05</span>
          <span className="hero-progress text-descriptor text-paper">0%</span>
        </div>
      </div>
    </section>
  );
}
