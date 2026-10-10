#!/usr/bin/env python3
"""Step E: CanadaBuys crosswalk + join of award notices to TBS contract-level records.
Join rule (exact, conservative): normalized supplier name equality AND rounded-dollar
amount equality (totalContractValue, else contractAmount) AND award date within 120 days.
Currency restricted to CAD."""
import csv, json, os, re
from collections import defaultdict
from datetime import date

RAW = os.path.expanduser("~/workspace/canada-vendor-ownership/raw")
OUT = os.path.expanduser("~/workspace/canada-vendor-ownership/data")
import sys
sys.path.insert(0, os.path.expanduser("~/workspace/canada-vendor-ownership"))
from vendor_pipeline import normalize_vendor, quarantine_reason

# ---------------- crosswalk ----------------
LEGACY_NEW = [
    # (legacy column, new column, notes)
    ("contract-number", "contractNumber-numeroContrat", "renamed"),
    ("amendment_number", "amendmentNumber-numeroModification", "renamed"),
    ("award_date", "contractAwardDate-dateAttributionContrat", "renamed; expiry-date dropped in new schema"),
    ("expiry-date", "contractEndDate-dateFinContrat", "closest analog; expiry-date was in legacy only"),
    ("contract-value", "contractAmount-montantContrat", "renamed"),
    ("total-contract-value", "totalContractValue-valeurTotaleContrat", "renamed"),
    ("gsin", "gsin-nibs", "renamed"),
    ("gsin-description_en", "gsinDescription-nibsDescription-eng", "renamed"),
    ("gsin-description_fr", "gsinDescription-nibsDescription-fra", "renamed"),
    ("competitive-tender_en", "procurementMethod-methodeApprovisionnement-eng", "recast: competitive/open vs limited tendering"),
    ("competitive-tender_fr", "procurementMethod-methodeApprovisionnement-fra", "recast"),
    ("limited-tender-reason", "limitedTenderingReason-raisonAppelOffresLimite-eng", "renamed"),
    ("limited-tender-reason-description_en", "limitedTenderingReason-raisonAppelOffresLimite-eng", "merged into reason code descriptions"),
    ("solicitation-procedure", "solicitationNumber-numeroSollicitation", "not the same: legacy was procedure code+desc; new has number only"),
    ("trade-agreement", "tradeAgreements-accordsCommerciaux-eng", "renamed"),
    ("supplier-standardized-name", "supplierStandardizedName-nomNormaliseFournisseur-eng", "renamed"),
    ("supplier-operating-name", "supplierOperatingName-nomCommercialFournisseur-eng", "renamed"),
    ("supplier-legal-name", "supplierLegalName-nomLegalFournisseur-eng", "renamed"),
    ("supplier-address-city", "supplierAddressCity-fournisseurAdresseVille-eng", "renamed"),
    ("supplier-address-prov-state", "supplierAddressProvince-fournisseurAdresseProvince-eng", "renamed"),
    ("supplier-address-postal-code", "supplierAddressPostalCode-fournisseurAdresseCodePostal", "renamed"),
    ("supplier-address-country", "supplierAddressCountry-fournisseurAdressePays-eng", "renamed"),
    ("organization-employee-count_en", "supplierEmployeeCount-fournisseurNombreEmployes-eng", "renamed"),
    ("number-records", "numberOfRecords-nombreEnregistrements", "renamed"),
    ("end-user-entity_en", "endUserEntitiesName-nomEntitesUtilisateurFinal-eng", "renamed"),
    ("contracting-entity-office-name_en", "contractingEntityName-nomEntitContractante-eng", "renamed"),
    ("procurement-entity-name_en", "procurement-entity-name_en", "dropped in new schema (PWGSC-centric field)"),
    ("country-percentage", "percentageOfGoodsByCountry-pourcentageDeBiensParPays", "renamed"),
    ("date-file-published", "publicationDate-datePublication", "renamed"),
]

NEW_ONLY = [
    "title-titre-eng", "title-titre-fra", "referenceNumber-numeroReference",
    "procurementNumber-numeroApprovisionnement", "amendmentDate-dateModification",
    "contractStartDate-contratDateDebut", "contractCurrency-contratMonnaie",
    "contractStatus-statutContrat-eng", "contractStatus-statutContrat-fra",
    "instrumentType-typeInstrument-eng", "instrumentType-typeInstrument-fra",
    "amendmentType-typeModification-eng", "amendmentType-typeModification-fra",
    "unspsc", "unspscDescription-eng", "unspscDescription-fra",
    "procurementCategory-categorieApprovisionnement", "noticeType-avisType-eng",
    "noticeType-avisType-fra", "selectionCriteria-criteresSelection-eng",
    "selectionCriteria-criteresSelection-fra", "regionsOfDelivery-regionsLivraison-eng",
    "regionsOfDelivery-regionsLivraison-fra",
]

def lang_role(col):
    if col.endswith("-eng"):
        return "English member of EN/FR pair"
    if col.endswith("-fra"):
        return "French member of EN/FR pair"
    return "language-neutral (shared)"

