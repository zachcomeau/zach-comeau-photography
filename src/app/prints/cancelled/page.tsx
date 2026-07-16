import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Checkout cancelled",
};

export default function PrintCancelledPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <PageHeader
        label="Prints"
        title="Checkout cancelled"
        description="No payment was made. Your cart is empty."
      />
      <div className="mt-8 space-y-4 text-base leading-7 text-muted">
        <p>
          You can return to the print shop and try again, or email{" "}
          <a href={`mailto:${siteConfig.email}`} className="text-accent hover:underline">
            {siteConfig.email}
          </a>{" "}
          if you need help.
        </p>
        <Link
          href="/prints"
          className="inline-block font-heading text-xs tracking-[0.14em] text-accent hover:underline"
        >
          ← Back to prints
        </Link>
      </div>
    </div>
  );
}
