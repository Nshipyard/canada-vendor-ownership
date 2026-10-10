import { NextResponse } from "next/server";
import { facts } from "@/lib/data";

export async function GET() {
  return NextResponse.json({
    vintage: facts.vintage,
    years: facts.years,
    total_records: facts.total_records,
    total_value_cad: facts.total_value_cad,
    canonical_vendors: facts.canonical_vendors,
    fuzzy_merges: facts.fuzzy_merges,
    quarantine_count: facts.quarantine_count,
    corp_matched_vendors: facts.corp_matched_vendors,
    corp_matched_dollars: facts.corp_matched_dollars,
    corps_merged: facts.corps_merged,
    country_share: facts.country_share,
    top_countries: facts.top_countries,
    top_vendors: facts.top_vendors.slice(0, 20),
    yearly: facts.yearly,
  });
}
