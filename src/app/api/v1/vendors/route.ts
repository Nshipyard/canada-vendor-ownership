import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { facts } from "@/lib/data";
import { csvToObjects } from "@/lib/csv";

const DATA_DIR = path.join(process.cwd(), "data");

function spinePath(): string | null {
  for (const f of ["vendor_spine.csv", "vendor_spine.json"]) {
    const p = path.join(DATA_DIR, f);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

interface SpineRow {
  vendor_id: string;
  canonical_name: string;
  raw_variant_count: string;
  corporation_number: string;
  contract_count: string;
  total_value_cad: string;
  first_year: string;
  last_year: string;
  country_or_unknown: string;
}

let spineCache: SpineRow[] | null = null;

function readCsvRows(p: string): SpineRow[] {
  return csvToObjects(fs.readFileSync(p, "utf8")) as unknown as SpineRow[];
}

function loadSpine(): SpineRow[] | null {
  const p = spinePath();
  if (!p) return null;
  if (!spineCache) spineCache = readCsvRows(p);
  return spineCache;
}

function rowToVendor(r: SpineRow) {
  return {
    vendor_id: r.vendor_id,
    canonical_name: r.canonical_name,
    raw_variant_count: Number(r.raw_variant_count || 0),
    corporation_number: r.corporation_number || null,
    contract_count: Number(r.contract_count || 0),
    total_value_cad: Number(r.total_value_cad || 0),
    first_year: Number(r.first_year || 0),
    last_year: Number(r.last_year || 0),
    country: r.country_or_unknown || "unknown",
  };
}

export function searchSpine(q: string, limit: number) {
  const rows = loadSpine();
  const qn = q.trim().toLowerCase();
  if (!rows || !qn) return { vendors: [], total_canonical: facts.canonical_vendors, source: "spine" };
  const matches = rows
    .filter((r) => r.canonical_name.toLowerCase().includes(qn))
    .sort((a, b) => Number(b.total_value_cad || 0) - Number(a.total_value_cad || 0))
    .slice(0, limit)
    .map(rowToVendor);
  return { vendors: matches, total_canonical: rows.length, source: "spine" };
}

export function getVendorById(id: string) {
  const rows = loadSpine();
  if (!rows) return null;
  const r = rows.find((x) => x.vendor_id === id);
  return r ? rowToVendor(r) : null;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 25)));
  if (!q.trim()) {
    return NextResponse.json({
      vendors: [],
      total_canonical: facts.canonical_vendors,
      hint: "Pass ?q= to search vendor names.",
    });
  }
  return NextResponse.json(searchSpine(q, limit));
}
