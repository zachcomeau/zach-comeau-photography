import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Satisfaction Guarantee",
};

export default function GuaranteePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <PageHeader
        label="Guarantee"
        title="100% Satisfaction Guarantee"
        description="I want you to love the artwork you bring home."
      />
      <div className="space-y-6 text-base leading-7 text-muted">
        <p>
          Every print is made to order from my original capture, and I stand behind each one. If
          for any reason you are not completely happy with your print, you can send it back — no
          hard feelings.
        </p>

        <h2 className="font-heading text-sm tracking-[0.14em] text-foreground">Returns</h2>
        <p>
          Contact me within 30 days of delivery and I will arrange a return. Once the print
          arrives back in its original condition, I will refund the full purchase price of the
          print.
        </p>
        <p>
          Please note that original shipping charges are not refundable, and return shipping is
          the responsibility of the buyer. I recommend keeping the original packaging in case you
          need to send a print back.
        </p>

        <h2 className="font-heading text-sm tracking-[0.14em] text-foreground">
          Damaged in transit?
        </h2>
        <p>
          If your print arrives damaged, that is on me. Send a photo of the damage within 7 days
          of delivery and I will send a replacement at no cost to you.
        </p>

        <h2 className="font-heading text-sm tracking-[0.14em] text-foreground">How to start a return</h2>
        <p>
          Email me at{" "}
          <a href={`mailto:${siteConfig.email}`} className="text-accent hover:underline">
            {siteConfig.email}
          </a>{" "}
          or reach out through the{" "}
          <Link href="/contact" className="text-accent hover:underline">
            contact page
          </Link>{" "}
          with your order details, and I will take care of the rest.
        </p>
      </div>
    </div>
  );
}