def write_crosswalk():
    rows = []
    for old, new, notes in LEGACY_NEW:
        rows.append({"old_column": old, "new_column": new,
                     "language_pair": lang_role(new),
                     "notes": notes})
    legacy_set = {o for o, _, _ in LEGACY_NEW}
    for new in NEW_ONLY:
        rows.append({"old_column": "", "new_column": new,
                     "language_pair": lang_role(new),
                     "notes": "new column introduced with CanadaBuys-era schema (April 2023+); no legacy equivalent"})
    rows.append({"old_column": "(temporal split)", "new_column": "(temporal split)",
                 "language_pair": "n/a",
                 "notes": "Complete file covers contractAwardDate 2023-06-01 onward; Historical file covers 2009-01-01 to 2023-05-31. Both files already use the same restructured bilingual schema; the April 2023 restructure was applied retroactively to the historical data."})
    with open(os.path.join(OUT, "canadabuys_crosswalk.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["old_column", "new_column", "language_pair", "notes"])
        w.writeheader()
        w.writerows(rows)
    print(f"crosswalk rows: {len(rows)}", flush=True)

def parse_date(d):
    d = (d or "").strip()[:10]
    try:
        return date(int(d[0:4]), int(d[5:7]), int(d[8:10]))
    except Exception:
        return None

def parse_money(x):
    try:
        return float(str(x).replace(",", "").strip()) if x not in (None, "") else None
    except ValueError:
        return None

def cb_supplier(row):
    for c in ("supplierLegalName-nomLegalFournisseur-eng", "supplierLegalName-nomLegalFournisseur-fra",
              "supplierStandardizedName-nomNormaliseFournisseur-eng",
              "supplierOperatingName-nomCommercialFournisseur-eng"):
        v = (row.get(c) or "").strip()
        if v:
            return v
    return ""

def main():
    write_crosswalk()

    # 1) TBS contract reps
    print("building TBS contract index ...", flush=True)
    contracts = {}
    n_rows = 0
    with open(os.path.join(RAW, "contracts.csv"), newline="", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            n_rows += 1
            q = quarantine_reason(row.get("vendor_name",""), row.get("contract_value",""), row.get("contract_date",""))
            if q:
                continue
            norm = normalize_vendor(row.get("vendor_name",""))
            if not norm:
                continue
            pid = row.get("procurement_id","").strip() or row.get("reference_number","").strip()
            key = (row.get("owner_org","").strip(), pid)
            v = parse_money(row.get("contract_value","")) or 0.0
            d = row.get("contract_date","").strip()
            c = contracts.get(key)
            if c is None or (v, d) > (c["value"], c["date"]):
                contracts[key] = {"norm": norm, "value": v, "date": d}

    print(f"TBS kept contracts: {len(contracts)} (from {n_rows} rows)", flush=True)
    index = defaultdict(list)  # (norm, rounded $) -> [(date, key)]
    for key, c in contracts.items():
        d = parse_date(c["date"])
        if d is None:
            continue
        index[(c["norm"], round(c["value"]))].append((d, key))
    print(f"index keys: {len(index)}", flush=True)

    # 2) CanadaBuys contract reps
    print("reading CanadaBuys ...", flush=True)
    cb = {}
    for fname in ("cb_complete.csv", "cb_historical.csv"):
        with open(os.path.join(RAW, fname), encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                cn = (row.get("contractNumber-numeroContrat") or "").strip()
                if not cn:
                    continue
                sup = cb_supplier(row)
                if not sup:
                    continue
                amt = parse_money(row.get("totalContractValue-valeurTotaleContrat")) or \
                      parse_money(row.get("contractAmount-montantContrat"))
                if amt is None:
                    continue
                d = parse_date(row.get("contractAwardDate-dateAttributionContrat"))
                cur = (row.get("contractCurrency-contratMonnaie") or "").strip().upper()
                try:
                    amno = int(str(row.get("amendmentNumber-numeroModification") or "0").strip() or "0")
                except ValueError:
                    amno = 0
                c = cb.get(cn)
                rec = {"norm": normalize_vendor(sup), "value": amt, "date": d, "currency": cur,
                       "supplier": sup, "file": fname}
                if c is None or (amno, amt) > (c.get("amno", -1), c["value"]):
                    rec["amno"] = amno
                    cb[cn] = rec

    print(f"CanadaBuys distinct contracts: {len(cb)}", flush=True)
    eligible = {k: v for k, v in cb.items() if v["norm"] and v["date"] and v["currency"] in ("CAD", "")}
    print(f"join-eligible (name+date+CAD amount): {len(eligible)}", flush=True)

    # 3) join
    matched = 0
    matched_value = 0.0
    no_name = 0
    for cn, c in eligible.items():
        cands = index.get((c["norm"], round(c["value"])))
        if not cands:
            continue
        hit = any(abs((d - c["date"]).days) <= 120 for d, _ in cands)
        if hit:
            matched += 1
            matched_value += c["value"]

    join_rate = matched / max(len(eligible), 1)
    print(f"matched: {matched}/{len(eligible)} = {join_rate:.1%}  matched value ${matched_value:,.0f}", flush=True)
    json.dump({"canadabuys_contracts": len(cb), "join_eligible": len(eligible),
               "matched": matched, "join_rate": join_rate,
               "matched_value_cad": round(matched_value, 2),
               "rule": "normalized supplier name equality AND rounded-dollar amount equality AND award date within 120 days; CAD only",
               "caveat": "CanadaBuys contract history covers PWGSC-awarded contracts on behalf of departments; TBS proactive publication covers all departments' self-reported contracts. ID namespaces differ (contractNumber vs procurement_id), so the join is probabilistic."},
              open(os.path.join(OUT, "_canadabuys_join.json"), "w"), indent=1)
    print("done", flush=True)

if __name__ == "__main__":
    main()
