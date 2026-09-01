import { ProductPageForm } from "@/components/products/product-page-form";
import { notFound } from "next/navigation";
import type { Product } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  let product: Product | null = null;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/products/${id}`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const raw = await res.json();
      product = {
        id:            String(raw._id ?? raw.id),
        sku:           raw.sku           ?? "",
        name:          raw.name          ?? "",
        nameEn:        raw.nameEn        ?? "",
        description:   raw.description   ?? "",
        descriptionEn: raw.descriptionEn ?? "",
        price:         Number(raw.price  ?? 0),
        costPrice:     raw.costPrice != null ? Number(raw.costPrice) : undefined,
        category:      raw.category      ?? "",
        imageUrl:      raw.imageUrl      ?? "",
        stock:         Number(raw.stock  ?? 0),
        isActive:      Boolean(raw.isActive),
        featured:      Boolean(raw.featured),
        colorVariants:    Array.isArray(raw.colorVariants) ? raw.colorVariants : [],
        sizes:            Array.isArray(raw.sizes) ? raw.sizes : [],
        materials:        String(raw.materials        ?? ""),
        fitSizing:        String(raw.fitSizing        ?? ""),
        careInstructions: String(raw.careInstructions ?? ""),
        createdAt:        String(raw.createdAt ?? ""),
        updatedAt:        String(raw.updatedAt ?? ""),
      };
    }
  } catch {
    // network error — fall through to notFound
  }

  if (!product) notFound();
  return <ProductPageForm product={product} />;
}
