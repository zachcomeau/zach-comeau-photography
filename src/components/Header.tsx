import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "/gallery", label: "Gallery" },
  { href: "/prints", label: "Prints" },
  { href: "/reviews", label: "Reviews" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="inline-flex shrink-0">
          <Image
            src="/logo.png"
            alt="Zach Comeau Photography"
            width={1024}
            height={542}
            priority
            className="h-9 w-auto sm:h-11"
          />
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
