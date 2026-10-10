#!/usr/bin/env python3
"""Step B: merge the 8 ISED Federal Corporations CSVs into one table keyed on corp number."""
import csv, json, os, sys
from collections import Counter

RAW = os.path.expanduser("~/workspace/canada-vendor-ownership/raw")
OUT = os.path.expanduser("~/workspace/canada-vendor-ownership/data")
os.makedirs(OUT, exist_ok=True)

SUBSETS = [
    ("corporations-active-cbca-en.csv", "active-cbca"),
    ("corporations-actives-lcsa-fr.csv", "active-cbca"),
    ("corporations-active-non-cbca-en.csv", "active-non-cbca"),
    ("corporations-actives-non-lcsa-fr.csv", "active-non-cbca"),
    ("corporations-inactive-or-dissolved-cbca-en.csv", "inactive-cbca"),
    ("corporations-inactives-ou-dissoutes-lcsa-fr.csv", "inactive-cbca"),
    ("corporations-inactive-or-dissolved-non-cbca-en.csv", "inactive-non-cbca"),
    ("corporations-inactives-ou-dissoutes-non-lcsa-fr.csv", "inactive-non-cbca"),
]

# column aliases: en-name -> fr-name
ALIASES = {
    "Corporation number": ["Numéro de société"],
    "Business number (BN)": ["Numéro d’entreprise (NE)", "Numéro d'entreprise (NE)"],
    "Corporate name - form 1": ["Dénomination sociale - version 1"],
    "Corporate name - form 2": ["Dénomination sociale - version 2"],
    "Governing legislation": ["Régime législatif"],
    "Status": ["Statut"],
    "Status Detail": ["Détail du statut"],
    "City/town": ["Municipalité/ville"],
    "Province/territory": ["Province/territoire"],
    "Country": ["Pays"],
}

def pick(row, en):
    cands = [en] + ALIASES.get(en, [])
    for c in cands:
        if c in row:
            return row[c]
    return ""

merged = {}
subset_counts = Counter()

def norm_num(n):
    return (n or "").strip()

for fname, subset in SUBSETS:
    path = os.path.join(RAW, fname)
    print(f"reading {fname} ...", flush=True)
    rows = 0
    with open(path, newline="", encoding="utf-8-sig") as f:
        rdr = csv.DictReader(f)
        for row in rdr:
            rows += 1
            num = norm_num(pick(row, "Corporation number"))
            if not num:
                continue
            name1 = pick(row, "Corporate name - form 1").strip()
            name2 = pick(row, "Corporate name - form 2").strip()
            status = pick(row, "Status").strip()
            leg = pick(row, "Governing legislation").strip()
            city = pick(row, "City/town").strip()
            prov = pick(row, "Province/territory").strip()
            country = pick(row, "Country").strip()
            bn = pick(row, "Business number (BN)").strip()
            rec = {
                "corp_number": num, "legal_name_en": "", "legal_name_fr": "",
                "status": status, "governing_legislation": leg,
                "registered_city": city, "registered_province": prov,
                "registered_country": country, "business_number": bn,
                "source_subset": subset,
            }
            if subset.endswith("-lcsa-fr") is False and False:
                pass
            if fname.endswith("-fr.csv"):
                rec["legal_name_fr"] = name1 or name2
            else:
                rec["legal_name_en"] = name1 or name2
            # alternate name field gets whichever form is non-empty and not already used
            if merged.get(num) is None:
                merged[num] = rec
                # store both forms
                if fname.endswith("-fr.csv"):
                    merged[num]["legal_name_fr"] = name1 or name2
                else:
                    merged[num]["legal_name_en"] = name1 or name2
            else:
                cur = merged[num]
                if fname.endswith("-fr.csv"):
                    if not cur["legal_name_fr"]:
                        cur["legal_name_fr"] = name1 or name2
                else:
                    if not cur["legal_name_en"]:
                        cur["legal_name_en"] = name1 or name2
                # prefer Active status / cbca subset over inactive
                pref = {"active-cbca": 0, "active-non-cbca": 1, "inactive-cbca": 2, "inactive-non-cbca": 3}
                if pref.get(subset, 9) < pref.get(cur["source_subset"], 9):
                    cur["source_subset"] = subset
                    cur["status"] = status or cur["status"]
                    cur["registered_city"] = city or cur["registered_city"]
                    cur["registered_province"] = prov or cur["registered_province"]
                    cur["registered_country"] = country or cur["registered_country"]
                    cur["business_number"] = bn or cur["business_number"]
                    cur["governing_legislation"] = leg or cur["governing_legislation"]
            subset_counts[subset] += 1
    print(f"  rows: {rows}", flush=True)

print(f"unique corp numbers: {len(merged)}", flush=True)
print("subset counts:", dict(subset_counts), flush=True)

out_path = os.path.join(OUT, "corporations_merged.csv")
with open(out_path, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["corp_number","legal_name_en","legal_name_fr","status",
        "governing_legislation","registered_city","registered_province","registered_country",
        "business_number","source_subset"])
    w.writeheader()
    for num in sorted(merged):
        w.writerow(merged[num])

json.dump({"subset_rows": dict(subset_counts), "unique_corp_numbers": len(merged)},
          open(os.path.join(OUT, "_corp_merge_counts.json"), "w"))
print("wrote", out_path, flush=True)
