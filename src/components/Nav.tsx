"use client";

import Link from "next/link";
import { useLang } from "@/i18n";

export default function Nav() {
  const { t, lang, setLang } = useLang();
  const items = [
    { href: "/", label: t.nav.home },
    { href: "/explorer", label: t.nav.explorer },
    { href: "/showcase", label: t.nav.showcase },
    { href: "/methodology", label: t.nav.methodology },
    { href: "/data", label: t.nav.data },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-canada font-display text-lg font-bold text-white">
            N
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-bold">{t.nav.brand}</span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">
              {t.nav.badge}
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-[14px] font-medium md:flex">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className="text-ink/70 transition hover:text-canada">
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "en" ? "fr" : "en")}
            className="rounded-full border border-line px-4 py-1.5 text-[13px] font-semibold text-ink/70 transition hover:border-ink"
          >
            {t.common.langName}
          </button>
        </div>
      </div>
      <nav className="flex items-center gap-5 overflow-x-auto border-t border-line px-5 py-2.5 text-[13px] font-medium md:hidden">
        {items.map((i) => (
          <Link key={i.href} href={i.href} className="whitespace-nowrap text-ink/70 hover:text-canada">
            {i.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
