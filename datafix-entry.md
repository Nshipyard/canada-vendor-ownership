# Data-fixes log entry: Federal Vendor Ownership

## EN

**Dataset:** Treasury Board "Proactive Publication - Contracts" (1,091,444 rows, updated 2026-10-09); PSPC "CanadaBuys contract history" (complete + historical files); ISED "Federal Corporations" (8 bulk files, 4 subsets x EN/FR).

**What was wrong:**
- The contracts file republishes every contract quarterly with contract_value as a running cumulative total. Summing rows overcounts the true total by 2.56x: $1.185T instead of $463.2B.
- Vendor names are entered by 100+ reporting offices with no canonical key. 211,090 distinct raw strings for roughly 140,000 real vendors. One vendor appeared under 65 spellings sharing the same first eight letters.
- CanadaBuys changed its column schema in June 2023 and restructured it again in March-April 2026. Column names are bilingual hyphenated pairs (supplierName-nomFournisseur). No crosswalk ships with the data.
- Corporations Canada split the Federal Corporations bulk file into four subsets in two languages in April 2026 with no merged file and no key documentation.
- 458 rows carried negative amounts, phone-number-like vendor fields, out-of-range years, or blank vendors.

**The fix:**
- Contract-level dedup on (reporting office, procurement ID), keeping the row with the maximum cumulative value. Procurement IDs collide across departments, so the office is part of the key.
- Vendor normalization: uppercase, legal suffixes stripped, punctuation removed, whitespace collapsed. Exact dedup on normalized keys (148,823), then fuzzy union-find at difflib ratio 0.93+ within identical-first-token blocks (5,706 merge groups, every merge logged with ratio and variants).
- Hand-built CanadaBuys crosswalk: 53 rows mapping legacy columns to restructured columns, bilingual pairs harmonized to single English keys.
- Merged the 8 corporation files into one table keyed on corporation number: 1,572,149 unique corporations, active and inactive unioned.
- Quarantine rules caught 458 rows before any aggregate: 155 negative amounts, 137 phone-number-like vendors, 89 out-of-range years, 77 blank vendors. Two rules were corrected mid-build: the year floor moved from 2009 to 2003 after 109,000 legitimate old rows were caught, and a $10B amount cap was raised to $100B after it falsely quarantined a real $11.2B contract.

**Before/after:**
- Before: `contract_value` summed naively = $1.185T. After: contract-level dedup = $463.2B across 1,099,940 distinct contracts.
- Before: "BGIS GLOBAL INTEGRATED SOLUTIONS CANADA" vs "BGIS GLOBAL SOLUTIONS LTD" vs 3 more spellings, counted separately. After: one canonical vendor, $19.2B total, merge logged.
- Before: 8 corporation files, no shared key. After: corporations_merged.csv, 1,572,149 rows, one row per corporation number.
- Before: CanadaBuys pre-2023 and post-2023 files unjoinable. After: 53-row crosswalk, 16.8% conservative join rate to TBS contracts.

**Result:** 140,525 canonical vendors. 11,816 matched to a federal corporation (8.4% of vendors, 34.5% of dollars). The parent layer stays partial: no free bulk source of ultimate corporate parents exists in Canada, and the project names the missing source instead of inventing parents.

## FR

**Jeu de données :** « Publication proactive - Contrats » du Conseil du Trésor (1 091 444 lignes, mis à jour 2026-10-09); « historique des contrats de CanadaBuys » de SPAC (fichiers complet et historique); « Sociétés fédérales » d'ISDE (8 fichiers en vrac, 4 sous-ensembles x EN/FR).

**Ce qui n'allait pas :**
- Le fichier des contrats republie chaque contrat chaque trimestre avec contract_value comme total cumulatif courant. Sommer les lignes surcompte le vrai total de 2,56 fois : 1 185 milliards au lieu de 463,2.
- Les noms de fournisseurs sont saisis par plus de 100 bureaux déclarants sans clé canonique. 211 090 chaînes brutes distinctes pour environ 140 000 vrais fournisseurs. Un fournisseur apparaissait sous 65 orthographes partageant les mêmes huit premières lettres.
- CanadaBuys a changé son schéma de colonnes en juin 2023 et l'a restructuré à nouveau en mars-avril 2026. Les noms de colonnes sont des paires bilingues séparées par un trait d'union. Aucune table de correspondance n'est livrée.
- Corporations Canada a scindé le fichier en vrac des sociétés fédérales en quatre sous-ensembles en deux langues en avril 2026, sans fichier fusionné ni documentation de clé.
- 458 lignes portaient des montants négatifs, des fournisseurs ressemblant à des numéros de téléphone, des années hors plage ou des fournisseurs vides.

**La correction :**
- Déduplication au niveau du contrat sur (bureau déclarant, numéro d'approvisionnement), en gardant la ligne avec la valeur cumulée maximale. Les numéros d'approvisionnement se chevauchent entre ministères, le bureau fait donc partie de la clé.
- Normalisation des noms de fournisseurs : majuscules, suffixes juridiques retirés, ponctuation supprimée, espaces réduits. Déduplication exacte sur les clés normalisées (148 823), puis union-find flou à un ratio difflib de 0,93 ou plus dans des blocs à premier jeton identique (5 706 groupes de fusion, chaque fusion journalisée avec ratio et variantes).
- Table de correspondance CanadaBuys construite à la main : 53 lignes reliant les colonnes historiques aux colonnes restructurées, paires bilingues harmonisées en clés anglaises uniques.
- Fusion des 8 fichiers de sociétés en une table indexée sur le numéro d'entreprise : 1 572 149 sociétés uniques, ensembles actifs et inactifs unis.
- Les règles de quarantaine ont attrapé 458 lignes avant tout agrégat : 155 montants négatifs, 137 fournisseurs ressemblant à des numéros de téléphone, 89 années hors plage, 77 fournisseurs vides. Deux règles ont été corrigées en cours de route : le plancher d'année est passé de 2009 à 2003 après que 109 000 vieilles lignes légitimes furent attrapées, et un plafond de 10 milliards a été relevé à 100 milliards après avoir faussement mis en quarantaine un vrai contrat de 11,2 milliards.

**Avant/après :**
- Avant : `contract_value` sommé naïvement = 1 185 milliards. Après : déduplication au niveau du contrat = 463,2 milliards sur 1 099 940 contrats distincts.
- Avant : « BGIS GLOBAL INTEGRATED SOLUTIONS CANADA » contre « BGIS GLOBAL SOLUTIONS LTD » et 3 autres orthographes, comptées séparément. Après : un fournisseur canonique, 19,2 milliards au total, fusion journalisée.
- Avant : 8 fichiers de sociétés, sans clé partagée. Après : corporations_merged.csv, 1 572 149 lignes, une ligne par numéro d'entreprise.
- Avant : fichiers CanadaBuys pré-2023 et post-2023 non joignables. Après : table de 53 lignes, taux de jointure conservateur de 16,8 % vers les contrats du CT.

**Résultat :** 140 525 fournisseurs canoniques. 11 816 appariés à une société fédérale (8,4 % des fournisseurs, 34,5 % des dollars). La couche parente reste partielle : aucune source canadienne gratuite en vrac ne publie les sociétés mères ultimes, et le projet nomme la source manquante au lieu d'inventer des parents.
