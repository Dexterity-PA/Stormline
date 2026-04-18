import type { IndicatorDefinition } from "./types";

/**
 * Master indicator registry. Each entry maps a free/public data-source series
 * to a Stormline indicator used in briefings, dashboards, and alerts.
 *
 * Canonical code is `<SOURCE>:<SOURCE_ID>` (uppercased source). The code is
 * stable and is what gets persisted in indicators.code.
 *
 * FRED series IDs below are the real St. Louis Fed identifiers — they can be
 * looked up at https://fred.stlouisfed.org/series/<SOURCE_ID>.
 */
export const INDICATOR_REGISTRY: readonly IndicatorDefinition[] = [
  // ────────────────────────────────────────────────────────────────────────
  // Cross-industry macro (interest rates, credit, currency, fuel)
  // ────────────────────────────────────────────────────────────────────────
  {
    code: "FRED:DFF",
    source: "fred",
    sourceId: "DFF",
    name: "Federal Funds Effective Rate",
    unit: "%",
    industryTags: ["restaurant", "construction", "retail"],
    costBucket: "interest_rates",
    frequency: "daily",
  },
  {
    code: "FRED:DGS10",
    source: "fred",
    sourceId: "DGS10",
    name: "10-Year Treasury Constant Maturity Rate",
    unit: "%",
    industryTags: ["restaurant", "construction", "retail"],
    costBucket: "interest_rates",
    frequency: "daily",
  },
  {
    code: "FRED:BAMLH0A0HYM2",
    source: "fred",
    sourceId: "BAMLH0A0HYM2",
    name: "ICE BofA US High Yield Index Option-Adjusted Spread",
    unit: "%",
    industryTags: ["restaurant", "construction", "retail"],
    costBucket: "credit",
    frequency: "daily",
  },
  {
    code: "FRED:DTWEXBGS",
    source: "fred",
    sourceId: "DTWEXBGS",
    name: "Nominal Broad US Dollar Index",
    unit: "index",
    industryTags: ["restaurant", "retail"],
    costBucket: "currency",
    frequency: "daily",
  },
  {
    code: "FRED:GASREGW",
    source: "fred",
    sourceId: "GASREGW",
    name: "US Regular All Formulations Gas Price",
    unit: "USD/gal",
    industryTags: ["restaurant", "construction", "retail"],
    costBucket: "fuel",
    frequency: "weekly",
  },
  {
    code: "FRED:CPIAUCSL",
    source: "fred",
    sourceId: "CPIAUCSL",
    name: "CPI All Urban Consumers",
    unit: "index",
    industryTags: ["restaurant", "construction", "retail"],
    costBucket: "inflation",
    frequency: "monthly",
  },

  // ────────────────────────────────────────────────────────────────────────
  // Restaurants — food commodities, wages, energy
  // ────────────────────────────────────────────────────────────────────────
  {
    code: "FRED:PBEEFUSDM",
    source: "fred",
    sourceId: "PBEEFUSDM",
    name: "Global Price of Beef",
    unit: "USD/lb",
    industryTags: ["restaurant"],
    costBucket: "beef",
    frequency: "monthly",
  },
  {
    code: "FRED:PPOULTUSDM",
    source: "fred",
    sourceId: "PPOULTUSDM",
    name: "Global Price of Poultry",
    unit: "USD/lb",
    industryTags: ["restaurant"],
    costBucket: "poultry",
    frequency: "monthly",
  },
  {
    code: "FRED:PCOFFOTMUSDM",
    source: "fred",
    sourceId: "PCOFFOTMUSDM",
    name: "Global Price of Coffee, Other Mild Arabicas",
    unit: "USD/lb",
    industryTags: ["restaurant"],
    costBucket: "coffee",
    frequency: "monthly",
  },
  {
    code: "FRED:PWHEAMTUSDM",
    source: "fred",
    sourceId: "PWHEAMTUSDM",
    name: "Global Price of Wheat",
    unit: "USD/mt",
    industryTags: ["restaurant"],
    costBucket: "grain",
    frequency: "monthly",
  },
  {
    code: "FRED:DHHNGSP",
    source: "fred",
    sourceId: "DHHNGSP",
    name: "Henry Hub Natural Gas Spot Price",
    unit: "USD/MMBtu",
    industryTags: ["restaurant"],
    costBucket: "energy",
    frequency: "daily",
  },
  {
    code: "FRED:CES7072200001",
    source: "fred",
    sourceId: "CES7072200001",
    name: "All Employees: Food Services and Drinking Places",
    unit: "thousands of persons",
    industryTags: ["restaurant"],
    costBucket: "labor",
    frequency: "monthly",
  },
  {
    code: "FRED:CES7000000008",
    source: "fred",
    sourceId: "CES7000000008",
    name: "Average Hourly Earnings of Production and Nonsupervisory Employees: Leisure and Hospitality",
    unit: "USD/hour",
    industryTags: ["restaurant"],
    costBucket: "labor",
    frequency: "monthly",
  },
  {
    code: "FRED:CUSR0000SEFV",
    source: "fred",
    sourceId: "CUSR0000SEFV",
    name: "CPI: Food Away From Home",
    unit: "index",
    industryTags: ["restaurant"],
    costBucket: "menu_pricing",
    frequency: "monthly",
  },

  // ────────────────────────────────────────────────────────────────────────
  // Construction — materials, housing, wages, financing
  // ────────────────────────────────────────────────────────────────────────
  {
    code: "FRED:WPU081",
    source: "fred",
    sourceId: "WPU081",
    name: "PPI by Commodity: Lumber and Wood Products: Lumber",
    unit: "index",
    industryTags: ["construction"],
    costBucket: "lumber",
    frequency: "monthly",
  },
  {
    code: "FRED:WPU1017",
    source: "fred",
    sourceId: "WPU1017",
    name: "PPI by Commodity: Metals: Steel Mill Products",
    unit: "index",
    industryTags: ["construction"],
    costBucket: "steel",
    frequency: "monthly",
  },
  {
    code: "FRED:PCOPPUSDM",
    source: "fred",
    sourceId: "PCOPPUSDM",
    name: "Global Price of Copper",
    unit: "USD/mt",
    industryTags: ["construction"],
    costBucket: "copper",
    frequency: "monthly",
  },
  {
    code: "FRED:HOUST",
    source: "fred",
    sourceId: "HOUST",
    name: "Housing Starts: Total",
    unit: "thousands of units (SAAR)",
    industryTags: ["construction"],
    costBucket: "demand",
    frequency: "monthly",
  },
  {
    code: "FRED:PERMIT",
    source: "fred",
    sourceId: "PERMIT",
    name: "New Privately-Owned Housing Units Authorized by Building Permits",
    unit: "thousands of units (SAAR)",
    industryTags: ["construction"],
    costBucket: "demand",
    frequency: "monthly",
  },
  {
    code: "FRED:MORTGAGE30US",
    source: "fred",
    sourceId: "MORTGAGE30US",
    name: "30-Year Fixed Rate Mortgage Average",
    unit: "%",
    industryTags: ["construction"],
    costBucket: "financing",
    frequency: "weekly",
  },
  {
    code: "FRED:CES2000000008",
    source: "fred",
    sourceId: "CES2000000008",
    name: "Average Hourly Earnings: Construction",
    unit: "USD/hour",
    industryTags: ["construction"],
    costBucket: "labor",
    frequency: "monthly",
  },
  {
    code: "FRED:TTLCONS",
    source: "fred",
    sourceId: "TTLCONS",
    name: "Total Construction Spending",
    unit: "USD millions (SAAR)",
    industryTags: ["construction"],
    costBucket: "demand",
    frequency: "monthly",
  },

  // ────────────────────────────────────────────────────────────────────────
  // Retail — demand, consumer health, input costs
  // ────────────────────────────────────────────────────────────────────────
  {
    code: "FRED:RSAFS",
    source: "fred",
    sourceId: "RSAFS",
    name: "Advance Retail Sales: Retail and Food Services",
    unit: "USD millions",
    industryTags: ["retail"],
    costBucket: "demand",
    frequency: "monthly",
  },
  {
    code: "FRED:UMCSENT",
    source: "fred",
    sourceId: "UMCSENT",
    name: "University of Michigan: Consumer Sentiment",
    unit: "index",
    industryTags: ["retail"],
    costBucket: "demand",
    frequency: "monthly",
  },
  {
    code: "FRED:PSAVERT",
    source: "fred",
    sourceId: "PSAVERT",
    name: "Personal Saving Rate",
    unit: "%",
    industryTags: ["retail"],
    costBucket: "demand",
    frequency: "monthly",
  },
  {
    code: "FRED:DSPIC96",
    source: "fred",
    sourceId: "DSPIC96",
    name: "Real Disposable Personal Income",
    unit: "USD billions (chained)",
    industryTags: ["retail"],
    costBucket: "demand",
    frequency: "monthly",
  },
  {
    code: "FRED:PAYEMS",
    source: "fred",
    sourceId: "PAYEMS",
    name: "All Employees, Total Nonfarm",
    unit: "thousands of persons",
    industryTags: ["retail"],
    costBucket: "labor",
    frequency: "monthly",
  },
  {
    code: "FRED:UNRATE",
    source: "fred",
    sourceId: "UNRATE",
    name: "Unemployment Rate",
    unit: "%",
    industryTags: ["retail"],
    costBucket: "labor",
    frequency: "monthly",
  },
  {
    code: "FRED:TOTALSL",
    source: "fred",
    sourceId: "TOTALSL",
    name: "Total Consumer Credit Owned and Securitized",
    unit: "USD billions",
    industryTags: ["retail"],
    costBucket: "consumer_credit",
    frequency: "monthly",
  },
  {
    code: "FRED:PCOTTINDUSDM",
    source: "fred",
    sourceId: "PCOTTINDUSDM",
    name: "Global Price of Cotton",
    unit: "USD cents/lb",
    industryTags: ["retail"],
    costBucket: "cotton",
    frequency: "monthly",
  },
];

const byCode = new Map(INDICATOR_REGISTRY.map((def) => [def.code, def]));

export function getIndicator(code: string): IndicatorDefinition | undefined {
  return byCode.get(code);
}

export function listIndicatorsByIndustry(
  industry: IndicatorDefinition["industryTags"][number],
): IndicatorDefinition[] {
  return INDICATOR_REGISTRY.filter((def) =>
    def.industryTags.includes(industry),
  );
}

export function listIndicatorsBySource(
  source: IndicatorDefinition["source"],
): IndicatorDefinition[] {
  return INDICATOR_REGISTRY.filter((def) => def.source === source);
}
