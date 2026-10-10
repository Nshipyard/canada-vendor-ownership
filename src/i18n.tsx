"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "en" | "fr";

const en = {
  nav: {
    home: "Home",
    explorer: "Explorer",
    showcase: "Showcase",
    methodology: "Methodology",
    data: "Data",
    brand: "Federal Vendor Ownership",
    badge: "Open Nshipyard",
  },
  home: {
    kicker: "Federal procurement, ownership-resolved",
    title: "Who really owns the companies getting federal contracts?",
    body: "Federal contract data lists vendor names as typed by more than a hundred reporting offices. The same company appears under many spellings, and nothing connects a vendor to its corporate record. This project resolves vendors to corporation numbers from Corporations Canada and measures what the raw files cannot: concentration of contract dollars, Canadian versus foreign ownership, and how much of it we can prove.",
    ctaExplore: "Explore the vendors",
    ctaShowcase: "See the findings",
    statsTitle: "The spine in numbers",
    statRecords: "contract records in scope",
    statValue: "total contract value",
    statVendors: "canonical vendors resolved",
    statMerges: "fuzzy merges logged",
    statCorps: "corporations in the merged registry",
    statMatched: "of contract dollars matched to a corporation",
    ownershipKicker: "The question nobody answers with data",
    ownershipTitle: "Vendor normalization exists. Ownership does not.",
    ownershipBody:
      "A federal vendor directory already normalizes vendor names. That tells you who got paid. It does not tell you who owns the vendor, whether the money stayed in Canada, or how many contract dollars flow to one corporate family. The Buy Canadian Procurement Policy Framework took effect on December 16, 2025, and the Auditor General traced corporate networks by hand to audit one consulting case. This project builds the repeatable evidence base: vendor to corporation number, corporation to registered country, dollars to owners.",
    showcaseKicker: "From the showcase",
    methodKicker: "How it was built",
    methodTitle: "Five repairs before the first chart",
    methodBody:
      "Vendor names were normalized across 100+ reporting entities, fuzzy merges were resolved at a documented threshold, the CanadaBuys June 2023 schema break was crossed with a column crosswalk, Corporations Canada's four split files were merged into one table keyed on corporation number, and ambiguous rows were quarantined instead of guessed. Every merge is logged. Every rule is in the methodology.",
    ctaData: "Download the data",
  },
  showcase: {
    kicker: "Data stories",
    title: "What the ownership spine reveals",
    body: "Each finding below is computed from the vendor spine and the merged corporations table. Every chart can be cited: use the copy button under each finding.",
    cite: "Cite this",
    copied: "Copied",
    source: "Source",
    findings: [
      {
        id: "concentration",
        q: "How concentrated are federal contract dollars?",
        a: "The top 10 canonical vendors absorb a share of contract value far beyond their count. When one company appears under many spellings, its real weight hides. Resolution brings it into the open.",
        chart: "Top 10 vendors by total contract value",
      },
      {
        id: "ownership",
        q: "How much federal contract money stays in Canada?",
        a: "Of the contract dollars matched to a corporation record, the Canadian-registered share is shown below. The unmatched remainder is labelled unknown, not guessed. That boundary is the honest line in every chart on this page.",
        chart: "Matched contract dollars by registered country of the vendor's corporation",
      },
      {
        id: "funnel",
        q: "How messy were the vendor names?",
        a: "Raw vendor strings collapse through normalization and fuzzy merging into canonical vendors. The funnel shows how much of the apparent vendor count was duplication.",
        chart: "Vendor name resolution funnel",
      },
      {
        id: "trend",
        q: "Is federal contracting growing?",
        a: "Annual contract dollars and record counts from the consolidated file. Spikes line up with published fiscal history; the file is unaudited, so treat totals as reported, not verified.",
        chart: "Contract value and record count by year",
      },
      {
        id: "countries",
        q: "Which countries do departments say the vendors come from?",
        a: "Each contract carries a department-declared vendor country. 74.1% of contract value is declared Canadian, 4.2% American, and 18.5% is left blank. This is self-reported, never verified against a registry, which is why the blank share matters: Buy Canadian compliance cannot be measured on 18.5% of the money.",
        chart: "Contract value by department-declared vendor country",
      },
    ],
    limitNote:
      "Honest limit: the ownership chain stops at the corporation's registered country. Ultimate parent companies require corporate registry data that no Canadian government publishes in bulk. The missing source is named in the methodology.",
  },
  explorer: {
    kicker: "Explorer",
    title: "Search the vendor spine",
    body: "Search canonical vendors by name. Each vendor shows its raw variant count, matched corporation number, contract count, and total value.",
    searchPlaceholder: "Search vendor names",
    resultsFor: "results for",
    noResults: "No vendors match that search.",
    vendor: "Vendor",
    corpNumber: "Corporation number",
    contracts: "Contracts",
    totalValue: "Total value",
    variants: "name variants",
    country: "Country",
    unknown: "unknown",
    loading: "Searching",
  },
  methodology: {
    kicker: "Methodology",
    title: "Every rule, in the open",
    body: "This project answers an ownership question that vendor normalization alone cannot. The novelty boundary matters: vendor-name cleaning is a solved problem here, the ownership layer is what is new.",
    sections: [
      {
        id: "sources",
        title: "Sources",
        body: "Three public sources under the Open Government Licence. Treasury Board's consolidated contracts file (vendor names as entered by 100+ reporting entities). CanadaBuys contract history (bilingual column pairs, schema restructure in March-April 2026). Corporations Canada's Federal Corporations bulk files (split into four subsets in two languages in April 2026, merged back into one table here).",
      },
      {
        id: "normalization",
        title: "Vendor name normalization and entity resolution",
        body: "Names were uppercased, legal suffixes stripped, punctuation removed, whitespace collapsed. Exact dedup on normalized keys came first. Fuzzy merging used union-find at a difflib ratio of 0.93 or higher with an identical first token. Every merge is logged with its ratio and raw variants. Ambiguous merges went to quarantine, never to a guess.",
      },
      {
        id: "canadabuys",
        title: "CanadaBuys schema crosswalk",
        body: "CanadaBuys became the system of record in June 2023, and the 2026 restructure changed column names again. A crosswalk maps legacy columns to current ones, and bilingual column pairs (English-French hyphenated names) were harmonized to single English keys. The crosswalk ships as a CSV.",
      },
      {
        id: "corporations",
        title: "Merged Federal Corporations table",
        body: "Eight files (four subsets, English and French) were merged into one table keyed on corporation number. Active and inactive sets were unioned and deduped so each corporation number appears exactly once. The merged table is the cheap spine that makes vendor-to-registry matching possible.",
      },
      {
        id: "matching",
        title: "Vendor to corporation matching",
        body: "Normalized vendor names were matched exactly against normalized legal names in the merged table. Fuzzy matches were computed separately and labelled as such. The match rate is reported on dollars and on vendors, because one big matched vendor moves the dollar rate.",
      },
      {
        id: "novelty",
        title: "What is new here",
        body: "Vendor normalization for federal contracts already exists and publishes trends. It is not the product. The product is the ownership layer: the merged corporations table, vendor-to-corporation-number resolution, and the repeatable Canadian-versus-foreign share of contract dollars. Nothing published computes that from open data.",
      },
      {
        id: "limits",
        title: "Honest limits",
        body: "The contract data is unaudited and self-reported by departments. Registered country is not ultimate ownership: a Canadian-registered subsidiary of a foreign parent reads as Canadian. No bulk Canadian source publishes ultimate parents, and the project does not invent them. The parent layer is documented as partial with the missing source named.",
      },
      {
        id: "quarantine",
        title: "Quarantine rules",
        body: "Phone-number-like vendor fields, blank vendors, junk amounts, and out-of-range dates were quarantined out of every aggregate. The quarantine report lists each rule with its count and an example row.",
      },
    ],
  },
  data: {
    kicker: "Downloads",
    title: "Take the data",
    body: "Everything computed by this project is downloadable under the Open Government Licence. Source data belongs to the Government of Canada.",
    files: [
      {
        id: "corporations",
        name: "Merged Federal Corporations table",
        desc: "All four subsets in both languages merged into one table keyed on corporation number. The file the government does not publish.",
      },
      {
        id: "vendors",
        name: "Vendor spine",
        desc: "Canonical vendors with variant counts, matched corporation numbers, contract counts, and total values.",
      },
      {
        id: "merges",
        name: "Vendor merge log",
        desc: "Every fuzzy merge with its ratio and raw variants, so any resolution can be audited or reversed.",
      },
      {
        id: "crosswalk",
        name: "CanadaBuys schema crosswalk",
        desc: "Legacy to current column mapping with bilingual pair harmonization.",
      },
      {
        id: "quarantine",
        name: "Quarantine report",
        desc: "Every rule that caught bad rows, with counts and examples.",
      },
      {
        id: "facts",
        name: "Build facts",
        desc: "Machine-readable fact sheet: every headline number with its provenance.",
      },
    ],
    download: "Download CSV",
    downloadJson: "Download JSON",
    license: "Open Government Licence - Canada",
  },
  footer: {
    honesty: "Independent project. Not affiliated with the Government of Canada, the Treasury Board Secretariat, or Public Services and Procurement Canada.",
    author: "Built by Richardson Dackam",
    repo: "Source code",
    dataFixes: "See the data fixes log",
    backTo: "Back to Open Nshipyard",
  },
  mcp: {
    title: "Connect your agent",
    body: "Query the vendor spine from your own agent over MCP. Pick your harness, copy the snippet, paste it in.",
    tabs: ["ChatGPT", "Claude", "CLI", "Other"],
    copy: "Copy",
    copied: "Copied",
    endpoint: "Endpoint",
  },
  common: {
    langName: "Français",
    backHome: "Back to home",
  },
};

