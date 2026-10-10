import factsJson from "../../data/app_facts.json";

export interface TopVendor {
  vendor_id: string;
  canonical_name: string;
  corporation_number: string;
  contract_count: number;
  total_value_cad: number;
  country: string;
}

export interface YearRow {
  year: number;
  total_value_cad: number;
  contract_count: number;
}

export interface BuildFacts {
  status: string;
  note?: string;
  total_records: number;
  total_value_cad: number;
  canonical_vendors: number;
  raw_vendor_variants: number;
  normalized_keys: number;
  fuzzy_merges: number;
  quarantine_count: number;
  corp_matched_vendors: number;
  corp_matched_dollars: number;
  corps_merged: number;
  canadabuys_join_rate: number;
  years: { start: number; end: number };
  vintage: string;
  top_vendors: TopVendor[];
  yearly: YearRow[];
  country_share: { canada: number; foreign: number; unknown: number; matched_share_of_dollars: number };
  top_countries: { country: string; total_value_cad: number; vendor_count: number }[];
  sources: { name: string; publisher: string; url: string }[];
}

export const facts = factsJson as unknown as BuildFacts;

export function fmtMoney(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

export function fmtMoneyFull(v: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(v);
}

export function fmtInt(v: number): string {
  return new Intl.NumberFormat("en-CA").format(v);
}

export function fmtPct(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}
