import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PrintCard } from "@/components/PrintCard";
import { getStoreItems } from "@/data/gallery";
import { getFromPricesBySlug } from "@/lib/stripe-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Prints",
};

export default async function PrintsPage() {
  const prints = getStoreItems();
  const fromPrices = await getFromPricesBySlug(prints.map((item) => item.slug));

  const sortedPrints = [...prints].sort((a, b) => {
    const priceA = fromPrices[a.slug] ?? Number.POSITIVE_INFINITY;
    const priceB = fromPrices[b.slug] ?? Number.POSITIVE_INFINITY;
    if (priceA !== priceB) return priceA - priceB;
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <PageHeader
        label="Prints"
        title="Print Shop"
        description="Archival prints made to order. Each image is prepared from my original captures."
      />
      <ul className="border-t border-border">
        {sortedPrints.map((item) => (
          <PrintCard
            key={item.id}
            item={item}
            fromPriceCents={fromPrices[item.slug]}
          />
        ))}
      </ul>
    </div>
  );
}
