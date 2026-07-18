import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintPurchasePanel } from "@/components/PrintPurchasePanel";
import { getBySlug } from "@/data/gallery";
import { storeConfig } from "@/data/products";
import { siteConfig } from "@/data/site";
import { getResolvedOfferingsForSlug, getShippingPrice } from "@/lib/stripe-catalog";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

function getPrintDescription(item: NonNullable<ReturnType<typeof getBySlug>>): string {
  return item.caption ?? item.altText ?? `${item.title} — fine art print by ${siteConfig.name}`;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getBySlug(slug);
  if (!item) return { title: "Print not found" };

  const description = getPrintDescription(item);

  return {
    title: item.title,
    description,
    openGraph: {
      title: `${item.title} · ${siteConfig.name}`,
      description,
      images: item.imageSrc ? [{ url: item.imageSrc, alt: item.altText ?? item.title }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const item = getBySlug(slug);

  if (!item || !item.inStore) notFound();

  const [offerings, shipping] = await Promise.all([
    Promise.resolve(getResolvedOfferingsForSlug(slug)),
    getShippingPrice(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Link
        href="/prints"
        className="font-heading text-xs tracking-[0.14em] text-muted hover:text-accent"
      >
        ← Back to prints
      </Link>
      <div className="mt-8 grid items-start gap-12 lg:grid-cols-2">
        <div className="bg-border">
          {item.imageSrc && item.width && item.height ? (
            <Image
              src={item.imageSrc}
              alt={item.altText ?? item.title}
              width={item.width}
              height={item.height}
              className="h-auto w-full"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : item.imageSrc ? (
            <div className="relative aspect-[4/3]">
              <Image
                src={item.imageSrc}
                alt={item.altText ?? item.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          ) : null}
        </div>
        <div>
          <p className="font-heading text-xs text-muted">{item.category}</p>
          <h1 className="font-heading mt-3 text-4xl text-foreground sm:text-5xl">{item.title}</h1>
          {item.location ? (
            <p className="mt-2 text-sm text-muted">{item.location}</p>
          ) : null}
          {item.featured ? (
            <span className="mt-4 inline-block bg-highlight px-2 py-0.5 font-heading text-[10px] tracking-[0.1em] text-foreground">
              Featured print
            </span>
          ) : null}
          <p className="mt-6 text-base leading-7 text-muted">{getPrintDescription(item)}</p>
          <PrintPurchasePanel
            slug={item.slug}
            title={item.title}
            sku={item.sku}
            printNote={item.printNote}
            offerings={offerings}
            shipping={shipping}
            checkoutEnabled={storeConfig.checkoutEnabled}
            shipsTo={storeConfig.shipsTo}
            turnaroundDays={storeConfig.turnaroundDays}
          />
        </div>
      </div>
    </div>
  );
}
