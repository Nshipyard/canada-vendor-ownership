#!/usr/bin/env python3
"""Step C: TBS contracts vendor normalization + CONTRACT-LEVEL dedup.

A contract appears once per quarterly publication with contract_value = running
cumulative total (original + all amendments to date). Dedup key: (owner_org, procurement_id);
the representative record is the row with the largest contract_value (latest cumulative total).
Quarantine rules applied per-row; a contract is kept if it has at least one kept row.
Fuzzy merge: exact dedup on normalized keys, then union-find at difflib ratio >= 0.93
with identical first token.
"""
import csv, json, os, re
from collections import defaultdict, Counter
from difflib import SequenceMatcher

RAW = os.path.expanduser("~/workspace/canada-vendor-ownership/raw")
OUT = os.path.expanduser("~/workspace/canada-vendor-ownership/data")
os.makedirs(OUT, exist_ok=True)

SUFFIXES = {"LTD","LTD.","LIMITED","LIMITED.","INC","INC.","INCORPORATED","INCORPORÉE","INCORPOREE",
            "CORP","CORP.","CORPORATION","LLC","LLC.","LLP","L.L.C.","LTÉE","LTEE","LTEE.",
            "LTE","SENC","S.E.N.C.","S.A.R.L.","SARL","SA","S.A.","NV","N.V.","BV","B.V.",
            "AG","GMBH","CO","CO.","COMPANY","COY","PLC","PTY","GROUP","HOLDINGS","SERVICES",
            "ASSOCIATES","ENTERPRISES","INTERNATIONAL","CANADA","LIMITEE","LITÉE"}
_SUFFIX_CLEAN = {s.replace('.', '') for s in SUFFIXES}

def normalize_vendor(raw):
    v = (raw or "").strip()
    v = re.sub(r'\s+', ' ', v)
    up = v.upper()
    up = up.replace('&', ' AND ')
    up = up.replace('/', ' ').replace('\\', ' ')
    up = re.sub(r'[.,;:"\'()\[\]{}!?@#$%^*+=~`|<>–—-]+', ' ', up)
    up = re.sub(r'\s+', ' ', up).strip()
    toks = up.split()
    while toks and toks[-1].replace('.','') in _SUFFIX_CLEAN:
        toks.pop()
    if toks and toks[0] == 'THE':
        toks.pop(0)
    return ' '.join(toks)

DIGITS_RE = re.compile(r'^\+?[\d][\d\s\-().]{5,}\d$')

def quarantine_reason(vendor_raw, contract_value, contract_date):
    v = (vendor_raw or "").strip()
    if not v:
        return "blank_vendor"
    if DIGITS_RE.match(v) and sum(c.isdigit() for c in v) >= 7:
        return "phone_number_like_vendor"
    try:
        cv = float(str(contract_value).replace(',', '')) if contract_value not in (None, '') else None
    except ValueError:
        return "unparseable_amount"
    if cv is not None:
        if cv < 0:
            # NB: TBS schema says negative amendments are officially reportable;
            # quarantined per task spec, flagged as potentially-legitimate in build log.
            return "negative_amount"
        # $100B+ is certainly junk; NOT flagging $10B+ (SkyAlyne $11.2B FAcT is real)
        if cv >= 1e11:
            return "phone_number_like_amount"
    d = (contract_date or "").strip()[:4]
    # TBS proactive publication starts with 2003-2004 reporting periods
    if d.isdigit() and (int(d) < 2003 or int(d) > 2026):
        return "year_out_of_range"
    return None

