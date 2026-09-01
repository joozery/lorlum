"use client";

import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/types";

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
}

export function ProductForm({ product, onClose }: ProductFormProps) {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/categories?limit=100&status=active")
      .then((r) => r.json())
      .then((d) => setCategories((d.categories ?? []).map((c: { name: string }) => c.name)))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>ชื่อสินค้า (TH)</Label>
          <Input defaultValue={product?.name} placeholder="ชื่อสินค้าภาษาไทย" />
        </div>
        <div className="space-y-1.5">
          <Label>ชื่อสินค้า (EN)</Label>
          <Input defaultValue={product?.nameEn} placeholder="Product name in English" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>รหัสสินค้า (SKU)</Label>
          <Input defaultValue={product?.sku} placeholder="TSH-001" />
        </div>
        <div className="space-y-1.5">
          <Label>หมวดหมู่</Label>
          <Select defaultValue={product?.category}>
            <SelectTrigger><SelectValue placeholder="เลือกหมวดหมู่" /></SelectTrigger>
            <SelectContent>
              {categories.length === 0 && (
                <SelectItem value="_none" disabled>ยังไม่มีหมวดหมู่</SelectItem>
              )}
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>ราคา (บาท)</Label>
          <Input type="number" defaultValue={product?.price} placeholder="0" />
        </div>
        <div className="space-y-1.5">
          <Label>จำนวน Stock</Label>
          <Input type="number" defaultValue={product?.stock} placeholder="0" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>รายละเอียด (TH)</Label>
        <Textarea defaultValue={product?.description} placeholder="รายละเอียดสินค้า" rows={3} />
      </div>

      <div className="space-y-1.5">
        <Label>รายละเอียด (EN)</Label>
        <Textarea defaultValue={product?.descriptionEn} placeholder="Product description" rows={3} />
      </div>

      <div className="space-y-1.5">
        <Label>รูปภาพสินค้า</Label>
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
            <Package className="h-6 w-6 text-gray-300" />
          </div>
          <Button variant="outline" size="sm">อัปโหลดรูปภาพ</Button>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Switch id="isActive" defaultChecked={product?.isActive ?? true} />
        <Label htmlFor="isActive">แสดงสินค้า</Label>
      </div>

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
        <Button variant="outline" onClick={onClose}>ยกเลิก</Button>
        <Button onClick={onClose}>{product ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}</Button>
      </div>
    </div>
  );
}
