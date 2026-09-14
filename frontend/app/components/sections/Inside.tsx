"use client";

import type { BoxItem, Homepage } from "../../../lib/api";

export default function Inside({
  items,
  homepage,
}: {
  items: BoxItem[];
  homepage: Homepage;
}) {
  return <section id="inside" />;
}
