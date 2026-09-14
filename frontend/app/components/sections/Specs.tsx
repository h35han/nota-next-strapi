"use client";

import type { Product, SpecItem } from "../../../lib/api";

export default function Specs({
  product,
  specs,
}: {
  product: Product;
  specs: SpecItem[];
}) {
  return <section id="specs" />;
}
