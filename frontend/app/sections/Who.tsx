"use client";

import type { Audience, Product } from "../../lib/api";

export default function Who({ product, audiences }: { product: Product; audiences: Audience[] }) {
  return <section id="who" />;
}
