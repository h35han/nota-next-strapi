"use client";

import type { Homepage, Product } from "../../lib/api";

export default function OrderPopup({
  homepage,
  product,
  open,
  onClose,
}: {
  homepage: Homepage;
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return <div />;
}
