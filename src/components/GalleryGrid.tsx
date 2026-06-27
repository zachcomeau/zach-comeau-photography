"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GalleryItem } from "@/data/gallery";
import { Lightbox } from "@/components/Lightbox";

type GalleryGridProps = {
  items: GalleryItem[];
  mode?: "gallery" | "store";
  columns?: 2 | 3;
  showFeaturedBadge?: boolean;
  onLightboxCloseNavigateTo?: string;
};

const gridClassByColumns: Record<2 | 3, string> = {
  2: "grid grid-cols-2 gap-4",
  3: "grid grid-cols-3 gap-4",
};

const imageSizesByColumns: Record<2 | 3, string> = {
  2: "50vw",
  3: "33vw",
};

export function GalleryGrid({
  items,
  mode = "gallery",
  columns,
  showFeaturedBadge = false,
  onLightboxCloseNavigateTo,
}: GalleryGridProps) {
  const router = useRouter();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleLightboxClose = () => {
    setLightboxIndex(null);
    if (onLightboxCloseNavigateTo) {
      router.push(onLightboxCloseNavigateTo);
    }
  };

  const gridClassName =
    columns !== undefined
      ? gridClassByColumns[columns]
      : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

  const imageSizes =
    columns !== undefined
      ? imageSizesByColumns[columns]
      : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

  return (
    <>
      <div className={gridClassName}>
        {items.map((item, index) => {
          const tileClassName =
            "group relative aspect-[4/3] overflow-hidden bg-border text-left";

          const imageContent = item.imageSrc ? (
            <Image
              src={item.imageSrc}
              alt={item.altText ?? item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes={imageSizes}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-border p-4 text-center">
              <span className="font-heading text-[10px] text-muted">{item.category}</span>
              <span className="mt-2 text-sm text-foreground">{item.title}</span>
              <span className="mt-1 text-xs text-muted">Add image to public/</span>
            </div>
          );

          const hoverTitle = (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="font-heading text-[10px] tracking-[0.12em] text-background">
                {item.title}
              </p>
            </div>
          );

          if (mode === "store") {
            return (
              <Link
                key={item.id}
                href={`/prints/${item.slug}`}
                className={tileClassName}
                aria-label={`View print: ${item.title}`}
              >
                {imageContent}
                {hoverTitle}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className={tileClassName}
              aria-label={`View ${item.title}`}
            >
              {imageContent}
              {showFeaturedBadge && item.featured ? (
                <span className="absolute right-2 top-2 bg-highlight px-2 py-0.5 font-heading text-[10px] tracking-[0.1em] text-foreground">
                  Featured
                </span>
              ) : null}
              {hoverTitle}
            </button>
          );
        })}
      </div>

      {lightboxIndex !== null ? (
        <Lightbox
          items={items}
          initialIndex={lightboxIndex}
          onClose={handleLightboxClose}
        />
      ) : null}
    </>
  );
}
