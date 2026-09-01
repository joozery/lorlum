"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { FolderOpen, FolderCheck, Package, FolderX, Search, Plus, Edit2, Trash2, MoreHorizontal } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { StatsCard } from "@/components/shared/stats-card";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Category } from "@/lib/data/categories";
import { formatDate } from "@/lib/utils";
import { DeleteConfirmDialog } from "@/components/shared/confirm-dialog";

const EMPTY_FORM = { name: "", nameEn: "", slug: "", description: "", isActive: true };

function toSlug(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function toCategory(raw: Record<string, unknown>): Category {
  return {
    id:           String(raw._id ?? raw.id),
    name:         String(raw.name ?? ""),
    nameEn:       String(raw.nameEn ?? ""),
    slug:         String(raw.slug ?? ""),
    description:  String(raw.description ?? ""),
    productCount: Number(raw.productCount ?? 0),
    isActive:     Boolean(raw.isActive),
    createdAt:    String(raw.createdAt ?? ""),
    updatedAt:    String(raw.updatedAt ?? ""),
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]       = useState<Category | null>(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/categories?limit=100");
      const data = await res.json();
      setCategories((data.categories ?? []).map(toCategory));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const stats = useMemo(() => ({
    total:    categories.length,
    active:   categories.filter((c) => c.isActive).length,
    inactive: categories.filter((c) => !c.isActive).length,
    products: categories.reduce((s, c) => s + c.productCount, 0),
  }), [categories]);

  const filtered = useMemo(() =>
    categories.filter((c) =>
      !search ||
      c.name.includes(search) ||
      c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
    ),
    [categories, search]
  );

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({ name: cat.name, nameEn: cat.nameEn, slug: cat.slug, description: cat.description, isActive: cat.isActive });
    setDialogOpen(true);
  }

  function handleNameEnChange(val: string) {
    setForm((f) => ({ ...f, nameEn: val, slug: toSlug(val) }));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.nameEn.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/categories/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const updated = toCategory(await res.json());
          setCategories((prev) => prev.map((c) => c.id === editing.id ? updated : c));
        }
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const created = toCategory(await res.json());
          setCategories((prev) => [created, ...prev]);
        }
      }
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setDeleteTarget(null);
  }

  async function handleToggleActive(cat: Category) {
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, isActive: !c.isActive } : c))
    );
    await fetch(`/api/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !cat.isActive }),
    });
  }

  return (
    <div>
      <Header title="หมวดหมู่สินค้า" />
      <main className="p-6 space-y-4">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard index={0} title="หมวดหมู่ทั้งหมด" value={String(stats.total)} icon={FolderOpen} iconColor="bg-violet-50" />
          <StatsCard index={1} title="ใช้งานอยู่" value={String(stats.active)} icon={FolderCheck} iconColor="bg-emerald-50" />
          <StatsCard index={2} title="ปิดใช้งาน" value={String(stats.inactive)} icon={FolderX} iconColor="bg-rose-50" />
          <StatsCard index={3} title="สินค้าในระบบ" value={String(stats.products)} change="จากทุกหมวดหมู่" changeType="neutral" icon={Package} iconColor="bg-blue-50" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="ค้นหาหมวดหมู่..."
              className="pl-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="ml-auto">
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" />
              เพิ่มหมวดหมู่
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">หมวดหมู่</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Slug</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">สินค้า</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">สถานะ</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">อัปเดตล่าสุด</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">กำลังโหลด...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                    {categories.length === 0 ? "ยังไม่มีหมวดหมู่ กดเพิ่มหมวดหมู่ได้เลย" : "ไม่พบหมวดหมู่"}
                  </td>
                </tr>
              ) : filtered.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
                        <FolderOpen className="h-4 w-4 text-violet-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{cat.name}</p>
                        <p className="text-xs text-gray-400">{cat.nameEn}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {cat.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant={cat.productCount === 0 ? "info" : "default"}>
                      {cat.productCount} สินค้า
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Switch
                      checked={cat.isActive}
                      onCheckedChange={() => handleToggleActive(cat)}
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {formatDate(cat.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className="z-50 min-w-[130px] rounded-lg border border-gray-100 bg-white p-1 shadow-lg"
                          align="end"
                        >
                          <DropdownMenu.Item
                            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none"
                            onSelect={() => openEdit(cat)}
                          >
                            <Edit2 className="h-3.5 w-3.5" /> แก้ไข
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
                          <DropdownMenu.Item
                            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-50 focus:outline-none"
                            onSelect={() => setDeleteTarget(cat)}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> ลบ
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        itemName={deleteTarget?.name}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>ชื่อหมวดหมู่ (ภาษาไทย) <span className="text-red-500">*</span></Label>
              <Input
                placeholder="เช่น เสื้อผ้า, รองเท้า"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>ชื่อภาษาอังกฤษ <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="e.g. Tops"
                  value={form.nameEn}
                  onChange={(e) => handleNameEnChange(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input
                  placeholder="tops"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: toSlug(e.target.value) }))}
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>คำอธิบาย</Label>
              <Textarea
                placeholder="อธิบายหมวดหมู่นี้สั้นๆ..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-700">เปิดใช้งาน</p>
                <p className="text-xs text-gray-400">แสดงหมวดหมู่นี้บนหน้าร้าน</p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
              <Button onClick={handleSave} disabled={!form.name.trim() || !form.nameEn.trim() || saving}>
                {saving ? "กำลังบันทึก..." : editing ? "บันทึก" : "เพิ่มหมวดหมู่"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
