import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Instrument_Serif, Inter } from "next/font/google";
import Providers from "./components/Providers";
import { getHtmlMetadata } from "../lib/api";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap"
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap"
});

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getHtmlMetadata();
  const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
  return {
    metadataBase,
    title: metadata.title,
    description: metadata.description,
    robots: { index: false, follow: false },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: "website",
      // Only when Strapi actually holds an `og_image`.
      ...(metadata.ogImage ? { images: [{ url: metadata.ogImage }] } : {})
    }
  };
}

/**
 * Root layout.
 *
 * The `mosaic-wrap` / `root root--primary` wrappers come straight from the
 * reference: `.root` is the positioning context the Taptop constructor
 * relies on and `.root--primary` is what applies the Inter family, so the
 * vendored `shared.css` resolves its font stack correctly.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body>
        <div className="mosaic-wrap">
          <div className="root root--primary" id="i8z5xo3zc_0">
            <Providers>{children}</Providers>
          </div>
        </div>
      </body>
    </html>
  );
}
