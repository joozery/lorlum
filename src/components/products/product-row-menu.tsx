"use client";

import { MoreHorizontal, Edit2, Eye, EyeOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

interface ProductRowMenuProps {
  product: Product;
  onToggleActive: (id: string) => void;
}

export function ProductRowMenu({ product, onToggleActive }: ProductRowMenuProps) {
  const router = useRouter();

  return (
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
          <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-50 focus:outline-none">
            <Trash2 className="h-3.5 w-3.5" /> ลบสินค้า
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