def main():
    path = os.path.join(RAW, "contracts.csv")
    stats = Counter()
    quarantine = defaultdict(lambda: {"count": 0, "examples": []})
    # contract key -> {"rows": [kept row summaries]}
    contracts = {}
    total_rows = 0

    with open(path, newline="", encoding="utf-8-sig") as f:
        rdr = csv.DictReader(f)
        for row in rdr:
            total_rows += 1
            vr = row.get("vendor_name", "")
            cv_raw = row.get("contract_value", "")
            cd = row.get("contract_date", "")
            q = quarantine_reason(vr, cv_raw, cd)
            if q:
                stats[f"quar_{q}"] += 1
                e = quarantine[q]
                e["count"] += 1
                if len(e["examples"]) < 5:
                    e["examples"].append({"vendor_name": vr[:80], "contract_value": cv_raw,
                                          "contract_date": cd, "reference_number": row.get("reference_number","")})
                continue
            norm = normalize_vendor(vr)
            if not norm:
                stats["quar_blank_after_normalize"] += 1
                continue
            try:
                cv = float(str(cv_raw).replace(',', '')) if cv_raw not in (None, '') else 0.0
            except ValueError:
                cv = 0.0
            pid = row.get("procurement_id", "").strip() or row.get("reference_number", "").strip()
            key = (row.get("owner_org", "").strip(), pid)
            rec = contracts.get(key)
            if rec is None:
                contracts[key] = rec = {"rows": []}
            rec["rows"].append({"norm": norm, "vendor_raw": vr.strip(), "value": cv,
                                "date": cd.strip(), "ref": row.get("reference_number", "").strip(),
                                "org": row.get("owner_org", "").strip()})
            stats["kept_rows"] += 1

    n_contracts = len(contracts)
    print(f"total_rows={total_rows} kept_rows={stats['kept_rows']} contracts={n_contracts}", flush=True)

    # representative per contract: max contract_value (latest cumulative total)
    vendors = {}  # norm -> agg
    yearly = defaultdict(lambda: [0.0, 0])  # year -> [value, contract_count]
    org_counts = Counter()
    for key, c in contracts.items():
        rep = max(c["rows"], key=lambda r: (r["value"], r["ref"]))
        org_counts[rep["org"]] += 1
        v = vendors.get(rep["norm"])
        if v is None:
            vendors[rep["norm"]] = v = {"variants": set(), "total": 0.0, "count": 0,
                                        "min_year": None, "max_year": None,
                                        "canonical_name": rep["vendor_raw"]}
        v["variants"].add(rep["vendor_raw"])
        v["total"] += rep["value"]
        v["count"] += 1
        y = rep["date"][:4]
        if y.isdigit():
            y = int(y)
            v["min_year"] = y if v["min_year"] is None or y < v["min_year"] else v["min_year"]
            v["max_year"] = y if v["max_year"] is None or y > v["max_year"] else v["max_year"]
            yy = yearly[y]
            yearly[y] = [yy[0] + rep["value"], yy[1] + 1]

    total_value = sum(v["total"] for v in vendors.values())
    print(f"unique normalized vendors (exact)={len(vendors)} contract_level_value={total_value:,.0f}", flush=True)

    # ---- fuzzy union-find merge ----
    keys = list(vendors.keys())
    parent = {k: k for k in keys}
    def find(k):
        while parent[k] != k:
            parent[k] = parent[parent[k]]
            k = parent[k]
        return k
    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    blocks = defaultdict(list)
    for k in keys:
        first = k.split()[0] if k.split() else ""
        blocks[first].append(k)

    THRESH = 0.93
    n_pairs = 0
    for first, members in blocks.items():
        if len(members) < 2:
            continue
        for i in range(len(members)):
            for j in range(i+1, len(members)):
                a, b = members[i], members[j]
                n_pairs += 1
                if SequenceMatcher(None, a, b).ratio() >= THRESH:
                    union(a, b)

    clusters = defaultdict(list)
    for k in keys:
        clusters[find(k)].append(k)
    print(f"candidate_pairs={n_pairs} clusters={len(clusters)}", flush=True)

    # canonical vendors + merge log
    canonical_of = {}
    merge_log = []
    canonical_agg = {}
    for root, members in clusters.items():
        for m in members:
            canonical_of[m] = root
        members.sort(key=lambda k: vendors[k]["total"], reverse=True)
        canon = members[0]
        v0 = vendors[canon]
        total = sum(vendors[m]["total"] for m in members)
        count = sum(vendors[m]["count"] for m in members)
        variants = set()
        yrs = []
        for m in members:
            variants |= vendors[m]["variants"]
            if vendors[m]["min_year"]: yrs.append(vendors[m]["min_year"])
            if vendors[m]["max_year"]: yrs.append(vendors[m]["max_year"])
        canonical_agg[root] = {
            "canonical_key": canon,
            "canonical_name": v0["canonical_name"],
            "raw_variants": sorted(variants),
            "raw_variant_count": len(variants),
            "contract_count": count,
            "total_value_cad": round(total, 2),
            "first_year": min(yrs) if yrs else "",
            "last_year": max(yrs) if yrs else "",
            "member_keys": members,
        }
        if len(members) > 1:
            merge_log.append({
                "canonical_id": None,  # filled by match step with stable id
                "canonical_name": v0["canonical_name"],
                "canonical_key": canon,
                "raw_variants": sorted(variants),
                "merged_keys": [
                    {"key": m, "display": vendors[m]["canonical_name"],
                     "ratio": round(SequenceMatcher(None, canon, m).ratio(), 4)}
                    for m in members[1:]
                ],
                "threshold": THRESH,
                "note": "identical-first-token block, difflib ratio >= 0.93",
            })

    print(f"canonical_vendors={len(canonical_agg)} merge_groups={len(merge_log)}", flush=True)

    json.dump(merge_log, open(os.path.join(OUT, "vendor_merges.json"), "w"), indent=1, ensure_ascii=False)
    json.dump({k: {"variants": sorted(v["variants"]), "total": v["total"], "count": v["count"],
                   "min_year": v["min_year"], "max_year": v["max_year"],
                   "canonical_of": canonical_of[k], "canonical_name": v["canonical_name"]}
               for k, v in vendors.items()},
              open(os.path.join(OUT, "_vendor_exact.json"), "w"), ensure_ascii=False)
    json.dump({"rows_total": total_rows, "rows_kept": stats["kept_rows"],
               "contracts": n_contracts, "canonical_vendors": len(canonical_agg),
               "merge_groups": len(merge_log), "total_value_cad": total_value,
               "exact_vendor_keys": len(vendors),
               "quarantine": {k: v for k, v in stats.items() if k.startswith("quar")}},
              open(os.path.join(OUT, "_vendor_stats.json"), "w"), indent=1)
    json.dump({k: dict(q) for k, q in quarantine.items()},
              open(os.path.join(OUT, "_quarantine_detail.json"), "w"), indent=1)
    json.dump({str(y): {"value": v[0], "contracts": v[1]} for y, v in sorted(yearly.items())},
              open(os.path.join(OUT, "_yearly.json"), "w"), indent=1)
    json.dump({"canonical_agg": canonical_agg,
               "canonical_of": canonical_of},
              open(os.path.join(OUT, "_canonical.json"), "w"))
    print("done", flush=True)

if __name__ == "__main__":
    main()
