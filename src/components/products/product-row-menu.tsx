"use client";

import { useState } from "react";
import { MoreHorizontal, Edit2, Eye, EyeOff, Trash2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

interface ProductRowMenuProps {
  product: Product;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
}

function DeleteModal({
  product,
  onConfirm,
  onCancel,
}: {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Red top strip */}
        <div className="h-1 w-full bg-gradient-to-r from-red-400 to-red-600" />

        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
          </div>

          {/* Text */}
          <h3 className="text-center text-[15px] font-semibold text-gray-900 mb-1">
            ยืนยันการลบสินค้า
          </h3>
          <p className="text-center text-[13px] text-gray-500 mb-1">
            คุณต้องการลบ
          </p>
          <p className="text-center text-[13px] font-medium text-gray-800 mb-4 px-4 truncate">
            &ldquo;{product.name}&rdquo;
          </p>
          <p className="text-center text-[12px] text-red-400 mb-6">
            การกระทำนี้ไม่สามารถย้อนกลับได้
          </p>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 h-10 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 h-10 rounded-lg bg-red-500 text-[13px] font-medium text-white hover:bg-red-600 transition-colors"
            >
              ลบสินค้า
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductRowMenu({ product, onToggleActive, onDelete }: ProductRowMenuProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 min-w-[140px] rounded-lg border border-gray-100 bg-white p-1 shadow-lg"
            align="end"
          >
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none"
              onSelect={() => router.push(`/products/${product.id}/edit`)}
            >
              <Edit2 className="h-3.5 w-3.5" /> แก้ไข
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none"
              onSelect={() => onToggleActive(product.id)}
            >
              {product.isActive
                ? <><EyeOff className="h-3.5 w-3.5" /> ซ่อน</>
                : <><Eye className="h-3.5 w-3.5" /> แสดง</>
              }
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-50 focus:outline-none"
              onSelect={() => setShowDeleteModal(true)}
            >
              <Trash2 className="h-3.5 w-3.5" /> ลบสินค้า
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {showDeleteModal && (
        <DeleteModal
          product={product}
          onConfirm={() => { setShowDeleteModal(false); onDelete(product.id); }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}
