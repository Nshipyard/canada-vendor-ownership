"""Build data/app_facts.json (the app's flat fact contract) from the pipeline outputs."""
import csv, json, pathlib

DATA = pathlib.Path(__file__).resolve().parent.parent / "data"
bf = json.load(open(DATA / "build_facts.json"))
conc = json.load(open(DATA / "concentration.json"))

# raw vendor variant count = sum of per-canonical raw_variant_count
raw_variants = 0
with open(DATA / "vendor_spine.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        try:
            raw_variants += int(row.get("raw_variant_count") or 0)
        except ValueError:
            pass

tbs = bf["tbs_scope"]
vn = bf["vendor_normalization"]
cm = bf["corp_match"]
ch = bf["concentration_headlines"]
decl = ch["tbs_declared_country_supplementary"]

top_vendors = []
for v in conc["top_20_by_value"]:
    top_vendors.append({
        "vendor_id": v["vendor_id"],
        "canonical_name": v["canonical_name"],
        "corporation_number": v["corporation_number"] or "",
        "contract_count": int(v["contract_count"]),
        "total_value_cad": float(v["total_value_cad"]),
        "country": "Canada" if v["corporation_number"] else "unknown",
    })

yearly = [
    {"year": int(y), "total_value_cad": float(r["value_cad"]), "contract_count": int(r["contracts"])}
    for y, r in sorted(conc["yearly_totals"].items(), key=lambda kv: int(kv[0]))
]

top_countries = [
    {"country": "Canada", "total_value_cad": float(decl["CA"]["value_cad"])},
    {"country": "Not declared", "total_value_cad": float(decl["blank"]["value_cad"])},
    {"country": "United States", "total_value_cad": float(decl["US"]["value_cad"])},
]
other_val = float(ch["total_value_cad"]) - sum(c["total_value_cad"] for c in top_countries)
if other_val > 0:
    top_countries.append({"country": "Other countries", "total_value_cad": other_val})

facts = {
    "status": "live",
    "vintage": "October 2026",
    "total_records": int(tbs["distinct_contracts"]),
    "total_value_cad": float(tbs["total_value_cad_contract_level"]),
    "canonical_vendors": int(vn["canonical_vendors_after_fuzzy_merge"]),
    "raw_vendor_variants": raw_variants,
    "normalized_keys": int(vn["exact_normalized_vendors"]),
    "fuzzy_merges": int(vn["fuzzy_merge_groups"]),
    "quarantine_count": int(tbs["quarantined_rows_total"]),
    "corp_matched_vendors": int(cm["vendors_matched"]),
    "corp_matched_dollars": float(cm["value_matched_cad"]),
    "corps_merged": int(bf["sources"]["federal_corporations"]["unique_corp_numbers"]),
    "canadabuys_join_rate": float(bf["canadabuys_join"]["join_rate"]),
    "years": {"start": 2003, "end": 2026},
    "top_vendors": top_vendors,
    "yearly": yearly,
    "country_share": {
        "canada": float(conc["country_share_from_matched_corps"]["breakdown"]["CA"]["value_cad"]),
        "foreign": 0,
        "unknown": float(conc["country_share_from_matched_corps"]["breakdown"]["UNKNOWN (unmatched)"]["value_cad"]),
        "matched_share_of_dollars": float(cm["value_match_rate"]),
    },
    "top_countries": top_countries,
    "sources": [
        {"name": "Proactive Publication - Contracts", "publisher": "Treasury Board of Canada Secretariat",
         "url": "https://open.canada.ca/data/en/dataset/d8f85d91-7dec-4fd1-8055-483b77225d8b"},
        {"name": "CanadaBuys contract history", "publisher": "Public Services and Procurement Canada",
         "url": "https://open.canada.ca/data/en/dataset/4fe645a1-ffcd-40c1-9385-2c771be956a4"},
        {"name": "Federal Corporations", "publisher": "Innovation, Science and Economic Development Canada",
         "url": "https://open.canada.ca/data/en/dataset/0032ce54-c5dd-4b66-99a0-320a7b5e99f2"},
    ],
}
json.dump(facts, open(DATA / "app_facts.json", "w"), indent=1)
print("wrote app_facts.json")
print("raw_variants:", raw_variants, "| top5 share:", ch["top5_share"], "| declared CA share:", decl["CA"]["share"])
