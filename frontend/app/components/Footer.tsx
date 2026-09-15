"use client";

import type { Homepage, Product, TeamMember } from "../../lib/api";

/**
 * Footer — multi-column minimal dark layout (#0A0A0A).
 *
 * Brand mission summary, navigation sitemap, metadata, and designer
 * attributions. Dynamic year via client hydration.
 */
export default function Footer({
  product,
  homepage,
  team,
}: {
  product: Product;
  homepage: Homepage;
  team: TeamMember[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0A0A] text-paper">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
        <div className="flex flex-col gap-14 md:flex-row md:justify-between">
          {/* Brand mission */}
          <div className="max-w-sm">
            <p className="font-serif text-headline-4">Nōta</p>
            <p className="mt-4 text-card text-paper/60">
              {product.description ||
                "A smart writing system that combines a precision smart pen, intelligent paper, and real-time digital sync."}
            </p>
          </div>

          {/* Navigation sitemap */}
          <nav aria-label="Footer" className="grid gap-2 text-footer">
            {[
              { label: "Specifications", id: "specs" },
              { label: "Who it's for", id: "who" },
              { label: "About", id: "paper" },
              { label: "Inside the box", id: "inside" }
            ].map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="w-fit text-paper/60 transition-colors hover:text-paper"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Team */}
          {team.length > 0 && (
            <div className="grid gap-2 text-footer">
              <p className="text-paper/40">{product.team || "Team"}</p>
              {team.map((member) => (
                <a
                  key={member.name}
                  href={member.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-fit text-paper/60 transition-colors hover:text-paper"
                >
                  {member.name}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Metadata + attributions */}
        <div className="mt-16 flex flex-col justify-between gap-6 border-t border-white/10 pt-8 text-footer text-paper/40 md:flex-row md:items-center">
          <p>
            {homepage.footerCopyright?.replace("{year}", String(year)) || `©${year} Nōta Team`}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>{product.designCredit || homepage.footerDesignedBy || "Designed by"}</span>
            {homepage.designedUrl && (
              <a
                href={homepage.designedUrl}
                target="_blank"
                rel="noreferrer"
                className="text-paper/60 transition-colors hover:text-paper"
              >
                Alice
              </a>
            )}
            {homepage.uprockUrl && (
              <a
                href={homepage.uprockUrl}
                target="_blank"
                rel="noreferrer"
                className="text-paper/60 transition-colors hover:text-paper"
              >
                &amp; UPROCK Studio
              </a>
            )}
            <span className="text-paper/40">·</span>
            {homepage.footerMadeIn && homepage.madeInUrl ? (
              <a
                href={homepage.madeInUrl}
                target="_blank"
                rel="noreferrer"
                className="text-paper/60 transition-colors hover:text-paper"
              >
                {homepage.footerMadeIn}
              </a>
            ) : (
              <span>{homepage.footerMadeIn}</span>
            )}
            <span className="text-paper/40">·</span>
            <span>{homepage.footerBuiltBy || product.builtCredit}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}