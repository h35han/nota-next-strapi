"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { Homepage, Product, TeamMember } from "../../lib/api";
import { scrollToId, setScrollLock } from "../../lib/smooth";
import { useOrder } from "./chrome";

const NAV = [
  { label: "Main", id: "main" },
  { label: "Specifications", id: "specs" },
  { label: "Who it's for", id: "who" },
  { label: "About", id: "paper" },
  { label: "Inside the box", id: "inside" },
  { label: "Details", id: "details" },
  { label: "Colors", id: "colors" },
];

function TeamPopup({
  open,
  onClose,
  members,
}: {
  open: boolean;
  onClose: () => void;
  members: TeamMember[];
}) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScrollLock(open);
    if (open && box.current) {
      gsap.fromTo(
        box.current,
        { yPercent: 6, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-ink/85 p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div
        ref={box}
        className="relative z-10 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-paper p-[clamp(1.5rem,4vw,3rem)] text-ink"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="text-headline-3">Team</div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition-colors hover:bg-black/5"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <ul className="flex flex-col">
          {members.map((m) => (
            <li key={m.telegram} className="flex items-center justify-between border-t border-black/10 py-4">
              <span className="text-card text-ink">{m.name}</span>
              <a
                href={`https://t.me/${m.telegram}`}
                target="_blank"
                rel="noreferrer"
                className="text-footer text-black-40 transition-colors hover:text-ink"
              >
                @{m.telegram}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Footer({
  product,
  homepage,
  team,
}: {
  product: Product;
  homepage: Homepage;
  team: TeamMember[];
}) {
  const { openOrder } = useOrder();
  const [teamOpen, setTeamOpen] = useState(false);

  return (
    <footer className="relative bg-ink px-[max(1.25rem,4.5vw)] pb-[max(1.5rem,3vw)] pt-[clamp(5rem,14vw,12rem)] text-paper">
      <div className="max-w-[22ch]">
        <p className="text-main text-white-40">
          NŌTA creates tools that respect the way people think and write. Natural
          handwriting, quietly connected to digital structure.
        </p>
        <p className="mt-6 text-headline-3 text-paper">
          Smart pen
          <br />
          <span className="italic text-white-40">for real thinking</span>
        </p>
      </div>

      <div className="mt-[clamp(3rem,8vw,7rem)] grid grid-cols-1 gap-[clamp(2.5rem,5vw,4rem)] md:grid-cols-2 lg:grid-cols-4">
        <nav className="flex flex-col gap-3">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToId(item.id)}
              className={`text-left ${
                item.id === "main" ? "text-headline-4 text-paper" : "text-card text-white-40 transition-colors hover:text-paper"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <div className="text-descriptor text-white-40">Year</div>
          <div className="text-headline-4 text-paper">{product.year ?? 2026}</div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="text-descriptor text-white-40">Team</div>
          <button
            onClick={() => setTeamOpen(true)}
            className="text-headline-4 text-paper underline-offset-4 hover:underline"
          >
            {team.length} people
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="text-descriptor text-white-40">Order</div>
          <button
            onClick={openOrder}
            className="self-start rounded-full bg-paper px-8 py-4 text-button text-ink transition-transform hover:scale-104"
          >
            {product.ctaLabel || "Order"}
          </button>
          <div className="text-footer text-white-40">
            {product.name} — {product.ctaPrice} · {product.availability}
          </div>
        </div>
      </div>

      <div className="mt-[clamp(3rem,7vw,6rem)] flex flex-col gap-4 border-t border-black-20 pt-6 text-footer text-white-40 md:flex-row md:items-center md:justify-between">
        <div>{homepage.footerCopyright}</div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="hover:text-paper">{homepage.footerBuiltBy}</span>
          <a
            href={homepage.madeInUrl || "#"}
            target={homepage.madeInUrl ? "_blank" : undefined}
            rel="noreferrer"
            className="hover:text-paper"
          >
            {homepage.footerMadeIn}
          </a>
          <a
            href={homepage.designedUrl || "#"}
            target={homepage.designedUrl ? "_blank" : undefined}
            rel="noreferrer"
            className="hover:text-paper"
          >
            {homepage.footerDesignedBy}
          </a>
        </div>
        <div>Year {product.year ?? 2026}</div>
      </div>

      <TeamPopup open={teamOpen} onClose={() => setTeamOpen(false)} members={team} />
    </footer>
  );
}