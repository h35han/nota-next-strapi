"use client";

import type { Homepage, Product, TeamMember } from "../../lib/api";

export default function Footer({
  product,
  homepage,
  team,
}: {
  product: Product;
  homepage: Homepage;
  team: TeamMember[];
}) {
  return <footer />;
}
