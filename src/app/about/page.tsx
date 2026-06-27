import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <PageHeader label="About" title="About" />
      <div className="mt-8 flex flex-col gap-10 sm:flex-row sm:items-start">
        <div className="relative mx-auto aspect-[3/4] w-full max-w-xs shrink-0 overflow-hidden bg-border sm:mx-0">
          <Image
            src="/zach-comeau-portrait.png"
            alt="Zach Comeau photographing a sunrise from a mountain summit"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 80vw, 320px"
            priority
          />
        </div>
        <div className="space-y-6 text-base leading-7 text-muted">
          <p>Photography started as an excuse to spend more time outside.</p>
          <p>
            What began as bringing a camera along on hikes quickly turned into an obsession with
            learning how to capture the moments that make the outdoors so special.
          </p>
          <p>
            Based in Massachusetts, I focus primarily on wildlife and landscape photography
            throughout New England. Many of my favorite images are the result of long hikes, early
            mornings, changing weather, and hours waiting or searching for the right moment rather
            than creating one.
          </p>
          <p>
            My goal is simple: to create images that encourage others to slow down, appreciate the
            natural world, and perhaps inspire their next adventure outdoors.
          </p>
          <p>
            Prints are made to order from my original captures. If you have questions about sizing or
            paper, reach out through the{" "}
            <Link href="/contact" className="text-accent hover:underline">
              contact page
            </Link>{" "}
            or{" "}
            <a
              href={siteConfig.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Instagram
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
