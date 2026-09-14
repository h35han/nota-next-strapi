"use client";

import type { DetailCard, Homepage } from "../../../lib/api";

export default function Details({
  cards,
  homepage,
}: {
  cards: DetailCard[];
  homepage: Homepage;
}) {
  return <section id="details" />;
}
