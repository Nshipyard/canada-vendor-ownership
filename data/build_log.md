# Federal Vendor Ownership - Build Log

Build date: 2026-10-10. All sources under the Open Government Licence - Canada.
Pipeline scripts: `merge_corporations.py`, `vendor_pipeline.py`, `corp_match.py`,
`canadabuys_join.py`, `build_final.py` (in `~/workspace/canada-vendor-ownership/`).

## Source downloads (all succeeded, no retries needed)

- TBS "Proactive Publication - Contracts" contracts.csv: 641,790,933 bytes, downloaded
  2026-10-10, 1,388,798 CSV lines. Dataset page says updated 2026-10-09. Also fetched
  the data dictionary XLSX and the recombinant schema JSON.
  NOTE: the CSV download shell lost its `cd` after backgrounding, so the dictionary,
  schema, and CanadaBuys historical file landed in `~` and were moved into `raw/`
  manually. Contracts.csv itself landed correctly.
- ISED Federal Corporations, 8 CSVs from `d4bf66bykfyaf.cloudfront.net`, all OK.
- CanadaBuys: `contractHistoryComplete` (61.7 MB, award dates 2023-06-01 to 2026-09-25)
  and `2009-2023-contractHistoryHistorical` (167 MB, 2009-01-01 to 2023-05-31). Both
  already use the SAME restructured bilingual schema, so per-fiscal-year files were
  skipped as redundant (verified by date-range scan). CanadaBuys data dictionary XML
  fetched from donnees-data.tpsgc-pwgsc.gc.ca.

## Corporations merge (Step B)

- 8 files -> one table keyed on corporation number. EN and FR files for each subset are
  row-for-row duplicates (645,344 rows each for active-cbca), merged into one record:
  legal_name_en from the EN file, legal_name_fr from the FR file. Status preference on
  overlap: active-cbca > active-non-cbca > inactive-cbca > inactive-non-cbca.
- Raw subset row counts: active-cbca 1,290,688; active-non-cbca 102,424;
  inactive-cbca 1,665,872; inactive-non-cbca 85,314.
- Result: 1,572,149 unique corp numbers in `data/corporations_merged.csv`.
- Columns: corp_number, legal_name_en, legal_name_fr, status, governing_legislation,
  registered_city, registered_province, registered_country, business_number, source_subset.

## Vendor normalization + contract-level dedup (Step C)

- Normalization: uppercase, strip whitespace, `&` -> AND, drop punctuation, drop trailing
  legal suffixes (LTD/INC/CORP/LLC/LTEE/LIMITED/INCORPORATED/...), drop leading "THE",
  collapse whitespace.
- KEY DECISION: contracts.csv is a quarterly publication series, not one row per
  contract. contract_value is the RUNNING CUMULATIVE total (original + amendments to
  date). Verified on samples: e.g. (pwgsc-tpsgc, EP93811596) appears 6 times with
  values growing 408,766 -> 1,111,134. Summing contract_value over rows overcounts by
  2.56x ($1.185T row-sum vs $463.2B contract-level). Contract-level dedup key is
  (owner_org, procurement_id) — procurement_id alone is NOT unique because departments
  restart numbering (e.g. P2000002 appears across orgs). Representative row per contract
  = max contract_value (latest cumulative total). All aggregates are contract-level.
- Rows: 1,313,289 data rows (file has 1,388,798 lines; the gap is embedded newlines in
  quoted comment fields). Kept 1,312,765 rows -> 1,099,940 distinct contracts.
- Exact normalized vendors: 148,823 -> 140,525 canonical vendors after fuzzy union-find
  (5,706 merge groups; 4.33M candidate pairs within identical-first-token blocks,
  difflib ratio >= 0.93). All merges logged to `data/vendor_merges.json`.
- Quarantine (524 rows): negative_amount 155 (NOTE: TBS schema says negative amendments
  are officially reportable, so these may be legitimate de-obligations; quarantined per
  spec), phone_number_like_vendor 137, blank_vendor 77, year_out_of_range 232 (years
  outside 2003-2026; the TBS file starts with C-2003-2004 reporting periods, so the
  lower bound was corrected from 2009 after an initial run wrongly quarantined 109,299
  legitimate pre-2009 rows), phone_number_like_amount 0 in final run.
