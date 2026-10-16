"use client";

import { useEffect, useRef, useState } from "react";
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

const BROWSE_PAGE = 100;

function countryLabel(country: string, unknown: string) {
  const c = (country || "").trim().toLowerCase();
  if (!c || c === "unknown" || c === "unknown (unmatched)") return unknown;
  return country;
}

function VendorTable({ vendors }: { vendors: Vendor[] }) {
  const { t } = useLang();
  return (
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
              <td className="capitalize">{countryLabel(v.country, t.explorer.unknown)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Explorer() {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searched, setSearched] = useState(false);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [browse, setBrowse] = useState<Vendor[]>([]);
  const [browseTotal, setBrowseTotal] = useState(0);
  const [browseLoaded, setBrowseLoaded] = useState(0);
  const [browseBusy, setBrowseBusy] = useState(false);
  const [browseHasMore, setBrowseHasMore] = useState(true);

  const isSearching = q.trim().length >= 2;

  const loadBrowse = async (offset: number) => {
    setBrowseBusy(true);
    try {
      const res = await fetch(`/api/v1/vendors?browse=1&limit=${BROWSE_PAGE}&offset=${offset}`);
      const data = await res.json();
      const rows: Vendor[] = data.vendors ?? [];
      setBrowse((prev) => (offset === 0 ? rows : [...prev, ...rows]));
      setBrowseTotal(data.total_canonical ?? 0);
      setBrowseLoaded(offset + rows.length);
      setBrowseHasMore(Boolean(data.has_more));
    } catch {
      // keep whatever rows are already on screen
    } finally {
      setBrowseBusy(false);
    }
  };

  useEffect(() => {
    void loadBrowse(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {vendors.length > 0 && <VendorTable vendors={vendors} />}
      </div>

      {!isSearching && (
        <div className="mx-auto mt-14 max-w-[1000px]">
          <div className="mb-5">
            <h2 className="text-[24px] font-bold tracking-tight">{t.explorer.browseTitle}</h2>
            <p className="mt-1.5 text-[14.5px] text-ink/60">
              {browseTotal > 0
                ? `${fmtInt(browseTotal)} ${t.explorer.browseSub}`
                : `${t.explorer.loadingVendors}…`}
            </p>
          </div>
          {browse.length > 0 && <VendorTable vendors={browse} />}
          <div className="mt-6 text-center">
            {browseBusy && browse.length === 0 && (
              <p className="text-[14px] text-ink/55">{t.explorer.loadingVendors}…</p>
            )}
            {browseHasMore ? (
              <button
                onClick={() => void loadBrowse(browseLoaded)}
                disabled={browseBusy}
                className="pill-ghost disabled:cursor-wait disabled:opacity-60"
              >
                {browseBusy ? `${t.explorer.loadingVendors}…` : t.explorer.loadMore}
              </button>
            ) : (
              <p className="text-[14px] text-ink/55">{t.explorer.allShown}</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
