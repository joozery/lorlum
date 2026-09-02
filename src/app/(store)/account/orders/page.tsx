"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StoreNav } from "@/components/store/nav";
import { StoreFooter } from "@/components/store/footer";
import { useStoreLang } from "@/contexts/store-language-context";
import ST from "@/lib/store-translations";

interface OrderItem { productName: string; imageUrl: string; color: string; size: number; price: number; qty: number }
interface Order {
  _id: string; orderNumber: string; items: OrderItem[]; total: number; status: string;
  paymentStatus: string; trackingNumber: string; createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700", confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-violet-100 text-violet-700", shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700", cancelled: "bg-red-100 text-red-600",
  refunded: "bg-gray-100 text-gray-600",
};

export default function OrdersPage() {
  const router = useRouter();
  const { lang } = useStoreLang();
  const t = ST[lang];

  const NAV = [
    { href: "/account/profile",  label: t.profNavProfile },
    { href: "/account/orders",   label: t.profNavOrders },
    { href: "/account/wishlist", label: t.profNavWishlist },
  ];

  const STATUS_LABEL: Record<string, string> = {
    pending:    t.statusPending,
    confirmed:  t.statusConfirmed,
    processing: t.statusProcessing,
    shipped:    t.statusShipped,
    delivered:  t.statusDelivered,
    cancelled:  t.statusCancelled,
    refunded:   t.statusRefunded,
  };

  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/store/orders")
      .then(r => { if (r.status === 401) { router.push("/account"); return null; } return r.json(); })
      .then(d => { if (d) setOrders(d.orders ?? []); })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="font-jost bg-ivory min-h-screen">
      <StoreNav active="home" cartCount={0} />

      <div className="max-w-[900px] mx-auto px-5 md:px-8 pt-28 pb-24">
        <div className="mb-10">
          <span className="block text-[8px] tracking-[0.5em] uppercase text-gold mb-2">{t.myAccount}</span>
          <h1 className="font-cormorant text-[32px] font-normal text-espresso">{t.orderHistory}</h1>
        </div>

        <div className="flex gap-0 border-b border-gold/20 mb-10">
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={`px-5 pb-3 text-[9px] tracking-[0.28em] uppercase no-underline transition-colors font-jost ${
                n.href === "/account/orders"
                  ? "text-espresso border-b-2 border-gold -mb-px"
                  : "text-muted hover:text-espresso"
              }`}>
              {n.label}
            </Link>
          ))}
        </div>

        {loading ? (
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted text-center py-20">{t.loadingLabel}</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <p className="font-cormorant text-[28px] text-espresso">{t.noOrders}</p>
            <p className="text-xs text-muted">{t.noOrdersDesc}</p>
            <Link href="/collection" className="inline-block mt-4 px-8 py-3 bg-espresso text-gold-lt font-jost text-[9px] tracking-[0.3em] uppercase no-underline">
              {t.shopNow}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="bg-cream border border-gold/[0.15] p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-[9px] tracking-[0.2em] uppercase text-muted mb-1">
                      Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted">
                      {new Date(order.createdAt).toLocaleDateString(lang === "th" ? "th-TH" : "en-GB", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                    {order.trackingNumber && (
                      <span className="text-[9px] tracking-[0.15em] uppercase text-muted border border-gold/20 px-2.5 py-1">
                        {t.trackLabel}: {order.trackingNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 border-t border-gold/10 pt-4">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      {item.imageUrl ? (
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-gray-100">
                          <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-12 w-10 shrink-0 bg-gold/10" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-espresso truncate">{item.productName}</p>
                        <p className="text-[10px] text-muted">
                          {[item.color, item.size ? `EU ${item.size}` : ""].filter(Boolean).join(" · ")} × {item.qty}
                        </p>
                      </div>
                      <p className="text-xs text-espresso shrink-0">฿{item.price.toLocaleString()}</p>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-[10px] text-muted pl-13">+{order.items.length - 3} {t.moreItems}</p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gold/10">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-muted">{t.total}</p>
                  <p className="font-cormorant text-[20px] text-espresso">฿{order.total.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <StoreFooter />
    </div>
  );
}
