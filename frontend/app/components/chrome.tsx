"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Homepage, Product } from "../../lib/api";
import OrderPopup from "./OrderPopup";
import MenuPopup from "./MenuPopup";

type OrderCtx = { openOrder: () => void; openMenu: () => void };
const Ctx = createContext<OrderCtx>({ openOrder: () => {}, openMenu: () => {} });

export const useOrder = () => useContext(Ctx);

/**
 * OrderProvider — owns the two overlays the reference opens from the header:
 * the early-access popup (the CTA) and the mobile menu popup (the burger).
 */
export function OrderProvider({
  children,
  homepage,
  product
}: {
  children: ReactNode;
  homepage: Homepage;
  product: Product;
}) {
  const [orderOpen, setOrderOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const openOrder = useCallback(() => {
    setMenuOpen(false);
    setOrderOpen(true);
  }, []);
  const openMenu = useCallback(() => setMenuOpen(true), []);

  const value = useMemo(() => ({ openOrder, openMenu }), [openOrder, openMenu]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <OrderPopup
        homepage={homepage}
        product={product}
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
      />
      <MenuPopup open={menuOpen} onClose={() => setMenuOpen(false)} product={product} />
    </Ctx.Provider>
  );
}
