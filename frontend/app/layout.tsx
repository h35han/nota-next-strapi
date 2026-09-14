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
      images: [{ url: metadata.ogImage }]
    }
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
