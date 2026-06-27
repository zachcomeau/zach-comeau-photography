import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <PageHeader
        label="Contact"
        title="Contact"
        description="Questions about prints, sizing, or licensing? Get in touch."
      />
      <div className="space-y-6 text-base leading-7 text-muted">
        <p>
          Email:{" "}
          <a href={`mailto:${siteConfig.email}`} className="text-accent hover:underline">
            {siteConfig.email}
          </a>
        </p>
        <p>
          Instagram:{" "}
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            @zachcomeauphotography
          </a>
        </p>
      </div>
    </div>
  );
}
