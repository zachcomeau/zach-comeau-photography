import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PrintCard } from "@/components/PrintCard";
import { getStoreItems } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Prints",
};

export default function PrintsPage() {
  const prints = getStoreItems();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <PageHeader
        label="Prints"
        title="Print Shop"
        description="Archival prints made to order. Each image is prepared from my original captures."
      />
      <ul className="border-t border-border">
        {prints.map((item) => (
          <PrintCard key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}
