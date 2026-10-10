"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/i18n";
import { fmtMoney, fmtInt } from "@/lib/data";

interface Vendor {
  vendor_id: string;
  canonical_name: string;
  raw_variant_count: number;
  corporation_number: string | null;
  contract_count: number;
  total_value_cad: number;
  first_year: number;
  last_year: number;
  country: string;
}

export default function Explorer() {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searched, setSearched] = useState(false);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onChange = (v: string) => {
    setQ(v);
    if (timer.current) clearTimeout(timer.current);
    if (v.trim().length < 2) {
      setVendors([]);
      setSearched(false);
      setBusy(false);
      return;
    }
    setBusy(true);
    timer.current = setTimeout(() => {
      void runSearch(v);
    }, 350);
  };

  const runSearch = async (term: string) => {
    try {
      const res = await fetch(`/api/v1/vendors?q=${encodeURIComponent(term)}&limit=25`);
      const data = await res.json();
      setVendors(data.vendors ?? []);
    } catch {
      setVendors([]);
    } finally {
      setBusy(false);
      setSearched(true);
    }
  };

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-14 md:py-20">
      <div className="mx-auto max-w-[760px]">
        <p className="kicker">{t.explorer.kicker}</p>
        <h1 className="display mt-4 text-[clamp(32px,4.6vw,54px)] leading-[1.05]">{t.explorer.title}</h1>
        <p className="mt-5 text-[16.5px] leading-relaxed text-ink/65">{t.explorer.body}</p>
        <div className="mt-8">
          <input
            value={q}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t.explorer.searchPlaceholder}
            className="w-full rounded-full border border-line bg-white px-6 py-4 text-[16px] outline-none transition focus:border-canada"
          />
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-[1000px]">
        {busy && <p className="text-[14px] text-ink/55">{t.explorer.loading}…</p>}
        {searched && !busy && vendors.length === 0 && (
          <p className="text-[14px] text-ink/55">{t.explorer.noResults}</p>
        )}
        {vendors.length > 0 && (
          <div className="card overflow-x-auto p-2">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.explorer.vendor}</th>
                  <th>{t.explorer.corpNumber}</th>
                  <th>{t.explorer.contracts}</th>
                  <th>{t.explorer.totalValue}</th>
                  <th>{t.explorer.country}</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.vendor_id}>
                    <td>
                      <span className="font-semibold">{v.canonical_name}</span>
                      <span className="block text-[12.5px] text-ink/50">
                        {fmtInt(v.raw_variant_count)} {t.explorer.variants}
                      </span>
                    </td>
                    <td>
                      {v.corporation_number ? (
                        <Link
                          href={`/api/v1/corporations/${encodeURIComponent(v.corporation_number)}`}
                          className="font-mono text-[13px] text-canada hover:underline"
                        >
                          {v.corporation_number}
                        </Link>
                      ) : (
                        <span className="text-ink/40">-</span>
                      )}
                    </td>
                    <td>{fmtInt(v.contract_count)}</td>
                    <td className="font-semibold">{fmtMoney(v.total_value_cad)}</td>
                    <td className="capitalize">{v.country === "unknown" ? t.explorer.unknown : v.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
