"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, ArrowUpDown, Package, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockTable, type StockItem } from "@/components/inventory/stock-table";
import { StockHistoryTable } from "@/components/inventory/stock-history-table";
import { StockAdjustDialog } from "@/components/inventory/stock-adjust-dialog";
import { StatsCard } from "@/components/shared/stats-card";
import { cn } from "@/lib/utils";

interface HistoryItem {
  id: string; sku: string; name: string;
  type: string; qty: number; note: string; date: string;
}

export default function InventoryPage() {
  const [items,    setItems]    = useState<StockItem[]>([]);
  const [history,  setHistory]  = useState<HistoryItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("ทั้งหมด");
  const [adjustOpen,    setAdjustOpen]    = useState(false);
  const [selectedItem,  setSelectedItem]  = useState<StockItem | null>(null);

  const fetchData = () => {
    setLoading(true);
    fetch("/api/inventory")
      .then(r => r.json())
      .then(d => { setItems(d.items ?? []); setHistory(d.history ?? []); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  // Dynamic category list from real data
  const categories = useMemo(() => {
    const cats = [...new Set(items.map(p => p.category))].filter(Boolean);
    return ["ทั้งหมด", ...cats];
  }, [items]);

  const stats = useMemo(() => {
    const critical = items.filter(p => p.stock <= 3);
    const low      = items.filter(p => p.stock > 3 && p.stock <= p.minStock);
    const normal   = items.filter(p => p.stock > p.minStock);
    return { total: items.length, normal: normal.length, low: low.length, critical: critical.length };
  }, [items]);

  const filtered = useMemo(() =>
    items.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchCat    = category === "ทั้งหมด" || p.category === category;
      return matchSearch && matchCat;
    }),
  [items, search, category]);

  const handleAdjust = (item: StockItem) => { setSelectedItem(item); setAdjustOpen(true); };

  const kpis = [
    { title: "สินค้าทั้งหมด", value: String(stats.total),    change: "SKU ในระบบ",       changeType: "neutral" as const, icon: Package,     iconColor: "bg-blue-50" },
    { title: "สต็อกปกติ",     value: String(stats.normal),   change: "พร้อมขาย",          changeType: "up"      as const, icon: CheckCircle2, iconColor: "bg-emerald-50" },
    { title: "ใกล้หมด",       value: String(stats.low),      change: "ต่ำกว่า min stock", changeType: stats.low      > 0 ? "down" as const : "neutral" as const, icon: AlertTriangle, iconColor: "bg-amber-50" },
    { title: "วิกฤต",         value: String(stats.critical), change: "ต้องสั่งด่วน",      changeType: stats.critical > 0 ? "down" as const : "neutral" as const, icon: XCircle,       iconColor: "bg-red-50" },
  ];

  return (
    <div>
      <Header title="คลังสินค้า" />
      <main className="p-6 space-y-6">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k, i) => (
            <StatsCard key={i} index={i}
              title={k.title} value={k.value} change={k.change}
              changeType={k.changeType} icon={k.icon} iconColor={k.iconColor}
            />
          ))}
        </div>

        {stats.critical > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
            <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800">สินค้าวิกฤต {stats.critical} รายการ — ต้องสั่งซื้อด่วน</p>
              <p className="mt-0.5 text-xs text-red-600 truncate">
                {items.filter(p => p.stock <= 3).map(p => p.name).join(" · ")}
              </p>
            </div>
            <Button size="sm" variant="outline" className="flex-shrink-0 border-red-200 text-red-700 hover:bg-red-100 text-xs">สั่งซื้อ</Button>
          </div>
        )}

        <Tabs defaultValue="stock">
          <TabsList className="bg-gray-100/80 p-1">
            <TabsTrigger value="stock" className="flex items-center gap-1.5 text-xs">
              สต๊อกสินค้า
              <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-gray-600 shadow-sm">
                {loading ? "…" : items.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1.5 text-xs">
              ประวัติการเคลื่อนไหว
              <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-gray-600 shadow-sm">
                {loading ? "…" : history.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[200px] flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input placeholder="ค้นหาสินค้า, SKU..." className="pl-9 border-gray-200 bg-white text-sm"
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm flex-wrap">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                      category === cat ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    )}>
                    {cat}
                  </button>
                ))}
              </div>
              <Button size="sm" className="ml-auto gap-2 text-xs"
                onClick={() => { setSelectedItem(null); setAdjustOpen(true); }}>
                <ArrowUpDown className="h-3.5 w-3.5" /> ปรับ Stock
              </Button>
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white">
                <p className="text-sm text-gray-400">กำลังโหลดข้อมูลสต็อก...</p>
              </div>
            ) : (
              <StockTable items={filtered} onAdjust={handleAdjust} />
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <StockHistoryTable history={history} />
          </TabsContent>
        </Tabs>

        <StockAdjustDialog
          open={adjustOpen}
          selectedItem={selectedItem}
          onClose={() => { setAdjustOpen(false); fetchData(); }}
        />
      </main>
    </div>
  );
}
