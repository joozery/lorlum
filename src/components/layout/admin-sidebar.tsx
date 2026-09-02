"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
// AnimatePresence is still used for submenu expand/collapse
import {
  LayoutDashboard, Package, FolderOpen,
  ShoppingCart, CreditCard, Users, Globe, ShieldCheck,
  Lock, Settings, ChevronRight, ChevronLeft, X,
  LogOut, Warehouse, ShoppingBag, TrendingUp,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import T, { Translations } from "@/lib/translations";

// ── Design tokens ─────────────────────────────────────────────────────────────
const G = {
  gold:     "#C9A94B",
  goldDim:  "rgba(201,169,75,0.65)",
  goldGrad: "linear-gradient(90deg, rgba(201,169,75,0.15) 0%, rgba(201,169,75,0.05) 65%, transparent 100%)",
  goldBar:  "linear-gradient(180deg, #C9A94B 0%, rgba(201,169,75,0.45) 100%)",
  bg:       "#000000",
  bgHover:  "rgba(255,255,255,0.05)",
  border:   "#202020",
  text:     "#B8B8B8",
  section:  "#4A4A4A",
  muted:    "#303030",
} as const;

const EXPANDED = 250;
const COLLAPSED = 64;

// ── Types ─────────────────────────────────────────────────────────────────────
interface SubItem { id: string; label: string; href: string }
interface NavItem  { id: string; label: string; href: string; icon: React.ElementType; children?: SubItem[] }
interface Section  { title: string; items: NavItem[] }

// ── Navigation (built from translations) ─────────────────────────────────────
function buildNAV(t: Translations): Section[] {
  return [
    {
      title: t.sMain,
      items: [
        { id: "overview", label: t.dashboard, href: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: t.sCatalogue,
      items: [
        {
          id: "products", label: t.products, href: "/products", icon: Package,
          children: [{ id: "p-all", label: t.allProducts, href: "/products" }],
        },
        {
          id: "categories", label: t.categories, href: "/categories", icon: FolderOpen,
          children: [{ id: "c-all", label: t.allCategories, href: "/categories" }],
        },
      ],
    },
    {
      title: t.sSales,
      items: [
        { id: "orders",   label: t.orders,   href: "/orders",   icon: ShoppingCart },
        { id: "payments", label: t.payments, href: "/payments", icon: CreditCard },
        {
          id: "customers", label: t.customers, href: "/customers", icon: Users,
          children: [{ id: "u-all", label: t.allCustomers, href: "/customers" }],
        },
      ],
    },
    {
      title: t.sWarehouse,
      items: [
        { id: "inventory", label: t.inventory, href: "/inventory", icon: Warehouse },
        { id: "purchases", label: t.purchases, href: "/purchases", icon: ShoppingBag },
      ],
    },
    {
      title: t.sStorefront,
      items: [
        {
          id: "storefront", label: t.storefront, href: "/storefront/hero", icon: Globe,
          children: [
            { id: "sf-hero",    label: "Hero Section",    href: "/storefront/hero" },
            { id: "sf-contact", label: "Contact & Inbox",  href: "/storefront/contact" },
            { id: "sf-legal",   label: "Legal & Cookies",  href: "/storefront/legal" },
          ],
        },
      ],
    },
    {
      title: t.sFinance,
      items: [
        {
          id: "finance", label: t.financeOverview, href: "/finance", icon: TrendingUp,
          children: [
            { id: "fi-pl",       label: t.financeOverview, href: "/finance" },
            { id: "fi-expenses", label: t.expenses,         href: "/finance/expenses" },
          ],
        },
      ],
    },
    {
      title: t.sAdministration,
      items: [
        { id: "admins",   label: t.adminUsers, href: "/admin/users", icon: ShieldCheck },
        { id: "roles",    label: t.roles,      href: "/admin/roles", icon: Lock },
        { id: "settings", label: t.settings,   href: "/settings",   icon: Settings },
      ],
    },
  ];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function isActive(href: string, pathname: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}
function isParentActive(item: NavItem, pathname: string) {
  return isActive(item.href, pathname) ||
    (item.children?.some((c) => isActive(c.href, pathname)) ?? false);
}

// ── SubNavItem ────────────────────────────────────────────────────────────────
function SubNavItem({ item, pathname }: { item: SubItem; pathname: string }) {
  const active = isActive(item.href, pathname);
  return (
    <div className="relative">
      <div style={{
        position: "absolute", left: -17, top: "50%",
        transform: "translateY(-50%)", width: 13, height: 1,
        background: active ? G.goldDim : G.border, transition: "background 150ms",
      }} />
      <Link
        href={item.href}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 12px", borderRadius: 8,
          fontSize: 13, fontWeight: active ? 500 : 400,
          color: active ? G.gold : G.text,
          background: active ? G.goldGrad : "transparent",
          transition: "background 150ms, color 150ms",
        }}
        onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = G.bgHover; }}
        onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        <span style={{
          width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
          background: active ? G.gold : G.muted, transition: "background 150ms",
          display: "inline-block",
        }} />
        {item.label}
      </Link>
    </div>
  );
}

