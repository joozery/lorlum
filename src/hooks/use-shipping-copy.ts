"use client";

import { useState, useEffect } from "react";

export interface ShippingCopy {
  deliveryTitle: { en: string; th: string };
  deliveryDesc: { en: string; th: string };
  cartNote: { en: string; th: string };
  accordShippingBody: { en: string; th: string };
}

export function useShippingCopy() {
  const [shippingCopy, setShippingCopy] = useState<ShippingCopy | null>(null);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.shippingCopy) setShippingCopy(d.shippingCopy);
      })
      .catch(() => {});
  }, []);

  return shippingCopy;
}
