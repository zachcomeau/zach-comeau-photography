import { siteConfig } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {siteConfig.name}</p>
        <p>Landscape and wildlife prints · New England</p>
      </div>
    </footer>
  );
}
