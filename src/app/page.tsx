"use client";

import Link from "next/link";
import { useLang } from "@/i18n";
import { facts, fmtMoney, fmtInt, fmtPct } from "@/lib/data";
import ShareableCharts from "@/components/ShareableCharts";

export default function Home() {
  const { t } = useLang();
  const stats = [
    { v: fmtInt(facts.total_records), l: t.home.statRecords },
    { v: fmtMoney(facts.total_value_cad), l: t.home.statValue },
    { v: fmtInt(facts.canonical_vendors), l: t.home.statVendors },
    { v: fmtInt(facts.fuzzy_merges), l: t.home.statMerges },
    { v: fmtInt(facts.corps_merged), l: t.home.statCorps },
    {
      v: fmtPct(facts.country_share.matched_share_of_dollars),
      l: t.home.statMatched,
    },
  ];
  return (
    <main>
      <section className="mx-auto max-w-[1240px] px-5 pb-12 pt-14 md:pt-20">
        <div className="mx-auto max-w-[820px] text-center">
          <p className="kicker">{t.home.kicker}</p>
          <h1 className="display mt-5 text-[clamp(34px,5vw,58px)] leading-[1.05]">{t.home.title}</h1>
          <p className="mx-auto mt-6 max-w-[700px] text-[17px] leading-relaxed text-ink/65">{t.home.body}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/explorer" className="pill-cta">
              {t.home.ctaExplore}
            </Link>
            <Link href="/showcase" className="pill-ghost">
              {t.home.ctaShowcase}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-paper-warm">
        <div className="mx-auto max-w-[1240px] px-5 py-12">
          <p className="kicker text-center">{t.home.statsTitle}</p>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {stats.map((s) => (
              <div key={s.l} className="card p-5 text-center">
                <p className="stat-num text-[30px] md:text-[32px]">{s.v}</p>
                <p className="mt-2 text-[12.5px] leading-snug text-ink/60">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="kicker">{t.home.ownershipKicker}</p>
            <h2 className="display mt-4 text-[clamp(26px,3.4vw,40px)] leading-[1.1]">{t.home.ownershipTitle}</h2>
            <p className="mt-5 text-[16px] leading-relaxed text-ink/70">{t.home.ownershipBody}</p>
            <Link href="/showcase" className="pill-cta mt-7">
              {t.home.ctaShowcase}
            </Link>
          </div>
          <div className="card-warm p-7 md:p-9">
            <p className="kicker">{t.home.showcaseKicker}</p>
            <div className="mt-5 space-y-5">
              {t.showcase.findings.slice(0, 3).map((f) => (
                <div key={f.id} className="border-b border-line pb-5 last:border-0 last:pb-0">
                  <p className="font-semibold text-[16px]">{f.q}</p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink/60">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 pb-4">
        <div className="card-warm p-8 md:p-12">
          <p className="kicker">{t.home.methodKicker}</p>
          <h2 className="display mt-4 max-w-[620px] text-[clamp(26px,3.4vw,40px)] leading-[1.1]">
            {t.home.methodTitle}
          </h2>
          <p className="mt-5 max-w-[680px] text-[16px] leading-relaxed text-ink/70">{t.home.methodBody}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/methodology" className="pill-ghost">
              {t.nav.methodology}
            </Link>
            <Link href="/data" className="pill-cta">
              {t.home.ctaData}
            </Link>
          </div>
        </div>
      </section>
      <ShareableCharts projectKey="vendors" />
    </main>
  );
}
