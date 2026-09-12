import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo-mark.png"
            alt="Local Lead Finder"
            width={32}
            height={27}
            className="h-8 w-auto"
            priority
          />
          <span className="text-base font-semibold leading-tight tracking-tight text-gray-900">
            Local Lead Finder
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-gray-900">
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          href="/scraper"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-blue-hover"
        >
          Open the scraper
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}
