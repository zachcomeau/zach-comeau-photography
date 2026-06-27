import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <PageHeader label="About" title="About" />
      <div className="space-y-6 text-base leading-7 text-muted">
        <p>
          I&apos;m Zach Comeau, a photographer based in New England. I spend most of my time on
          trails, ridgelines, and quiet forest roads — looking for good light and patient wildlife
          moments.
        </p>
        <p>
          This work is about getting outside. Mountains, lakes, sunrises, owls on a winter branch,
          a moose at the edge of a bog. I want these images to remind people there is still wild
          country worth protecting and exploring.
        </p>
        <p>
          Prints are made to order from my original captures. If you have questions about sizing or
          paper, reach out through the{" "}
          <Link href="/contact" className="text-accent hover:underline">
            contact page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
