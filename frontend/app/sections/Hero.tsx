"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Product } from "../../lib/api";

function SlideMeta({ index }: { index: string }) {
  return (
    <div className="absolute top-0 left-0 gap-3">
      <span className="text-button text-paper/50">{index}</span>
      <span className="hero-progress text-descriptor text-paper">0%</span>
    </div>
  );
}

function SlideIntro({ product }: { product: Product }) {
  return (
    <section className="hero-slide absolute inset-0" style={{ background: "#0b0b0b" }}>
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
        <p className="hero-reveal text-button text-paper/50">01</p>
        <h2 className="hero-reveal text-headline-1">Intro</h2>
        <p className="hero-reveal text-card text-paper/60">Placeholder intro for {product.name}</p>
      </div>
      <SlideMeta index="01" />
    </section>
  );
}

function SlideSkyline() {
  return (
    <section className="hero-slide absolute inset-0" style={{ background: "#111111" }}>
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
        <p className="hero-reveal text-button text-paper/50">02</p>
        <h2 className="hero-reveal text-headline-1">Skyline</h2>
        <p className="hero-reveal text-card text-paper/60">Placeholder copy for panel 02</p>
      </div>
      <SlideMeta index="02" />
    </section>
  );
}

function SlideForm() {
  return (
    <section className="hero-slide absolute inset-0" style={{ background: "#171717" }}>
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
        <p className="hero-reveal text-button text-paper/50">03</p>
        <h2 className="hero-reveal text-headline-1">Form</h2>
        <p className="hero-reveal text-card text-paper/60">Placeholder copy for panel 03</p>
      </div>
      <SlideMeta index="03" />
    </section>
  );
}

function SlideComfort() {
  return (
    <section className="hero-slide absolute inset-0" style={{ background: "#1d1d1d" }}>
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
        <p className="hero-reveal text-button text-paper/50">04</p>
        <h2 className="hero-reveal text-headline-1">Comfort</h2>
        <p className="hero-reveal text-card text-paper/60">Placeholder copy for panel 04</p>
      </div>
      <SlideMeta index="04" />
    </section>
  );
}

function SlideMoment() {
  return (
    <section className="hero-slide absolute inset-0" style={{ background: "#242424" }}>
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
        <p className="hero-reveal text-button text-paper/50">05</p>
        <h2 className="hero-reveal text-headline-1">Moment</h2>
        <p className="hero-reveal text-card text-paper/60">Placeholder copy for panel 05</p>
      </div>
      <SlideMeta index="05" />
    </section>
  );
}

export default function Hero({ product }: { product: Product }) {
  const inner = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const slides = gsap.utils.toArray<HTMLElement>(".hero-slide", inner.current!);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const reveal = (slide: HTMLElement) => {
        const lines = slide.querySelectorAll<HTMLElement>(".hero-reveal");
        if (reduced) {
          gsap.set(lines, { autoAlpha: 1, y: 0 });
          return;
        }
        gsap.fromTo(
          lines,
          { autoAlpha: 0, y: 80 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.12,
            overwrite: true
          }
        );
      };

      const fade = reduced ? 0 : 0.35;

      let current = 0;
      const show = (index: number) => {
        if (index === current) return;
        gsap.to(slides[current], { autoAlpha: 0, duration: fade });
        gsap.to(slides[index], { autoAlpha: 1, duration: fade });
        reveal(slides[index]);
        current = index;
      };

      gsap.set(slides, { autoAlpha: 0 });
      gsap.set(slides[0], { autoAlpha: 1 });
      reveal(slides[0]);

      ScrollTrigger.create({
        trigger: inner.current!.querySelector(".hero-scroll"),
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const index = Math.min(slides.length - 1, Math.max(0, Math.floor(self.progress * slides.length)));
          show(index);

          const local = (self.progress * slides.length - index) * 100;
          const progressEl = slides[index].querySelector<HTMLElement>(".hero-progress");
          if (progressEl) progressEl.textContent = `${Math.round(Math.min(100, Math.max(0, local)))}%`;
        }
      });
    },
    { scope: inner }
  );

  return (
    <section id="main" ref={inner}>
      <div className="hero-scroll" style={{ height: "1000vh" }}>
        <div className="hero-viewport sticky top-0 h-screen overflow-hidden">
          <SlideIntro product={product} />
          <SlideSkyline />
          <SlideForm />
          <SlideComfort />
          <SlideMoment />
        </div>
      </div>
    </section>
  );
}