// ── NavMenuItem ───────────────────────────────────────────────────────────────
function NavMenuItem({
  item, pathname, expanded, onToggle, collapsed,
}: {
  item: NavItem; pathname: string; expanded: boolean;
  onToggle: () => void; collapsed: boolean;
}) {
  const hasChildren = (item.children?.length ?? 0) > 0;
  const parentActive = isParentActive(item, pathname);

  const innerDiv = (
    <div
      style={{
        position: "relative", borderRadius: 8, overflow: "hidden",
        background: parentActive ? G.goldGrad : "transparent",
        transition: "background 150ms",
      }}
      onMouseEnter={(e) => { if (!parentActive) (e.currentTarget as HTMLElement).style.background = G.bgHover; }}
      onMouseLeave={(e) => { if (!parentActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {parentActive && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 2.5,
          background: G.goldBar, borderRadius: "0 2px 2px 0",
        }} />
      )}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: 10,
        padding: collapsed ? "13px 0" : "11px 14px 11px 16px",
        minHeight: 44, cursor: "pointer", userSelect: "none",
      }}>
        <item.icon style={{
          width: 18, height: 18, flexShrink: 0,
          color: parentActive ? G.gold : G.text,
          opacity: parentActive ? 1 : 0.6,
          transition: "color 150ms, opacity 150ms",
        }} />
        {!collapsed && (
          <>
            <span style={{
              flex: 1, fontSize: 14, fontWeight: parentActive ? 500 : 400,
              color: parentActive ? G.gold : G.text,
              letterSpacing: "0.01em", whiteSpace: "nowrap",
            }}>
              {item.label}
            </span>
            {hasChildren && (
              <motion.div
                animate={{ rotate: expanded ? 90 : 0 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                style={{ color: parentActive ? G.gold : G.section, opacity: 0.65 }}
              >
                <ChevronRight style={{ width: 14, height: 14 }} />
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );

  if (collapsed) {
    return <Link href={item.href} className="block" title={item.label}>{innerDiv}</Link>;
  }

  if (hasChildren) {
    return (
      <div>
        <div onClick={onToggle}>{innerDiv}</div>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="sub"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div style={{
                marginLeft: 32, paddingLeft: 16,
                borderLeft: `1px solid ${G.border}`,
                marginTop: 4, marginBottom: 8,
                display: "flex", flexDirection: "column", gap: 2,
              }}>
                {item.children!.map((sub) => (
                  <SubNavItem key={sub.id} item={sub} pathname={pathname} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return <Link href={item.href} className="block">{innerDiv}</Link>;
}

// ── SidebarInner ──────────────────────────────────────────────────────────────
function SidebarInner({
  onClose, collapsed,
}: {
  onClose?: () => void;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const t = T[lang];
  const NAV = buildNAV(t);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(["products"]));

  useEffect(() => {
    NAV.forEach((section) =>
      section.items.forEach((item) => {
        if (item.children?.some((c) => isActive(c.href, pathname))) {
          setExpanded((prev) => new Set([...prev, item.id]));
        }
      })
    );
  }, [pathname]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      width: "100%", background: G.bg,
      fontFamily: "var(--font-prompt, 'Prompt', sans-serif)",
    }}>

      {/* ── Logo ──────────────────────────────────────────────── */}
      {collapsed ? (
        /* ── Collapsed: "AP" monogram ── */
        <div style={{
          flexShrink: 0, padding: "18px 0",
          display: "flex", justifyContent: "center",
          borderBottom: `1px solid ${G.border}`,
        }}>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "linear-gradient(135deg, rgba(201,169,75,0.15) 0%, rgba(201,169,75,0.05) 100%)",
              border: "1px solid rgba(201,169,75,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{
                fontSize: 13, fontWeight: 700, color: G.gold,
                letterSpacing: "0.05em",
                fontFamily: "var(--font-prompt, 'Prompt', sans-serif)",
              }}>
                AP
              </span>
            </div>
          </Link>
        </div>
      ) : (
        /* ── Expanded: text-only centered logo ── */
        <div style={{
          flexShrink: 0, position: "relative",
          background: "linear-gradient(180deg, rgba(201,169,75,0.05) 0%, transparent 100%)",
          borderBottom: `1px solid ${G.border}`,
        }}>
          {/* Gold top line */}
          <div style={{
            height: 2,
            background: "linear-gradient(90deg, transparent 0%, #C9A94B 40%, #C9A94B 60%, transparent 100%)",
          }} />

          {/* Mobile close */}
          {onClose && (
            <button onClick={onClose} style={{
              position: "absolute", top: 14, right: 14,
              background: "none", border: "none", cursor: "pointer",
              padding: 4, borderRadius: 6, color: G.section,
            }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = G.text}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = G.section}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          )}

          <Link href="/dashboard" style={{ textDecoration: "none", display: "block" }}>
            <div style={{
              padding: "22px 16px 20px",
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 6,
            }}>
              <p style={{
                fontSize: 17, fontWeight: 700,
                color: "#F0F0F0", letterSpacing: "0.06em",
                lineHeight: 1.2,
              }}>
                Admin Panel
              </p>
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8,
              }}>
                <div style={{ height: 1, width: 24, background: "rgba(201,169,75,0.25)" }} />
                <p style={{
                  fontSize: 9, color: G.gold, opacity: 0.55,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                }}>
                  E-Commerce
                </p>
                <div style={{ height: 1, width: 24, background: "rgba(201,169,75,0.25)" }} />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* ── Nav ───────────────────────────────────────────────── */}
      <div className="sidebar-scroll" style={{ flex: 1, overflowY: "auto", padding: collapsed ? "12px 10px" : "16px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: collapsed ? 4 : 22 }}>
          {NAV.map((section, i) => (
            <div key={section.title}>
              {i > 0 && (
                <div style={{
                  height: 1, background: G.border,
                  margin: collapsed ? "6px 14px" : "0 0 14px 0",
                }} />
              )}
              {!collapsed && (
                <p style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "1.5px",
                  textTransform: "uppercase", color: G.section,
                  padding: "0 12px", marginBottom: 5,
                }}>
                  {section.title}
                </p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {section.items.map((item) => (
                  <NavMenuItem
                    key={item.id}
                    item={item}
                    pathname={pathname}
                    expanded={expanded.has(item.id)}
                    onToggle={() => toggle(item.id)}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── User footer ───────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${G.border}`, padding: collapsed ? "12px 0" : "12px 10px", flexShrink: 0 }}>
        {collapsed ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Link href="/login" title="ออกจากระบบ" style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(201,169,75,0.1)",
              border: "1px solid rgba(201,169,75,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: G.gold, fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}>
              A
            </Link>
          </div>
        ) : (
          <Link
            href="/login"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 8,
              textDecoration: "none", transition: "background 150ms",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = G.bgHover}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
          >
            <div style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              background: "rgba(201,169,75,0.1)",
              border: "1px solid rgba(201,169,75,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: G.gold, fontSize: 13, fontWeight: 600,
            }}>
              A
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#D0D0D0", lineHeight: 1.3 }}>
                Admin
              </p>
              <p style={{ fontSize: 11, color: G.section, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                admin@shop.com
              </p>
            </div>
            <LogOut style={{ width: 14, height: 14, color: G.section, flexShrink: 0 }} />
          </Link>
        )}
      </div>
    </div>
  );
}

// ── AdminSidebar ──────────────────────────────────────────────────────────────
export function AdminSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { lang } = useLanguage();
  const t = T[lang];

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40,
          width: collapsed ? COLLAPSED : EXPANDED,
          transition: "width 250ms cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
      >
        <SidebarInner collapsed={collapsed} />
      </aside>

      {/* ── Floating collapse tab ── */}
      <motion.button
        onClick={onToggle}
        title={collapsed ? t.expandMenu : t.collapseMenu}
        animate={{ left: collapsed ? COLLAPSED : EXPANDED }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: "fixed",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 41,
          width: 16,
          height: 48,
          borderRadius: "0 6px 6px 0",
          background: "#181818",
          border: `1px solid ${G.border}`,
          borderLeft: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
          padding: 0,
        }}
        whileHover={{ color: "#B8B8B8", backgroundColor: "#252525" }}
      >
        {collapsed
          ? <ChevronRight style={{ width: 10, height: 10 }} />
          : <ChevronLeft  style={{ width: 10, height: 10 }} />
        }
      </motion.button>
    </>
  );
}
