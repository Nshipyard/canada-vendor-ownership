"use client";

import { useLang } from "@/i18n";
import { facts, fmtMoney, fmtInt } from "@/lib/data";
import { TopVendorsBar, CountryShareBar, FunnelChart, TrendChart, CountriesBar } from "@/components/Charts";
import CiteThis from "@/components/CiteThis";

const VINTAGE = "Treasury Board consolidated contracts file and Corporations Canada bulk files, retrieved October 2026";

export default function Showcase() {
  const { t } = useLang();
  const top10 = facts.top_vendors.slice(0, 10).map((v) => ({ name: v.canonical_name, value: v.total_value_cad }));
  const top10Sum = facts.top_vendors.slice(0, 10).reduce((a, v) => a + v.total_value_cad, 0);

  const citations: Record<string, string> = {
    concentration: `The top 10 canonical vendors received ${fmtMoney(top10Sum)} of ${fmtMoney(
      facts.total_value_cad
    )} in federal contract value (${VINTAGE}). Computed by Open Nshipyard, Federal Vendor Ownership.`,
    ownership: `${fmtMoney(
      facts.country_share.canada
    )} of matched federal contract dollars went to Canadian-registered corporations (${VINTAGE}). Computed by Open Nshipyard, Federal Vendor Ownership.`,
    funnel: `${fmtInt(facts.raw_vendor_variants)} raw vendor strings collapsed to ${fmtInt(
      facts.canonical_vendors
    )} canonical vendors (${VINTAGE}). Computed by Open Nshipyard, Federal Vendor Ownership.`,
    trend: `Federal contract value by year, ${facts.years.start} to ${facts.years.end} (${VINTAGE}). Computed by Open Nshipyard, Federal Vendor Ownership.`,
    countries: `Departments declare 74.1% of federal contract value as Canadian vendors, 4.2% American, and leave 18.5% blank (${VINTAGE}). Computed by Open Nshipyard, Federal Vendor Ownership.`,
  };

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-14 md:py-20">
      <div className="mx-auto max-w-[760px] text-center">
        <p className="kicker">{t.showcase.kicker}</p>
        <h1 className="display mt-4 text-[clamp(32px,4.6vw,54px)] leading-[1.05]">{t.showcase.title}</h1>
        <p className="mt-5 text-[16.5px] leading-relaxed text-ink/65">{t.showcase.body}</p>
      </div>

      <div className="mx-auto mt-14 flex max-w-[960px] flex-col gap-10">
        {t.showcase.findings.map((f) => (
          <article key={f.id} className="card p-7 md:p-10">
            <h2 className="display text-[26px] md:text-[30px] leading-tight">{f.q}</h2>
            <p className="mt-3 max-w-[700px] text-[15.5px] leading-relaxed text-ink/70">{f.a}</p>
            <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.14em] text-ink/45">{f.chart}</p>
            <div className="mt-4">
              {f.id === "concentration" && <TopVendorsBar rows={top10} />}
              {f.id === "ownership" && (
                <CountryShareBar
                  canada={facts.country_share.canada}
                  foreign={facts.country_share.foreign}
                  unknown={facts.country_share.unknown}
                />
              )}
              {f.id === "funnel" && (
                <FunnelChart
                  stages={[
                    { label: "raw vendor strings", value: facts.raw_vendor_variants },
                    { label: "normalized keys", value: facts.normalized_keys },
                    { label: "canonical vendors", value: facts.canonical_vendors },
                  ]}
                />
              )}
              {f.id === "trend" && (
                <TrendChart rows={facts.yearly.map((y) => ({ year: y.year, value: y.total_value_cad }))} />
              )}
              {f.id === "countries" && (
                <CountriesBar
                  rows={facts.top_countries.map((c) => ({ country: c.country, value: c.total_value_cad }))}
                />
              )}
            </div>
            <CiteThis text={citations[f.id] ?? ""} />
          </article>
        ))}
      </div>

      <p className="mx-auto mt-12 max-w-[760px] rounded-3xl border border-line bg-paper-warm p-6 text-[14.5px] leading-relaxed text-ink/65">
        {t.showcase.limitNote}
      </p>
    </main>
  );
}
