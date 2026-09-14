"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { Homepage, Product } from "../../lib/api";
import OrderPopup from "./OrderPopup";

type OrderCtx = { openOrder: () => void };
const Ctx = createContext<OrderCtx>({ openOrder: () => {} });

export const useOrder = () => useContext(Ctx);

export function OrderProvider({
  children,
  homepage,
  product,
}: {
  children: ReactNode;
  homepage: Homepage;
  product: Product;
}) {
  const [open, setOpen] = useState(false);
  const openOrder = useCallback(() => setOpen(true), []);

  return (
    <Ctx.Provider value={{ openOrder }}>
      {children}
      <OrderPopup
        homepage={homepage}
        product={product}
        open={open}
        onClose={() => setOpen(false)}
      />
    </Ctx.Provider>
  );
}