- IMPORTANT correction made mid-build: the initial $10B+ amount-quarantine rule caught
  SkyAlyne's $11.2B FAcT contract (a real, publicly documented award). Rule tightened
  to >= $100B only. SkyAlyne's 3 rows ($33.66B) are in scope.

## Vendor to corp number (Step D)

- Exact match of normalized vendor key against normalized federal corp legal names
  (same normalization incl. suffix stripping on both sides; first attempt without
  suffix-stripping on corp names gave 0.5% and was fixed).
- Result: 11,816 / 140,525 vendors matched (8.4%); $159.9B / $463.2B (34.5% of dollars);
  307,136 / 1,099,940 contracts (27.9%).
- Honest caveat: match is against FEDERAL corporations only. Provincially-incorporated
  vendors do not match even when obviously real (Irving Shipbuilding, Vancouver
  Shipyards, BGIS are unmatched). Unmatched vendors are labelled "UNKNOWN (unmatched)";
  no country is guessed for them.

## CanadaBuys (Step E)

- Crosswalk `data/canadabuys_crosswalk.csv` (53 rows): legacy pre-April-2023 columns
  (from the archived 2022-2023 fiscal file header on open.canada.ca) -> restructured
  columns, with EN/FR pair roles and notes; plus a row documenting the temporal split
  (complete = 2023-06-01+, historical = 2009-2023-05-31; identical schema in both files,
  restructure applied retroactively).
- Join TBS <-> CanadaBuys on conservative rule: normalized supplier name equality AND
  rounded-dollar amount equality (totalContractValue, fallback contractAmount) AND
  award date within 120 days, CAD only. 224,032 CanadaBuys contracts; 200,645 eligible;
  33,657 matched = 16.8% join rate ($21.5B). Low rate is expected: CanadaBuys history
  covers only PWGSC-awarded contracts on behalf of departments, while TBS covers all
  departments' self-reported contracts, and the ID namespaces differ.

## Concentration (Step F)

- Totals: $463,244,999,662 across 1,099,940 contracts (2004-2026 by contract date;
  reporting periods back to 2003-2004).
- Top 5 by value: BGIS $19.21B; Irving Shipbuilding $19.16B; Vancouver Shipyards
  $15.99B; SkyAlyne $11.22B; Lockheed Martin Canada $10.06B (corp 3214222, matched).
- Canadian-vs-foreign: from registered_country of matched corps: $159.9B matched
  (34.5%, all CA), $303.3B unmatched origin unknown (65.5%). No foreign share can be
  computed from the match alone.
- Supplementary signal: TBS's own department-declared country_of_vendor per contract:
  CA 74.1%, blank 18.5%, US 4.2%, ES 1.6%, DE 0.7%. Kept separate from the matched
  analysis and labelled supplementary.

## Ownership parent layer (Step G): PARTIAL

- No free bulk source of ultimate parents exists. StatCan Inter-Corporate Ownership
  (Corporations Returns Act schedules) is the authoritative "who owns what" but is a
  paid, threshold-based product (~45,000 corps), not bulk open data. The federal
  Individuals with Significant Control register is not bulk-published. The ISED CSV
  has no parent field.
- `data/verified_parents.csv`: top 5 vendors by value, manually verified from
  official/press sources on 2026-10-10, excluded from automated aggregates:
  BGIS -> CCMP+AIMCo (Veritas acquisition announced Jul 2026, close expected Q4 2026);
  Irving Shipbuilding -> J.D. Irving, Limited; Vancouver Shipyards -> Seaspan ULC;
  SkyAlyne -> CAE + KF Aerospace JV; Lockheed Martin Canada -> Lockheed Martin Corp.

## What did not work / open gaps

- Sandbox Chromium cannot verify live sites here; no live URL checks were performed.
- Nothing pushed, committed, or emailed (research only, per task).
- CanadaBuys historical file retro-restructure means the "legacy schema" only survives
  in archived fiscal-year files (used for the crosswalk via header fetch).
- Negative amendments quarantined per spec but may be legitimate (see note above).
- vendor_spine.csv canonical_name uses the longest raw variant as display; raw variants
  are not individually stored in the CSV (they are in vendor_merges.json).
- Intermediate pipeline files (_vendor_exact.json, _canonical.json, _match_stats.json,
  _quarantine_detail.json, _yearly.json, _canadabuys_join.json, _corp_merge_counts.json)
  kept in data/ for auditability.
