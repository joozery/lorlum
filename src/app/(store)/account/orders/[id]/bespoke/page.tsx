"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function BespokePage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  useEffect(() => {
    if (!id) return;
    fetch(`/api/store/orders/${id}/bespoke`)
      .then(r => {
        if (r.status === 401) { router.push("/account"); return null; }
        return r.json();
      })
      .then(d => {
        if (!d) return;
        if (!d.hasBespoke) { router.push("/account/orders"); return; }

        // If multiple types exist, prefer trousers (has more fields)
        const types: string[] = (d.bespokeItems ?? []).map((i: { garmentType: string }) => i.garmentType);
        const hasShirt     = types.includes("shirt");
        const hasTrousers  = types.includes("trousers");

        if (hasTrousers && !hasShirt) router.replace(`/account/orders/${id}/bespoke/trousers`);
        else                          router.replace(`/account/orders/${id}/bespoke/shirt`);
      })
      .catch(() => router.push("/account/orders"));
  }, [id, router]);

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center font-jost">
      <p className="text-[10px] tracking-[0.4em] uppercase text-gold animate-pulse">Loading…</p>
    </div>
  );
}
