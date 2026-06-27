import Link from "next/link";
import { GalleryGrid } from "@/components/GalleryGrid";
import { siteConfig } from "@/data/site";
import { getHomepagePreviews } from "@/data/gallery";

export default function Home() {
  const { gallery, store } = getHomepagePreviews();

  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <p className="max-w-2xl text-lg leading-8 text-muted">{siteConfig.tagline}</p>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          Images that encourage people to get outside and explore.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-8">
          <p className="font-heading text-xs text-muted">Portfolio</p>
          <h2 className="font-heading mt-2 text-2xl text-foreground sm:text-3xl">Gallery</h2>
        </div>
        <GalleryGrid
          items={gallery}
          mode="gallery"
          columns={2}
          showFeaturedBadge={false}
          onLightboxCloseNavigateTo="/gallery"
        />
        <div className="mt-10">
          <Link
            href="/gallery"
            className="inline-block border border-accent px-6 py-3 font-heading text-xs tracking-[0.14em] text-accent transition hover:bg-accent hover:text-background"
          >
            View gallery
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-8">
          <p className="font-heading text-xs text-muted">Prints</p>
          <h2 className="font-heading mt-2 text-2xl text-foreground sm:text-3xl">Print Store</h2>
        </div>
        <GalleryGrid items={store} mode="store" columns={2} />
        <div className="mt-10">
          <Link
            href="/prints"
            className="inline-block bg-accent px-6 py-3 font-heading text-xs tracking-[0.14em] text-background transition hover:opacity-90"
          >
            Browse all prints
          </Link>
        </div>
      </section>
    </div>
  );
}
