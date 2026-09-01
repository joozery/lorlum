"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, Search, Package, PackageCheck, AlertTriangle, Tag } from "lucide-react";
import Link from "next/link";
import { StatsCard } from "@/components/shared/stats-card";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ProductTable } from "@/components/products/product-table";
import { Pagination } from "@/components/shared/pagination";
import type { Product, ColorVariant } from "@/types";

function toProduct(raw: Record<string, unknown>): Product {
  return {
    id:             String(raw._id ?? raw.id),
    sku:            String(raw.sku ?? ""),
    name:           String(raw.name ?? ""),
    nameEn:         String(raw.nameEn ?? ""),
    description:    String(raw.description ?? ""),
    descriptionEn:  String(raw.descriptionEn ?? ""),
    price:          Number(raw.price ?? 0),
    costPrice:      raw.costPrice != null ? Number(raw.costPrice) : undefined,
    category:       String(raw.category ?? ""),
    imageUrl:       String(raw.imageUrl ?? ""),
    stock:          Number(raw.stock ?? 0),
    isActive:       Boolean(raw.isActive),
    featured:       Boolean(raw.featured),
    colorVariants:    Array.isArray(raw.colorVariants) ? (raw.colorVariants as ColorVariant[]) : [],
    sizes:            Array.isArray(raw.sizes) ? (raw.sizes as number[]) : [],
    materials:        String(raw.materials        ?? ""),
    fitSizing:        String(raw.fitSizing        ?? ""),
    careInstructions: String(raw.careInstructions ?? ""),
    createdAt:        String(raw.createdAt ?? ""),
    updatedAt:        String(raw.updatedAt ?? ""),
  };
}

export default function ProductsPage() {
  const [search,      setSearch]      = useState("");
  const [category,    setCategory]    = useState("all");
  const [featured,    setFeatured]    = useState("all");
  const [status,      setStatus]      = useState("all");
  const [products,    setProducts]    = useState<Product[]>([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [categories,  setCategories]  = useState<string[]>([]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)              params.set("search",   search);
    if (category !== "all") params.set("category", category);
    if (featured !== "all") params.set("featured", featured);
    if (status   !== "all") params.set("status",   status);
    params.set("limit", "100");

    try {
      const res  = await fetch(`/api/products?${params}`);
      const data = await res.json();
      const list = (data.products ?? []).map(toProduct);
      setProducts(list);
      setTotal(data.total ?? list.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, featured, status]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    fetch("/api/categories?limit=100&status=active")
      .then((r) => r.json())
      .then((d) => setCategories((d.categories ?? []).map((c: { name: string }) => c.name)))
      .catch(console.error);
  }, []);

  const stats = useMemo(() => ({
    total:      total,
    active:     products.filter((p) => p.isActive).length,
    lowStock:   products.filter((p) => p.stock < 10).length,
    categories: new Set(products.map((p) => p.category)).size,
  }), [products, total]);

  const handleToggleActive = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );

    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !product.isActive }),
    });
  };

  return (
    <div>
      <Header title="จัดการสินค้า" />
      <main className="p-6 space-y-4">
        {/* KPI Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard index={0} title="สินค้าทั้งหมด"  value={String(stats.total)}      icon={Package}      iconColor="bg-blue-50" />
          <StatsCard index={1} title="สินค้าที่ใช้งาน" value={String(stats.active)}    change={`${stats.total - stats.active} ปิดใช้งาน`} changeType="neutral" icon={PackageCheck} iconColor="bg-emerald-50" />
          <StatsCard index={2} title="สินค้าใกล้หมด"  value={String(stats.lowStock)}   change="สต็อก < 10 ชิ้น" changeType="down" icon={AlertTriangle} iconColor="bg-amber-50" />
          <StatsCard index={3} title="หมวดหมู่"        value={String(stats.categories)} icon={Tag}          iconColor="bg-purple-50" />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search products..."
              className="pl-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-36 text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Category</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={featured} onValueChange={setFeatured}>
            <SelectTrigger className="w-32 text-sm"><SelectValue placeholder="Featured" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Featured</SelectItem>
              <SelectItem value="yes">แนะนำ</SelectItem>
              <SelectItem value="no">ไม่แนะนำ</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-28 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Status</SelectItem>
              <SelectItem value="active">ใช้งาน</SelectItem>
              <SelectItem value="inactive">ปิด</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto">
            <Link href="/products/new">
              <Button><Plus className="h-4 w-4" />เพิ่มสินค้า</Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
            กำลังโหลด...
          </div>
        ) : (
          <>
            <ProductTable products={products} onToggleActive={handleToggleActive} />
            <Pagination total={total} shown={products.length} />
          </>
        )}
      </main>
    </div>
  );
}