export type Dict = typeof en;

const fr: Dict = {
  nav: {
    home: "Accueil",
    explorer: "Explorateur",
    showcase: "Vitrine",
    methodology: "Méthodologie",
    data: "Données",
    brand: "Propriété des fournisseurs fédéraux",
    badge: "Open Nshipyard",
  },
  home: {
    kicker: "Approvisionnement fédéral, propriété résolue",
    title: "À qui appartiennent vraiment les entreprises qui obtiennent des contrats fédéraux ?",
    body: "Les données fédérales sur les contrats indiquent les noms de fournisseurs tels que saisis par plus d'une centaine de bureaux déclarants. La même entreprise apparaît sous plusieurs orthographes, et rien ne relie un fournisseur à son dossier d'entreprise. Ce projet résout les fournisseurs vers leurs numéros d'entreprise de Corporations Canada et mesure ce que les fichiers bruts ne peuvent pas : la concentration des dollars de contrats, la part canadienne contre étrangère, et ce que nous pouvons prouver.",
    ctaExplore: "Explorer les fournisseurs",
    ctaShowcase: "Voir les constats",
    statsTitle: "La colonne vertébrale en chiffres",
    statRecords: "dossiers de contrats analysés",
    statValue: "valeur totale des contrats",
    statVendors: "fournisseurs canoniques résolus",
    statMerges: "fusions floues journalisées",
    statCorps: "sociétés dans le registre fusionné",
    statMatched: "des dollars de contrats appariés à une société",
    ownershipKicker: "La question à laquelle personne ne répond avec des données",
    ownershipTitle: "La normalisation des fournisseurs existe. La propriété, non.",
    ownershipBody:
      "Un répertoire fédéral normalise déjà les noms de fournisseurs. Cela dit qui a été payé. Cela ne dit pas à qui appartient le fournisseur, si l'argent est resté au Canada, ni combien de dollars vont à une même famille d'entreprises. Le cadre d'approvisionnement canadien est entré en vigueur le 16 décembre 2025, et le vérificateur général a retracé des réseaux d'entreprises à la main pour auditer un dossier de consultation. Ce projet construit la base de preuves reproductible : fournisseur vers numéro d'entreprise, société vers pays d'enregistrement, dollars vers propriétaires.",
    showcaseKicker: "De la vitrine",
    methodKicker: "Comment c'est construit",
    methodTitle: "Cinq réparations avant le premier graphique",
    methodBody:
      "Les noms de fournisseurs ont été normalisés dans plus de 100 entités déclarantes, les fusions floues ont été résolues à un seuil documenté, la rupture de schéma de CanadaBuys de juin 2023 a été franchie avec une table de correspondance, les quatre fichiers scindés de Corporations Canada ont été fusionnés en une table indexée sur le numéro d'entreprise, et les lignes ambiguës ont été mises en quarantaine plutôt que devinées. Chaque fusion est journalisée. Chaque règle est dans la méthodologie.",
    ctaData: "Télécharger les données",
  },
  showcase: {
    kicker: "Histoires de données",
    title: "Ce que révèle la colonne de propriété",
    body: "Chaque constat ci-dessous est calculé à partir de la colonne des fournisseurs et de la table fusionnée des sociétés. Chaque graphique peut être cité : utilisez le bouton de copie sous chaque constat.",
    cite: "Citer",
    copied: "Copié",
    source: "Source",
    findings: [
      {
        id: "concentration",
        q: "Quelle est la concentration des dollars de contrats fédéraux ?",
        a: "Les 10 premiers fournisseurs canoniques absorbent une part de la valeur des contrats bien au-delà de leur nombre. Quand une entreprise apparaît sous plusieurs orthographes, son poids réel se cache. La résolution le révèle.",
        chart: "10 premiers fournisseurs par valeur totale des contrats",
      },
      {
        id: "ownership",
        q: "Quelle part de l'argent des contrats fédéraux reste au Canada ?",
        a: "Des dollars de contrats appariés à un dossier de société, la part enregistrée au Canada est indiquée ci-dessous. Le reste non apparié est étiqueté inconnu, jamais deviné. Cette limite est la ligne honnête de chaque graphique de cette page.",
        chart: "Dollars de contrats appariés par pays d'enregistrement de la société du fournisseur",
      },
      {
        id: "funnel",
        q: "À quel point les noms de fournisseurs étaient-ils désordonnés ?",
        a: "Les chaînes brutes de fournisseurs se réduisent par normalisation et fusion floue en fournisseurs canoniques. L'entonnoir montre combien du nombre apparent de fournisseurs était de la duplication.",
        chart: "Entonnoir de résolution des noms de fournisseurs",
      },
      {
        id: "trend",
        q: "Les contrats fédéraux sont-ils en croissance ?",
        a: "Dollars annuels de contrats et nombre de dossiers du fichier consolidé. Les pics correspondent à l'histoire fiscale publiée. Le fichier n'est pas audité, les totaux sont donc déclarés, non vérifiés.",
        chart: "Valeur des contrats et nombre de dossiers par année",
      },
      {
        id: "countries",
        q: "Quels pays les ministères déclarent-ils pour les fournisseurs ?",
        a: "Chaque contrat porte un pays de fournisseur déclaré par le ministère. 74,1 % de la valeur des contrats est déclarée canadienne, 4,2 % américaine, et 18,5 % est laissée vide. C'est autodéclaré, jamais vérifié contre un registre, et c'est pourquoi la part vide compte : la conformité à l'achat canadien ne peut pas être mesurée sur 18,5 % de l'argent.",
        chart: "Valeur des contrats par pays de fournisseur déclaré par le ministère",
      },
    ],
    limitNote:
      "Limite honnête : la chaîne de propriété s'arrête au pays d'enregistrement de la société. Les sociétés mères ultimes exigent des données de registre qu'aucun gouvernement canadien ne publie en vrac. La source manquante est nommée dans la méthodologie.",
  },
  explorer: {
    kicker: "Explorateur",
    title: "Chercher dans la colonne des fournisseurs",
    body: "Cherchez des fournisseurs canoniques par nom. Chaque fournisseur affiche son nombre de variantes brutes, son numéro d'entreprise apparié, son nombre de contrats et sa valeur totale.",
    searchPlaceholder: "Rechercher des noms de fournisseurs",
    resultsFor: "résultats pour",
    noResults: "Aucun fournisseur ne correspond à cette recherche.",
    vendor: "Fournisseur",
    corpNumber: "Numéro d'entreprise",
    contracts: "Contrats",
    totalValue: "Valeur totale",
    variants: "variantes de nom",
    country: "Pays",
    unknown: "inconnu",
    loading: "Recherche en cours",
  },
  methodology: {
    kicker: "Méthodologie",
    title: "Chaque règle, en public",
    body: "Ce projet répond à une question de propriété que la seule normalisation des fournisseurs ne peut pas traiter. La limite de nouveauté compte : le nettoyage des noms de fournisseurs est un problème résolu ici, la couche de propriété est ce qui est nouveau.",
    sections: [
      {
        id: "sources",
        title: "Sources",
        body: "Trois sources publiques sous la Licence du gouvernement ouvert. Le fichier consolidé des contrats du Conseil du Trésor (noms de fournisseurs saisis par plus de 100 entités déclarantes). L'historique des contrats de CanadaBuys (paires de colonnes bilingues, restructuration du schéma en mars-avril 2026). Les fichiers en vrac des sociétés fédérales de Corporations Canada (scindés en quatre sous-ensembles en deux langues en avril 2026, fusionnés ici en une table).",
      },
      {
        id: "normalization",
        title: "Normalisation des noms et résolution d'entités",
        body: "Les noms ont été mis en majuscules, les suffixes juridiques retirés, la ponctuation supprimée, les espaces réduits. La déduplication exacte sur les clés normalisées est venue en premier. La fusion floue a utilisé union-find à un ratio difflib de 0,93 ou plus avec un premier jeton identique. Chaque fusion est journalisée avec son ratio et ses variantes brutes. Les fusions ambiguës sont allées en quarantaine, jamais devinées.",
      },
      {
        id: "canadabuys",
        title: "Table de correspondance du schéma CanadaBuys",
        body: "CanadaBuys est devenu le système de référence en juin 2023, et la restructuration de 2026 a encore changé les noms de colonnes. Une table de correspondance relie les colonnes historiques aux colonnes actuelles, et les paires de colonnes bilingues (noms anglais-français séparés par un trait d'union) ont été harmonisées en clés anglaises uniques. La table est livrée en CSV.",
      },
      {
        id: "corporations",
        title: "Table fusionnée des sociétés fédérales",
        body: "Huit fichiers (quatre sous-ensembles, anglais et français) ont été fusionnés en une table indexée sur le numéro d'entreprise. Les ensembles actifs et inactifs ont été unis et dédupliqués pour que chaque numéro d'entreprise apparaisse exactement une fois. La table fusionnée est la colonne bon marché qui rend possible l'appariement fournisseur-registre.",
      },
      {
        id: "matching",
        title: "Appariement fournisseur vers société",
        body: "Les noms de fournisseurs normalisés ont été appariés exactement aux dénominations sociales normalisées de la table fusionnée. Les appariements flous ont été calculés séparément et étiquetés comme tels. Le taux d'appariement est déclaré en dollars et en fournisseurs, car un gros fournisseur apparié déplace le taux en dollars.",
      },
      {
        id: "novelty",
        title: "Ce qui est nouveau ici",
        body: "La normalisation des noms de fournisseurs pour les contrats fédéraux existe déjà et publie des tendances. Ce n'est pas le produit. Le produit est la couche de propriété : la table fusionnée des sociétés, la résolution fournisseur vers numéro d'entreprise, et la part canadienne contre étrangère reproductible des dollars de contrats. Rien de publié ne calcule cela à partir de données ouvertes.",
      },
      {
        id: "limits",
        title: "Limites honnêtes",
        body: "Les données de contrats ne sont pas auditées et sont autodéclarées par les ministères. Le pays d'enregistrement n'est pas la propriété ultime : une filiale canadienne d'une société mère étrangère apparaît comme canadienne. Aucune source canadienne en vrac ne publie les sociétés mères ultimes, et le projet ne les invente pas. La couche parente est documentée comme partielle avec la source manquante nommée.",
      },
      {
        id: "quarantine",
        title: "Règles de quarantaine",
        body: "Les champs fournisseurs ressemblant à des numéros de téléphone, les fournisseurs vides, les montants aberrants et les dates hors plage ont été exclus de tous les agrégats. Le rapport de quarantaine liste chaque règle avec son nombre et un exemple de ligne.",
      },
    ],
  },
  data: {
    kicker: "Téléchargements",
    title: "Prenez les données",
    body: "Tout ce que ce projet a calculé est téléchargeable sous la Licence du gouvernement ouvert. Les données sources appartiennent au gouvernement du Canada.",
    files: [
      {
        id: "corporations",
        name: "Table fusionnée des sociétés fédérales",
        desc: "Les quatre sous-ensembles dans les deux langues fusionnés en une table indexée sur le numéro d'entreprise. Le fichier que le gouvernement ne publie pas.",
      },
      {
        id: "vendors",
        name: "Colonne des fournisseurs",
        desc: "Fournisseurs canoniques avec nombres de variantes, numéros d'entreprise appariés, nombres de contrats et valeurs totales.",
      },
      {
        id: "merges",
        name: "Journal des fusions de fournisseurs",
        desc: "Chaque fusion floue avec son ratio et ses variantes brutes, pour auditer ou annuler toute résolution.",
      },
      {
        id: "crosswalk",
        name: "Table de correspondance du schéma CanadaBuys",
        desc: "Correspondance des colonnes historiques vers actuelles avec harmonisation des paires bilingues.",
      },
      {
        id: "quarantine",
        name: "Rapport de quarantaine",
        desc: "Chaque règle qui a attrapé de mauvaises lignes, avec nombres et exemples.",
      },
      {
        id: "facts",
        name: "Fiche de faits de construction",
        desc: "Fiche lisible par machine : chaque chiffre clé avec sa provenance.",
      },
    ],
    download: "Télécharger CSV",
    downloadJson: "Télécharger JSON",
    license: "Licence du gouvernement ouvert - Canada",
  },
  footer: {
    honesty: "Projet indépendant. Non affilié au gouvernement du Canada, au Secrétariat du Conseil du Trésor ni à Services publics et Approvisionnement Canada.",
    author: "Conçu par Richardson Dackam",
    repo: "Code source",
    dataFixes: "Voir le journal des corrections de données",
    backTo: "Retour à Open Nshipyard",
  },
  mcp: {
    title: "Connectez votre agent",
    body: "Interrogez la colonne des fournisseurs depuis votre propre agent via MCP. Choisissez votre harnais, copiez l'extrait, collez-le.",
    tabs: ["ChatGPT", "Claude", "CLI", "Autre"],
    copy: "Copier",
    copied: "Copié",
    endpoint: "Point de terminaison",
  },
  common: {
    langName: "English",
    backHome: "Retour à l'accueil",
  },
};

const dict: Record<Lang, Dict> = { en, fr };

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  return <LangContext.Provider value={{ lang, setLang, t: dict[lang] }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
