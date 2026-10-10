#!/usr/bin/env python3
"""Step D: exact corp match for canonical vendors -> vendor_spine.csv.
Contract-level aggregates come from _canonical.json (built by vendor_pipeline.py)."""
import csv, json, os, re
from collections import defaultdict

RAW = os.path.expanduser("~/workspace/canada-vendor-ownership/raw")
OUT = os.path.expanduser("~/workspace/canada-vendor-ownership/data")

SUFFIXES = {"LTD","LIMITED","INC","INCORPORATED","INCORPOREE","CORP","CORPORATION","LLC","LLP",
            "LTEE","LTEE","LTE","SENC","SARL","SA","NV","BV","AG","GMBH","CO","COMPANY","COY",
            "PLC","PTY","GROUP","HOLDINGS","SERVICES","ASSOCIATES","ENTERPRISES","INTERNATIONAL",
            "CANADA","LIMITEE","LITEE"}
_SUFFIX_CLEAN = {s.replace('.','') for s in SUFFIXES}

def norm_name(n):
    n = (n or "").strip()
    n = re.sub(r'\s+', ' ', n)
    up = n.upper()
    up = up.replace('&', ' AND ')
    up = up.replace('/', ' ').replace('\\', ' ')
    up = re.sub(r'[.,;:"\'()\[\]{}!?@#$%^*+=~`|<>–—-]+', ' ', up)
    up = re.sub(r'\s+', ' ', up).strip()
    toks = up.split()
    while toks and toks[-1].replace('.', '') in _SUFFIX_CLEAN:
        toks.pop()
    if toks and toks[0] == 'THE':
        toks.pop(0)
    return ' '.join(toks)

def main():
    print("loading corporations_merged.csv ...", flush=True)
    corp_index = {}
    with open(os.path.join(OUT, "corporations_merged.csv"), newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            for nm in (row["legal_name_en"], row["legal_name_fr"]):
                if nm:
                    k = norm_name(nm)
                    if k and k not in corp_index:
                        corp_index[k] = row
    print(f"corp name index keys: {len(corp_index)}", flush=True)

    canon = json.load(open(os.path.join(OUT, "_canonical.json")))
    agg = canon["canonical_agg"]

    spine_rows = []
    matched_v = 0; matched_value = 0.0; matched_count = 0
    total_value = sum(a["total_value_cad"] for a in agg.values())
    total_count = sum(a["contract_count"] for a in agg.values())
    for root, a in agg.items():
        rec = corp_index.get(a["canonical_key"])
        corp_number = rec["corp_number"] if rec else ""
        country = rec["registered_country"] if rec else ""
        if rec:
            matched_v += 1
            matched_value += a["total_value_cad"]
            matched_count += a["contract_count"]
        variants = a["raw_variants"]
        disp = max(variants, key=len) if variants else a["canonical_key"]
        spine_rows.append({
            "vendor_id": f"V{root.encode('utf-8').hex()[:16].upper()}",
            "canonical_name": disp,
            "raw_variant_count": a["raw_variant_count"],
            "corporation_number": corp_number,
            "contract_count": a["contract_count"],
            "total_value_cad": a["total_value_cad"],
            "first_year": a["first_year"],
            "last_year": a["last_year"],
            "country_or_unknown": country if country else "UNKNOWN (unmatched)",
        })
    spine_rows.sort(key=lambda r: r["total_value_cad"], reverse=True)
    with open(os.path.join(OUT, "vendor_spine.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["vendor_id","canonical_name","raw_variant_count",
            "corporation_number","contract_count","total_value_cad","first_year","last_year","country_or_unknown"])
        w.writeheader()
        w.writerows(spine_rows)

    print(f"matched vendors: {matched_v}/{len(agg)} = {matched_v/max(len(agg),1):.1%}", flush=True)
    print(f"matched value: {matched_value:,.0f} of {total_value:,.0f} = {matched_value/max(total_value,1):.1%}", flush=True)
    print(f"matched contracts: {matched_count}/{total_count} = {matched_count/max(total_count,1):.1%}", flush=True)

    json.dump({"matched_vendors": matched_v, "canonical_vendors": len(agg),
               "matched_value_cad": round(matched_value, 2),
               "total_value_cad": round(total_value, 2),
               "matched_contracts": matched_count, "total_contracts": total_count,
               "method": "exact match of normalized vendor key against normalized corp legal names"},
              open(os.path.join(OUT, "_match_stats.json"), "w"), indent=1)
    print("done")

if __name__ == "__main__":
    main()
