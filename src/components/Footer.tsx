import Link from "next/link";
import { siteConfig } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 text-sm text-muted sm:flex-row sm:justify-between">
        <p className="order-2 sm:order-1">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
        <div className="order-1 flex items-center gap-5 sm:order-2 sm:flex-1 sm:justify-center">
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-muted transition-colors hover:text-accent"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
          <a
            href={siteConfig.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-muted transition-colors hover:text-accent"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
        </div>
        <p className="order-3">
          Landscape and wildlife prints · New England ·{" "}
          <Link href="/guarantee" className="transition-colors hover:text-accent">
            Satisfaction guarantee
          </Link>
        </p>
      </div>
    </footer>
  );
}
