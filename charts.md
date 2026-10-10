# Chart insight specs: Federal Vendor Ownership

## EN

### 1. Top 10 vendors by total contract value (horizontal bars)
What it shows: the ten canonical vendors with the largest cumulative contract value, 2003 to 2026.
The insight: shipbuilding and defence dominate. BGIS ($19.2B, 22 contracts), Irving Shipbuilding ($19.2B), Vancouver Shipyards ($16.0B), SkyAlyne ($11.2B), and Lockheed Martin Canada ($10.1B) lead. Note that the top three are provincially incorporated and do not match the federal registry, which is why the corp-match dollar rate is 34.5% despite these giants.
How to read it: bar length is cumulative contract value after contract-level dedup. Names are canonical, merged across spellings.

### 2. Matched contract dollars by registered country (stacked bar)
What it shows: $159.9B (34.5%) matched to Canadian-registered federal corporations, $303.3B (65.5%) unmatched and labelled unknown.
The insight: the ownership chain is provable for about a third of the money. The unknown share is not a data failure to hide, it is the finding: federal-only registry coverage cannot see provincially incorporated vendors.
How to read it: red is proven Canadian, grey is unknown. There is no foreign segment because every matched corporation is Canadian-registered.

### 3. Vendor name resolution funnel
What it shows: 211,090 raw vendor strings to 148,823 normalized keys to 140,525 canonical vendors.
The insight: roughly a third of the apparent vendor count was duplication. Normalization did most of the work, fuzzy merging (5,706 groups at 0.93) caught the long tail.
How to read it: each stage is a count of distinct vendor identities surviving that stage.

### 4. Contract value by year (bars, 2003-2026)
What it shows: annual contract value after contract-level dedup, peaking at $44.5B in 2024.
The insight: the raw file's quarterly republication with running cumulative totals would show $1.185T if summed naively. The deduped series is the honest one.
How to read it: each bar is one calendar year's distinct contracts by award date, valued at final cumulative amount.

### 5. Contract value by department-declared vendor country (horizontal bars)
What it shows: Canada $343.4B (74.1%), not declared $85.5B (18.5%), United States $19.4B (4.2%), other countries $15.0B.
The insight: the blank field is the story. Buy Canadian compliance is unmeasurable on $85.5B because departments leave the country field empty and nothing verifies it.
How to read it: self-reported per contract, not registry-verified. Treat as declared, not proven.

## FR

### 1. 10 premiers fournisseurs par valeur totale des contrats (barres horizontales)
Ce que ça montre : les dix fournisseurs canoniques avec la plus grande valeur cumulée de contrats, 2003 à 2026.
Le constat : la construction navale et la défense dominent. BGIS (19,2 milliards, 22 contrats), Irving Shipbuilding (19,2), Vancouver Shipyards (16,0), SkyAlyne (11,2) et Lockheed Martin Canada (10,1) mènent. Les trois premiers sont constitués en province et ne correspondent pas au registre fédéral, d'où le taux d'appariement de 34,5 % malgré ces géants.
Lecture : la longueur des barres est la valeur cumulée après déduplication au niveau du contrat. Les noms sont canoniques, fusionnés entre orthographes.

### 2. Dollars appariés par pays d'enregistrement (barre empilée)
Ce que ça montre : 159,9 milliards (34,5 %) appariés à des sociétés fédérales enregistrées au Canada, 303,3 milliards (65,5 %) non appariés et étiquetés inconnus.
Le constat : la chaîne de propriété est prouvable pour environ un tiers de l'argent. La part inconnue n'est pas un échec à cacher, c'est le constat : le registre fédéral seul ne voit pas les fournisseurs constitués en province.
Lecture : le rouge est prouvé canadien, le gris est inconnu. Il n'y a pas de segment étranger parce que chaque société appariée est enregistrée au Canada.

### 3. Entonnoir de résolution des noms de fournisseurs
Ce que ça montre : 211 090 chaînes brutes vers 148 823 clés normalisées vers 140 525 fournisseurs canoniques.
Le constat : environ un tiers du nombre apparent de fournisseurs était de la duplication. La normalisation a fait l'essentiel, la fusion floue (5 706 groupes à 0,93) a attrapé la longue traîne.
Lecture : chaque étape est un nombre d'identités de fournisseurs distinctes survivant à cette étape.

### 4. Valeur des contrats par année (barres, 2003-2026)
Ce que ça montre : la valeur annuelle des contrats après déduplication, avec un pic à 44,5 milliards en 2024.
Le constat : la republication trimestrielle du fichier brut avec totaux cumulatifs courants afficherait 1 185 milliards en sommation naïve. La série dédupliquée est l'honnête.
Lecture : chaque barre est une année civile de contrats distincts par date d'attribution, valorisés au montant cumulé final.

### 5. Valeur des contrats par pays déclaré par le ministère (barres horizontales)
Ce que ça montre : Canada 343,4 milliards (74,1 %), non déclaré 85,5 milliards (18,5 %), États-Unis 19,4 milliards (4,2 %), autres pays 15,0 milliards.
Le constat : le champ vide est l'histoire. La conformité à l'achat canadien est inmesurable sur 85,5 milliards parce que les ministères laissent le pays vide et que rien ne le vérifie.
Lecture : autodéclaré par contrat, non vérifié contre un registre. À traiter comme déclaré, non prouvé.
