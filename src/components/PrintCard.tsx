import Image from "next/image";
import Link from "next/link";
import type { GalleryItem } from "@/data/gallery";
import { formatPrice } from "@/lib/format-price";

type PrintCardProps = {
  item: GalleryItem;
  fromPriceCents?: number;
};

export function PrintCard({ item, fromPriceCents }: PrintCardProps) {
  return (
    <li className="flex flex-col gap-4 border-b border-border py-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Link
          href={`/prints/${item.slug}`}
          className="group block w-28 shrink-0 overflow-hidden bg-border"
          aria-label={`View print: ${item.title}`}
        >
          {item.imageSrc && item.width && item.height ? (
            <Image
              src={item.imageSrc}
              alt={item.altText ?? item.title}
              width={item.width}
              height={item.height}
              className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="112px"
            />
          ) : item.imageSrc ? (
            <div className="relative h-20 w-full">
              <Image
                src={item.imageSrc}
                alt={item.altText ?? item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="112px"
              />
            </div>
          ) : (
            <div className="flex h-20 items-center justify-center text-xs text-muted">—</div>
          )}
        </Link>
        <div>
          <p className="font-heading text-[10px] tracking-[0.12em] text-muted">
            {item.category}
          </p>
          <h2 className="mt-1 text-lg text-foreground">{item.title}</h2>
          {item.location ? <p className="mt-0.5 text-sm text-muted">{item.location}</p> : null}
          {fromPriceCents != null ? (
            <p className="mt-0.5 text-sm text-muted">From {formatPrice(fromPriceCents)}</p>
          ) : null}
        </div>
      </div>
      <Link
        href={`/prints/${item.slug}`}
        className="shrink-0 font-heading text-xs tracking-[0.14em] text-accent hover:underline"
      >
        View print
      </Link>
    </li>
  );
}
