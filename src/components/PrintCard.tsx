import Image from "next/image";
import Link from "next/link";
import type { GalleryItem } from "@/data/gallery";

type PrintCardProps = {
  item: GalleryItem;
};

export function PrintCard({ item }: PrintCardProps) {
  return (
    <li className="flex flex-col gap-4 border-b border-border py-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Link
          href={`/prints/${item.slug}`}
          className="group relative block h-20 w-28 shrink-0 overflow-hidden bg-border"
          aria-label={`View print: ${item.title}`}
        >
          {item.imageSrc ? (
            <Image
              src={item.imageSrc}
              alt={item.altText ?? item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="112px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted">—</div>
          )}
        </Link>
        <div>
          <p className="font-heading text-[10px] tracking-[0.12em] text-muted">
            {item.category}
          </p>
          <h2 className="mt-1 text-lg text-foreground">{item.title}</h2>
          {item.location ? <p className="mt-0.5 text-sm text-muted">{item.location}</p> : null}
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
