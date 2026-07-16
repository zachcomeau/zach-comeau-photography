import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Order confirmed",
};

export default function PrintSuccessPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <PageHeader
        label="Prints"
        title="Thank you"
        description="Your order is confirmed. I will prepare your print and email you when it ships."
      />
      <div className="mt-8 space-y-4 text-base leading-7 text-muted">
        <p>
          A receipt is on its way from Stripe. If you have questions, contact{" "}
          <a href={`mailto:${siteConfig.email}`} className="text-accent hover:underline">
            {siteConfig.email}
          </a>
          .
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
