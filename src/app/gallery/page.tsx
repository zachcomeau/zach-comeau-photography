import type { Metadata } from "next";
import { GalleryGrid } from "@/components/GalleryGrid";
import { PageHeader } from "@/components/PageHeader";
import { getGalleryItems } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Gallery",
};

export default function GalleryPage() {
  const items = getGalleryItems();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <PageHeader
        label="Gallery"
        title="Gallery"
        description="Landscape and wildlife photography from New England trails, summits, and wild places."
      />
      <GalleryGrid items={items} mode="gallery" showFeaturedBadge={false} />
    </div>
  );
}
