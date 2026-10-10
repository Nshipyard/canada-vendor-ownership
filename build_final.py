#!/usr/bin/env python3
"""Step F/G/H: concentration.json, quarantine_report.csv, verified_parents.csv,
build_facts.json. All numbers computed from the pipeline outputs."""
import csv, json, os
from collections import defaultdict

OUT = os.path.expanduser("~/workspace/canada-vendor-ownership/data")

def main():
    spine = list(csv.DictReader(open(os.path.join(OUT, "vendor_spine.csv"), encoding="utf-8")))
    vstats = json.load(open(os.path.join(OUT, "_vendor_stats.json")))
    mstats = json.load(open(os.path.join(OUT, "_match_stats.json")))
    quar = json.load(open(os.path.join(OUT, "_quarantine_detail.json")))
    yearly = json.load(open(os.path.join(OUT, "_yearly.json")))
    cbjoin = json.load(open(os.path.join(OUT, "_canadabuys_join.json")))

    total_value = vstats["total_value_cad"]
    total_contracts = vstats["contracts"]
    total_rows = vstats["rows_total"]

    top20_value = sorted(spine, key=lambda r: float(r["total_value_cad"]), reverse=True)[:20]
    top20_count = sorted(spine, key=lambda r: int(r["contract_count"]), reverse=True)[:20]

    # country share from matched corps (registered_country), unmatched labelled honestly
    country_value = defaultdict(float)
    country_contracts = defaultdict(int)
    for r in spine:
        c = r["country_or_unknown"]
        country_value[c] += float(r["total_value_cad"])
        country_contracts[c] += int(r["contract_count"])

    matched_value = sum(v for k, v in country_value.items() if k != "UNKNOWN (unmatched)")
    matched_contracts = sum(c for k, c in country_contracts.items() if k != "UNKNOWN (unmatched)")

    # TBS-declared vendor country (independent supplementary signal from raw rows)
    tbs_country = {"CA": 343417815097.0, "US": 19360213054.0, "ES": 7257926173.0,
                   "DE": 3460717146.0, "GB": 972500168.0, "AE": 577681331.0,
                   "SE": 438290721.0, "BLANK": 85504012205.0,
                   "note": "computed on a separate re-scan of contracts.csv at contract level (owner_org+procurement_id dedup, max contract_value); 1,100,001 contracts vs pipeline 1,099,940 - tiny diff from vendor-name blank-after-normalize rows"}

    concentration = {
        "scope": "TBS Proactive Publication - Contracts over $10,000, contract-level dedup by (owner_org, procurement_id), representative row = max contract_value (latest cumulative total incl. amendments). Quarantined rows excluded.",
        "total_rows_in_scope": total_rows,
        "total_contracts": total_contracts,
        "total_value_cad": round(total_value, 2),
        "top_20_by_value": [
            {"rank": i+1, "canonical_name": r["canonical_name"], "vendor_id": r["vendor_id"],
             "corporation_number": r["corporation_number"] or None,
             "total_value_cad": float(r["total_value_cad"]),
             "contract_count": int(r["contract_count"]),
             "share_of_total": round(float(r["total_value_cad"])/total_value, 4),
             "first_year": r["first_year"], "last_year": r["last_year"]}
            for i, r in enumerate(top20_value)],
        "top_20_by_count": [
            {"rank": i+1, "canonical_name": r["canonical_name"], "vendor_id": r["vendor_id"],
             "corporation_number": r["corporation_number"] or None,
             "contract_count": int(r["contract_count"]),
             "total_value_cad": float(r["total_value_cad"])}
            for i, r in enumerate(top20_count)],
        "yearly_totals": {y: {"value_cad": round(d["value"], 2), "contracts": d["contracts"]}
                          for y, d in sorted(yearly.items())},
        "country_share_from_matched_corps": {
            "method": "registered_country of the federally-incorporated corporation matched by exact normalized-name match. Only matched vendors have a country; all others are labelled 'unmatched, origin unknown'. No country is guessed.",
            "matched_share_of_dollars": round(matched_value/total_value, 4),
            "matched_share_of_contracts": round(matched_contracts/total_contracts, 4),
            "breakdown": {k: {"value_cad": round(v, 2), "share": round(v/total_value, 4),
                              "contracts": country_contracts[k]}
                          for k, v in sorted(country_value.items(), key=lambda x: -x[1])},
        },
        "tbs_declared_country_share_supplementary": tbs_country,
    }
    json.dump(concentration, open(os.path.join(OUT, "concentration.json"), "w"), indent=1)
    print("concentration.json written", flush=True)

    # quarantine report
    with open(os.path.join(OUT, "quarantine_report.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["rule", "count", "example_vendor", "example_value", "example_date", "example_reference"])
        w.writeheader()
        for rule in sorted(quar):
            e = quar[rule]["examples"][0] if quar[rule]["examples"] else {}
            w.writerow({"rule": rule, "count": quar[rule]["count"],
                        "example_vendor": e.get("vendor_name",""), "example_value": e.get("contract_value",""),
                        "example_date": e.get("contract_date",""), "example_reference": e.get("reference_number","")})
    print("quarantine_report.csv written", flush=True)

    # verified parents (top 5 by value, manually verified via web sources Oct 10 2026)
    parents = [
        {"vendor_id": "V4247495320474C4F", "canonical_name": "BGIS GLOBAL INTEGRATED SOLUTIONS CANADA",
         "total_value_cad": 19208576711.3, "parent_name": "CCMP Capital Advisors + AIMCo (Veritas Capital announced acquisition Jul 2026, expected close Q4 2026)",
         "parent_country": "US (CCMP) / CA (AIMCo); Veritas US",
         "source": "RENX real estate news, citing Veritas media release",
         "source_url": "https://renx.ca/veritas-capital-acquiring-ifm-services-firm-bgis",
         "verified_date": "2026-10-10", "notes": "ownership in transition at verification time; kept out of automated aggregates"},
        {"vendor_id": "V495256494E472053", "canonical_name": "Irving Shipbuilding Incorporated",
         "total_value_cad": 19159037820.52, "parent_name": "J.D. Irving, Limited",
         "parent_country": "CA",
         "source": "Irving Shipbuilding Inc. official compliance report (Fighting Against Forced Labour Act), shipsforcanada.ca",
         "source_url": "https://shipsforcanada.ca/images/uploads/ISI-Bill-S-211-Report-Final-2025.pdf",
         "verified_date": "2026-10-10", "notes": "ISI is within the umbrella of the J.D. Irving, Limited group of companies; kept out of automated aggregates"},
        {"vendor_id": "V56414E434F555645", "canonical_name": "VANCOUVER SHIPYARDS CO. LTD.",
         "total_value_cad": 15986302320.24, "parent_name": "Seaspan ULC (via Seaspan Shipyards)",
         "parent_country": "CA",
         "source": "MarineLink industry reporting",
         "source_url": "https://www.marinelink.com/news/shipbuilding-seaspan-shipyards-building-440822",
         "verified_date": "2026-10-10", "notes": "Seaspan Shipyards described as a division of Seaspan ULC; kept out of automated aggregates"},
        {"vendor_id": "V534B59414C594E45", "canonical_name": "SkyAlyne Canada Limited Partnership",
         "total_value_cad": 11219370646.0, "parent_name": "CAE + KF Aerospace (joint venture)",
         "parent_country": "CA",
         "source": "SkyAlyne official site / Skies Mag",
         "source_url": "https://skyalyne.ca/latest-updates/skyalyne-and-kf-aerospace-acquire-three-de-havilland-canada-dash-8-400-aircraft-for-rcaf-aircrew-training/",
         "verified_date": "2026-10-10", "notes": "limited partnership formed 2018 to bid FAcT; kept out of automated aggregates"},
        {"vendor_id": "V4C4F434B48454544", "canonical_name": "Lockheed Martin Canada, Inc.",
         "total_value_cad": 10059399423.7, "parent_name": "Lockheed Martin Corporation",
         "parent_country": "US",
         "source": "Lockheed Martin official Canada site",
         "source_url": "https://www.lockheedmartin.com/en-ca/index.html",
         "verified_date": "2026-10-10", "notes": "wholly-owned subsidiary; kept out of automated aggregates"},
    ]
    with open(os.path.join(OUT, "verified_parents.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["vendor_id","canonical_name","total_value_cad","parent_name",
                                          "parent_country","source","source_url","verified_date","notes"])
        w.writeheader()
        w.writerows(parents)
    print("verified_parents.csv written", flush=True)

    # build facts
    quar_counts = {k: quar[k]["count"] for k in quar}
    facts = {
        "project": "Federal Vendor Ownership - Open Nshipyard",
        "build_date": "2026-10-10",
        "licence": "Open Government Licence - Canada",
        "sources": {
            "tbs_contracts": {"url": "https://open.canada.ca/data/dataset/d8f85d91-7dec-4fd1-8055-483b77225d8b/resource/fac950c0-00d5-4ec1-a4d3-9cbebf98a305/download/contracts.csv",
                              "downloaded": "2026-10-10", "bytes": 641790933, "rows_csv_lines": 1388798,
                              "data_updated": "2026-10-09 (per open.canada.ca)"},
            "canadabuys_complete": {"url": "https://canadabuys.canada.ca/opendata/pub/contractHistoryComplete-contratsOctroyesComplet.csv",
                                    "downloaded": "2026-10-10", "bytes": 61707854, "award_dates": "2023-06-01 to 2026-09-25"},
            "canadabuys_historical": {"url": "https://canadabuys.canada.ca/opendata/pub/2009-2023-contractHistoryHistorical-contratsOctroyesHistorique.csv",
                                      "downloaded": "2026-10-10", "bytes": 167014400, "award_dates": "2009-01-01 to 2023-05-31"},
            "federal_corporations": {"base": "https://d4bf66bykfyaf.cloudfront.net/", "downloaded": "2026-10-10",
                                     "subsets": {"active-cbca": 1290688, "active-non-cbca": 102424,
                                                 "inactive-cbca": 1665872, "inactive-non-cbca": 85314},
                                     "unique_corp_numbers": 1572149},
        },
        "tbs_scope": {
            "total_rows_csv": 1313289,
            "rows_kept_in_scope": vstats["rows_kept"],
            "quarantined_rows_total": sum(quar_counts.values()),
            "quarantine_by_rule": quar_counts,
            "distinct_contracts": total_contracts,
            "total_value_cad_contract_level": round(total_value, 2),
            "years_covered": sorted(yearly.keys()),
        },
        "vendor_normalization": {
            "exact_normalized_vendors": vstats["exact_vendor_keys"],
            "canonical_vendors_after_fuzzy_merge": vstats["canonical_vendors"],
            "fuzzy_merge_groups": vstats["merge_groups"],
            "fuzzy_method": "difflib SequenceMatcher ratio >= 0.93 within identical-first-token blocks",
        },
        "corp_match": {
            "method": mstats["method"],
            "vendors_matched": mstats["matched_vendors"],
            "vendors_total": mstats["canonical_vendors"],
            "vendor_match_rate": round(mstats["matched_vendors"]/mstats["canonical_vendors"], 4),
            "value_matched_cad": mstats["matched_value_cad"],
            "value_match_rate": round(mstats["matched_value_cad"]/mstats["total_value_cad"], 4),
            "contracts_matched": mstats["matched_contracts"],
            "contract_match_rate": round(mstats["matched_contracts"]/mstats["total_contracts"], 4),
            "caveat": "match is against FEDERAL corporations only; provincially-incorporated vendors (e.g. Irving Shipbuilding, Vancouver Shipyards) do not match even when the company is real",
        },
        "canadabuys_join": {
            "distinct_canadabuys_contracts": cbjoin["canadabuys_contracts"],
            "join_eligible": cbjoin["join_eligible"],
            "matched": cbjoin["matched"],
            "join_rate": round(cbjoin["join_rate"], 4),
            "matched_value_cad": cbjoin["matched_value_cad"],
            "rule": cbjoin["rule"],
            "caveat": cbjoin["caveat"],
            "per_fiscal_year_files_skipped": "redundant: complete (2023-06-01+) + historical (2009-2023-05-31) cover the full span with identical restructured schema",
        },
        "concentration_headlines": {
            "total_value_cad": round(total_value, 2),
            "top_5_vendors": [{"name": r["canonical_name"], "value_cad": float(r["total_value_cad"]),
                               "corp_number": r["corporation_number"] or None}
                              for r in top20_value[:5]],
            "top1_share": round(float(top20_value[0]["total_value_cad"])/total_value, 4),
            "top5_share": round(sum(float(r["total_value_cad"]) for r in top20_value[:5])/total_value, 4),
            "top20_share": round(sum(float(r["total_value_cad"]) for r in top20_value)/total_value, 4),
            "canadian_vs_foreign": {
                "matched_dollars_cad": round(matched_value, 2),
                "matched_share_of_dollars": round(matched_value/total_value, 4),
                "unmatched_dollars_cad": round(total_value - matched_value, 2),
                "unmatched_share_of_dollars": round((total_value-matched_value)/total_value, 4),
                "label": "matched vendors resolved to CA-registered federal corporations (all matched were CA); unmatched vendors origin unknown - no country guessed",
            },
            "tbs_declared_country_supplementary": {
                "CA": {"value_cad": 343417815097.0, "share": 0.741},
                "US": {"value_cad": 19360213054.0, "share": 0.042},
                "blank": {"value_cad": 85504012205.0, "share": 0.185},
                "note": "department-declared country_of_vendor per contract (separate re-scan); 18.5% blank",
            },
        },
        "parent_layer": {
            "status": "PARTIAL",
            "missing_source": "No free bulk source of ultimate corporate parents exists. StatCan Inter-Corporate Ownership (Corporations Returns Act) is the authoritative who-owns-what source but is a paid, threshold-based product (~45,000 corps), not bulk open data. The federal Individuals with Significant Control register is not bulk-published. The ISED Federal Corporations CSV has no parent field.",
            "verified_parents_csv": "data/verified_parents.csv - top 5 vendors manually verified from official/press sources, excluded from automated aggregates",
        },
    }
    json.dump(facts, open(os.path.join(OUT, "build_facts.json"), "w"), indent=1)
    print("build_facts.json written", flush=True)

if __name__ == "__main__":
    main()
