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
  // Restaurants — extended P1
  // Food inputs (proteins / dairy / grains / produce / oils / beverages),
  // labor, energy, real estate, consumer demand, credit, macro.
  // All FRED/EIA IDs verified via API probe. USDA NASS additions deferred
  // until adapter outage resolves (would add dead rows today).
  // ────────────────────────────────────────────────────────────────────────

  // --- Food inputs: Proteins — Beef ---
  { code: "FRED:WPU0111", source: "fred", sourceId: "WPU0111", name: "PPI: Slaughter Cattle", unit: "index", industryTags: ["restaurant"], costBucket: "beef", frequency: "monthly" },
  { code: "FRED:WPU0212", source: "fred", sourceId: "WPU0212", name: "PPI: Processed Meats", unit: "index", industryTags: ["restaurant"], costBucket: "beef", frequency: "monthly" },
  { code: "FRED:WPU02", source: "fred", sourceId: "WPU02", name: "PPI: Processed Foods & Feeds", unit: "index", industryTags: ["restaurant"], costBucket: "inflation", frequency: "monthly" },
  { code: "FRED:CUSR0000SAF112", source: "fred", sourceId: "CUSR0000SAF112", name: "CPI: Meats", unit: "index", industryTags: ["restaurant"], costBucket: "beef", frequency: "monthly" },
  { code: "FRED:APU0000708111", source: "fred", sourceId: "APU0000708111", name: "Avg Retail: Ground Chuck, 100% Beef, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "beef", frequency: "monthly" },

  // --- Food inputs: Proteins — Poultry & Eggs ---
  { code: "FRED:WPU0213", source: "fred", sourceId: "WPU0213", name: "PPI: Processed Poultry", unit: "index", industryTags: ["restaurant"], costBucket: "poultry", frequency: "monthly" },
  { code: "FRED:WPU0221", source: "fred", sourceId: "WPU0221", name: "PPI: Processed Eggs & Egg Products", unit: "index", industryTags: ["restaurant"], costBucket: "eggs", frequency: "monthly" },
  { code: "FRED:PCU311615311615", source: "fred", sourceId: "PCU311615311615", name: "PPI: Poultry Processing (NAICS 311615)", unit: "index", industryTags: ["restaurant"], costBucket: "poultry", frequency: "monthly" },
  { code: "FRED:CUSR0000SAF113", source: "fred", sourceId: "CUSR0000SAF113", name: "CPI: Poultry", unit: "index", industryTags: ["restaurant"], costBucket: "poultry", frequency: "monthly" },
  { code: "FRED:CUSR0000SAF115", source: "fred", sourceId: "CUSR0000SAF115", name: "CPI: Eggs", unit: "index", industryTags: ["restaurant"], costBucket: "eggs", frequency: "monthly" },
  { code: "FRED:APU000074714", source: "fred", sourceId: "APU000074714", name: "Avg Retail: Chicken, Fresh, Whole, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "poultry", frequency: "monthly" },
  { code: "FRED:APU000074715", source: "fred", sourceId: "APU000074715", name: "Avg Retail: Chicken Breast, Bone-In, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "poultry", frequency: "monthly" },
  { code: "FRED:APU00007471A", source: "fred", sourceId: "APU00007471A", name: "Avg Retail: Chicken Legs, Bone-In, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "poultry", frequency: "monthly" },
  { code: "FRED:APU0000FF1101", source: "fred", sourceId: "APU0000FF1101", name: "Avg Retail: Chicken Breast, Boneless, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "poultry", frequency: "monthly" },
  { code: "FRED:APU0000FS1101", source: "fred", sourceId: "APU0000FS1101", name: "Avg Retail: Eggs, Grade A, Large, per dozen", unit: "USD/dozen", industryTags: ["restaurant"], costBucket: "eggs", frequency: "monthly" },

  // --- Food inputs: Proteins — Pork ---
  { code: "FRED:WPU0113", source: "fred", sourceId: "WPU0113", name: "PPI: Slaughter Hogs", unit: "index", industryTags: ["restaurant"], costBucket: "pork", frequency: "monthly" },
  { code: "FRED:APU0000710211", source: "fred", sourceId: "APU0000710211", name: "Avg Retail: Bacon, Sliced, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "pork", frequency: "monthly" },

  // --- Food inputs: Proteins — Fish & Seafood ---
  { code: "FRED:PFISHUSDM", source: "fred", sourceId: "PFISHUSDM", name: "Global Price of Fish", unit: "USD/mt", industryTags: ["restaurant"], costBucket: "fish", frequency: "monthly" },
  { code: "FRED:PSALMUSDM", source: "fred", sourceId: "PSALMUSDM", name: "Global Price of Fish (Salmon)", unit: "USD/kg", industryTags: ["restaurant"], costBucket: "fish", frequency: "monthly" },
  { code: "FRED:CUSR0000SAF114", source: "fred", sourceId: "CUSR0000SAF114", name: "CPI: Fish & Seafood", unit: "index", industryTags: ["restaurant"], costBucket: "fish", frequency: "monthly" },

  // --- Food inputs: Dairy ---
  { code: "FRED:APU0000709112", source: "fred", sourceId: "APU0000709112", name: "Avg Retail: Cheese, American, Processed, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "dairy", frequency: "monthly" },
  { code: "FRED:APU0000709212", source: "fred", sourceId: "APU0000709212", name: "Avg Retail: Cheese, Cheddar, Natural, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "dairy", frequency: "monthly" },
  { code: "FRED:APU0000710111", source: "fred", sourceId: "APU0000710111", name: "Avg Retail: Milk, Fresh, Whole, per gallon", unit: "USD/gal", industryTags: ["restaurant"], costBucket: "dairy", frequency: "monthly" },
  { code: "FRED:APU0000712311", source: "fred", sourceId: "APU0000712311", name: "Avg Retail: Butter, Salted, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "dairy", frequency: "monthly" },
  { code: "FRED:APU0000FJ4101", source: "fred", sourceId: "APU0000FJ4101", name: "Avg Retail: Milk, Fresh, Low Fat, per gallon", unit: "USD/gal", industryTags: ["restaurant"], costBucket: "dairy", frequency: "monthly" },
  { code: "FRED:CUSR0000SAF116", source: "fred", sourceId: "CUSR0000SAF116", name: "CPI: Dairy & Related Products", unit: "index", industryTags: ["restaurant"], costBucket: "dairy", frequency: "monthly" },
  { code: "FRED:PCU311513311513", source: "fred", sourceId: "PCU311513311513", name: "PPI: Cheese Manufacturing (NAICS 311513)", unit: "index", industryTags: ["restaurant"], costBucket: "dairy", frequency: "monthly" },

  // --- Food inputs: Grains & Bakery ---
  { code: "FRED:PMAIZMTUSDM", source: "fred", sourceId: "PMAIZMTUSDM", name: "Global Price of Corn", unit: "USD/mt", industryTags: ["restaurant"], costBucket: "grain", frequency: "monthly" },
  { code: "FRED:PRICENPQUSDM", source: "fred", sourceId: "PRICENPQUSDM", name: "Global Price of Rice, Thailand", unit: "USD/mt", industryTags: ["restaurant"], costBucket: "grain", frequency: "monthly" },
  { code: "FRED:WPU012", source: "fred", sourceId: "WPU012", name: "PPI: Processed Foods & Feeds — Cereal & Bakery", unit: "index", industryTags: ["restaurant"], costBucket: "bakery", frequency: "monthly" },
  { code: "FRED:WPU0121", source: "fred", sourceId: "WPU0121", name: "PPI: Cereal & Bakery Products", unit: "index", industryTags: ["restaurant"], costBucket: "bakery", frequency: "monthly" },
  { code: "FRED:WPU0211", source: "fred", sourceId: "WPU0211", name: "PPI: Flour & Milling Products", unit: "index", industryTags: ["restaurant"], costBucket: "bakery", frequency: "monthly" },
  { code: "FRED:PCU311811311811", source: "fred", sourceId: "PCU311811311811", name: "PPI: Retail Bakeries (NAICS 311811)", unit: "index", industryTags: ["restaurant"], costBucket: "bakery", frequency: "monthly" },
  { code: "FRED:CUSR0000SAF111", source: "fred", sourceId: "CUSR0000SAF111", name: "CPI: Cereals & Bakery Products", unit: "index", industryTags: ["restaurant"], costBucket: "bakery", frequency: "monthly" },
  { code: "FRED:APU0000701111", source: "fred", sourceId: "APU0000701111", name: "Avg Retail: Bread, White, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "bakery", frequency: "monthly" },
  { code: "FRED:APU0000702111", source: "fred", sourceId: "APU0000702111", name: "Avg Retail: Flour, White, All Purpose, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "bakery", frequency: "monthly" },
  { code: "FRED:APU0000703111", source: "fred", sourceId: "APU0000703111", name: "Avg Retail: Rice, White, Long Grain, Precooked, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "grain", frequency: "monthly" },
  { code: "FRED:APU0000703112", source: "fred", sourceId: "APU0000703112", name: "Avg Retail: Rice, White, Long Grain, Uncooked, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "grain", frequency: "monthly" },
  { code: "FRED:APU0000703211", source: "fred", sourceId: "APU0000703211", name: "Avg Retail: Spaghetti & Macaroni, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "grain", frequency: "monthly" },

  // --- Food inputs: Produce (fresh fruits & vegetables) ---
  { code: "FRED:PORANGUSDM", source: "fred", sourceId: "PORANGUSDM", name: "Global Price of Oranges", unit: "USD/mt", industryTags: ["restaurant"], costBucket: "produce", frequency: "monthly" },
  { code: "FRED:PBANSOPUSDM", source: "fred", sourceId: "PBANSOPUSDM", name: "Global Price of Bananas", unit: "USD/mt", industryTags: ["restaurant"], costBucket: "produce", frequency: "monthly" },
  { code: "FRED:WPU0131", source: "fred", sourceId: "WPU0131", name: "PPI: Fresh Fruits & Melons", unit: "index", industryTags: ["restaurant"], costBucket: "produce", frequency: "monthly" },
  { code: "FRED:WPU0132", source: "fred", sourceId: "WPU0132", name: "PPI: Fresh & Dry Vegetables", unit: "index", industryTags: ["restaurant"], costBucket: "produce", frequency: "monthly" },
  { code: "FRED:WPU014", source: "fred", sourceId: "WPU014", name: "PPI: Processed Fruits & Vegetables", unit: "index", industryTags: ["restaurant"], costBucket: "produce", frequency: "monthly" },
  { code: "FRED:PCU311411311411", source: "fred", sourceId: "PCU311411311411", name: "PPI: Frozen Fruit, Juice & Vegetable Mfg (NAICS 311411)", unit: "index", industryTags: ["restaurant"], costBucket: "produce", frequency: "monthly" },
  { code: "FRED:PCU311421311421", source: "fred", sourceId: "PCU311421311421", name: "PPI: Fruit & Vegetable Canning (NAICS 311421)", unit: "index", industryTags: ["restaurant"], costBucket: "produce", frequency: "monthly" },
  { code: "FRED:APU0000706111", source: "fred", sourceId: "APU0000706111", name: "Avg Retail: Potatoes, White, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "produce", frequency: "monthly" },
  { code: "FRED:APU0000711111", source: "fred", sourceId: "APU0000711111", name: "Avg Retail: Tomatoes, Field Grown, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "produce", frequency: "monthly" },
  { code: "FRED:APU0000711211", source: "fred", sourceId: "APU0000711211", name: "Avg Retail: Oranges, Navel, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "produce", frequency: "monthly" },
  { code: "FRED:APU0000711311", source: "fred", sourceId: "APU0000711311", name: "Avg Retail: Lettuce, Iceberg, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "produce", frequency: "monthly" },
  { code: "FRED:APU0000711411", source: "fred", sourceId: "APU0000711411", name: "Avg Retail: Broccoli, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "produce", frequency: "monthly" },
  { code: "FRED:WPU013", source: "fred", sourceId: "WPU013", name: "PPI: Fruits & Vegetables (composite)", unit: "index", industryTags: ["restaurant"], costBucket: "produce", frequency: "monthly" },

  // --- Food inputs: Oils, Fats, Sugar ---
  { code: "FRED:PSMEAUSDM", source: "fred", sourceId: "PSMEAUSDM", name: "Global Price of Soybean Meal", unit: "USD/mt", industryTags: ["restaurant"], costBucket: "oils", frequency: "monthly" },
  { code: "FRED:PSUGAISAUSDM", source: "fred", sourceId: "PSUGAISAUSDM", name: "Global Price of Sugar, ISA", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "sugar", frequency: "monthly" },
  { code: "FRED:PSUGAUSAUSDM", source: "fred", sourceId: "PSUGAUSAUSDM", name: "Global Price of Sugar, US", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "sugar", frequency: "monthly" },
  { code: "FRED:WPU026", source: "fred", sourceId: "WPU026", name: "PPI: Fats & Oils", unit: "index", industryTags: ["restaurant"], costBucket: "oils", frequency: "monthly" },
  { code: "FRED:WPU024", source: "fred", sourceId: "WPU024", name: "PPI: Sugar & Confectionery", unit: "index", industryTags: ["restaurant"], costBucket: "sugar", frequency: "monthly" },
  { code: "FRED:PCU311230311230", source: "fred", sourceId: "PCU311230311230", name: "PPI: Breakfast Cereal Manufacturing (NAICS 311230)", unit: "index", industryTags: ["restaurant"], costBucket: "bakery", frequency: "monthly" },
  { code: "FRED:APU0000712112", source: "fred", sourceId: "APU0000712112", name: "Avg Retail: Sugar, White, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "sugar", frequency: "monthly" },

  // --- Food inputs: Beverages (coffee / tea / cocoa / alcohol) ---
  { code: "FRED:PCOFFROBUSDM", source: "fred", sourceId: "PCOFFROBUSDM", name: "Global Price of Coffee, Robusta", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "coffee", frequency: "monthly" },
  { code: "FRED:PCOCOUSDM", source: "fred", sourceId: "PCOCOUSDM", name: "Global Price of Cocoa", unit: "USD/mt", industryTags: ["restaurant"], costBucket: "beverages", frequency: "monthly" },
  { code: "FRED:PTEAUSDM", source: "fred", sourceId: "PTEAUSDM", name: "Global Price of Tea", unit: "USD/kg", industryTags: ["restaurant"], costBucket: "beverages", frequency: "monthly" },
  { code: "FRED:WPU028", source: "fred", sourceId: "WPU028", name: "PPI: Beverages & Beverage Materials", unit: "index", industryTags: ["restaurant"], costBucket: "beverages", frequency: "monthly" },
  { code: "FRED:WPU029", source: "fred", sourceId: "WPU029", name: "PPI: Miscellaneous Processed Foods", unit: "index", industryTags: ["restaurant"], costBucket: "inflation", frequency: "monthly" },
  { code: "FRED:APU0000717311", source: "fred", sourceId: "APU0000717311", name: "Avg Retail: Coffee, 100%, Ground Roast, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "coffee", frequency: "monthly" },
  { code: "FRED:APU0000717312", source: "fred", sourceId: "APU0000717312", name: "Avg Retail: Coffee, Instant, per 16 oz", unit: "USD/16oz", industryTags: ["restaurant"], costBucket: "coffee", frequency: "monthly" },
  { code: "FRED:APU0000FL2101", source: "fred", sourceId: "APU0000FL2101", name: "Avg Retail: Coffee, 100%, Ground Roast, All Sizes, per lb", unit: "USD/lb", industryTags: ["restaurant"], costBucket: "coffee", frequency: "monthly" },
  { code: "FRED:APU000072610", source: "fred", sourceId: "APU000072610", name: "Avg Retail: Malt Beverages Incl Beer & Ale, per 16 oz", unit: "USD/16oz", industryTags: ["restaurant"], costBucket: "beverages", frequency: "monthly" },
  { code: "FRED:APU000072611", source: "fred", sourceId: "APU000072611", name: "Avg Retail: Beer, Ale & Other Malt Beverages, 16 oz", unit: "USD/16oz", industryTags: ["restaurant"], costBucket: "beverages", frequency: "monthly" },
  { code: "FRED:CUSR0000SEFW", source: "fred", sourceId: "CUSR0000SEFW", name: "CPI: Alcoholic Beverages Away From Home", unit: "index", industryTags: ["restaurant"], costBucket: "beverages", frequency: "monthly" },

  // --- Food inputs: Other misc processed ---
  { code: "FRED:WPU017", source: "fred", sourceId: "WPU017", name: "PPI: Processed Foods & Feeds — Other", unit: "index", industryTags: ["restaurant"], costBucket: "inflation", frequency: "monthly" },

  // --- Labor: food-service employment, wages, JOLTS ---
  { code: "FRED:CEU7000000003", source: "fred", sourceId: "CEU7000000003", name: "Avg Hourly Earnings: Leisure & Hospitality, NSA", unit: "USD/hour", industryTags: ["restaurant"], costBucket: "labor", frequency: "monthly" },
  { code: "FRED:CES0500000003", source: "fred", sourceId: "CES0500000003", name: "Avg Hourly Earnings: Total Private", unit: "USD/hour", industryTags: ["restaurant"], costBucket: "labor", frequency: "monthly" },
  { code: "FRED:JTS7000JOL", source: "fred", sourceId: "JTS7000JOL", name: "JOLTS: Accommodation & Food Svcs, Job Openings", unit: "thousands", industryTags: ["restaurant"], costBucket: "labor", frequency: "monthly" },
  { code: "FRED:JTS7000QUR", source: "fred", sourceId: "JTS7000QUR", name: "JOLTS: Accommodation & Food Svcs, Quits Rate", unit: "%", industryTags: ["restaurant"], costBucket: "labor", frequency: "monthly" },
  { code: "FRED:JTS7000HIR", source: "fred", sourceId: "JTS7000HIR", name: "JOLTS: Accommodation & Food Svcs, Hires Rate", unit: "%", industryTags: ["restaurant"], costBucket: "labor", frequency: "monthly" },
  { code: "FRED:JTU7000JOL", source: "fred", sourceId: "JTU7000JOL", name: "JOLTS: Accommodation & Food Svcs, Job Openings, NSA", unit: "thousands", industryTags: ["restaurant"], costBucket: "labor", frequency: "monthly" },
  { code: "FRED:JTU7000QUR", source: "fred", sourceId: "JTU7000QUR", name: "JOLTS: Accommodation & Food Svcs, Quits Rate, NSA", unit: "%", industryTags: ["restaurant"], costBucket: "labor", frequency: "monthly" },
  { code: "FRED:ECIWAG", source: "fred", sourceId: "ECIWAG", name: "Employment Cost Index: Wages & Salaries", unit: "index", industryTags: ["restaurant"], costBucket: "labor", frequency: "quarterly" },
  { code: "FRED:CIU2010000000000I", source: "fred", sourceId: "CIU2010000000000I", name: "ECI: Wages & Salaries, Private Industry, NSA", unit: "index", industryTags: ["restaurant"], costBucket: "labor", frequency: "quarterly" },
  { code: "FRED:LNS12032194", source: "fred", sourceId: "LNS12032194", name: "Employment-Population Ratio, 25-54", unit: "%", industryTags: ["restaurant"], costBucket: "labor", frequency: "monthly" },
  { code: "FRED:ICSA", source: "fred", sourceId: "ICSA", name: "Initial Unemployment Claims", unit: "persons", industryTags: ["restaurant"], costBucket: "labor", frequency: "weekly" },
  { code: "FRED:USWTRADE", source: "fred", sourceId: "USWTRADE", name: "All Employees, Wholesale Trade", unit: "thousands of persons", industryTags: ["restaurant"], costBucket: "labor", frequency: "monthly" },

  // NOTE: 12 state minimum-wage series (STTMINWG{CA,NY,TX,FL,IL,AZ,CO,GA,MA,NC,OH,PA})
  // were verified in FRED but are annual-frequency only; frequency enum supports
  // daily/weekly/monthly/quarterly. Deferred until enum extension decision.

  // --- Energy & ops (fuel / crude / refined / PPI energy / CPI fuel) ---
  { code: "FRED:GASDESW", source: "fred", sourceId: "GASDESW", name: "US Diesel Retail, All Types, Weekly", unit: "USD/gal", industryTags: ["restaurant"], costBucket: "fuel", frequency: "weekly" },
  { code: "FRED:DCOILWTICO", source: "fred", sourceId: "DCOILWTICO", name: "Crude Oil Prices: WTI", unit: "USD/bbl", industryTags: ["restaurant"], costBucket: "fuel", frequency: "daily" },
  { code: "FRED:DCOILBRENTEU", source: "fred", sourceId: "DCOILBRENTEU", name: "Crude Oil Prices: Brent Europe", unit: "USD/bbl", industryTags: ["restaurant"], costBucket: "fuel", frequency: "daily" },
  { code: "FRED:MCOILWTICO", source: "fred", sourceId: "MCOILWTICO", name: "Crude Oil Prices: WTI, Monthly", unit: "USD/bbl", industryTags: ["restaurant"], costBucket: "fuel", frequency: "monthly" },
  { code: "FRED:MHOILNYH", source: "fred", sourceId: "MHOILNYH", name: "Heating Oil No. 2, NY Harbor, Monthly", unit: "USD/gal", industryTags: ["restaurant"], costBucket: "fuel", frequency: "monthly" },
  { code: "FRED:WPU0531", source: "fred", sourceId: "WPU0531", name: "PPI: Gas Fuels", unit: "index", industryTags: ["restaurant"], costBucket: "energy", frequency: "monthly" },
  { code: "FRED:WPU0561", source: "fred", sourceId: "WPU0561", name: "PPI: Crude Petroleum", unit: "index", industryTags: ["restaurant"], costBucket: "fuel", frequency: "monthly" },
  { code: "FRED:WPU0571", source: "fred", sourceId: "WPU0571", name: "PPI: Refined Petroleum Products", unit: "index", industryTags: ["restaurant"], costBucket: "fuel", frequency: "monthly" },
  { code: "FRED:CUSR0000SETB", source: "fred", sourceId: "CUSR0000SETB", name: "CPI: Motor Fuel", unit: "index", industryTags: ["restaurant"], costBucket: "fuel", frequency: "monthly" },
  { code: "FRED:CUSR0000SETB01", source: "fred", sourceId: "CUSR0000SETB01", name: "CPI: Gasoline (All Types)", unit: "index", industryTags: ["restaurant"], costBucket: "fuel", frequency: "monthly" },

  // --- Energy: state-level commercial electricity (EIA) ---
  { code: "EIA:ELEC.PRICE.CA-COM.M", source: "eia", sourceId: "ELEC.PRICE.CA-COM.M", name: "CA Commercial Electricity Retail Price", unit: "¢/kWh", industryTags: ["restaurant"], costBucket: "energy", frequency: "monthly" },
  { code: "EIA:ELEC.PRICE.NY-COM.M", source: "eia", sourceId: "ELEC.PRICE.NY-COM.M", name: "NY Commercial Electricity Retail Price", unit: "¢/kWh", industryTags: ["restaurant"], costBucket: "energy", frequency: "monthly" },
  { code: "EIA:ELEC.PRICE.TX-COM.M", source: "eia", sourceId: "ELEC.PRICE.TX-COM.M", name: "TX Commercial Electricity Retail Price", unit: "¢/kWh", industryTags: ["restaurant"], costBucket: "energy", frequency: "monthly" },
  { code: "EIA:ELEC.PRICE.FL-COM.M", source: "eia", sourceId: "ELEC.PRICE.FL-COM.M", name: "FL Commercial Electricity Retail Price", unit: "¢/kWh", industryTags: ["restaurant"], costBucket: "energy", frequency: "monthly" },
  { code: "EIA:ELEC.PRICE.IL-COM.M", source: "eia", sourceId: "ELEC.PRICE.IL-COM.M", name: "IL Commercial Electricity Retail Price", unit: "¢/kWh", industryTags: ["restaurant"], costBucket: "energy", frequency: "monthly" },

  // --- Real estate & rent (CPI shelter, HPI, supply) ---
  { code: "FRED:CUSR0000SAH1", source: "fred", sourceId: "CUSR0000SAH1", name: "CPI: Shelter", unit: "index", industryTags: ["restaurant"], costBucket: "housing", frequency: "monthly" },
  { code: "FRED:CUSR0000SEHA", source: "fred", sourceId: "CUSR0000SEHA", name: "CPI: Rent of Primary Residence", unit: "index", industryTags: ["restaurant"], costBucket: "housing", frequency: "monthly" },
  { code: "FRED:CUSR0000SEHB", source: "fred", sourceId: "CUSR0000SEHB", name: "CPI: Lodging Away From Home", unit: "index", industryTags: ["restaurant"], costBucket: "housing", frequency: "monthly" },
  { code: "FRED:CUSR0000SEHC", source: "fred", sourceId: "CUSR0000SEHC", name: "CPI: Owners' Equivalent Rent", unit: "index", industryTags: ["restaurant"], costBucket: "housing", frequency: "monthly" },
  { code: "FRED:CUUR0000SEHA", source: "fred", sourceId: "CUUR0000SEHA", name: "CPI: Rent of Primary Residence, NSA", unit: "index", industryTags: ["restaurant"], costBucket: "housing", frequency: "monthly" },
  { code: "FRED:CUUR0000SEHC", source: "fred", sourceId: "CUUR0000SEHC", name: "CPI: Owners' Equivalent Rent, NSA", unit: "index", industryTags: ["restaurant"], costBucket: "housing", frequency: "monthly" },
  { code: "FRED:CUUR0000SEHC01", source: "fred", sourceId: "CUUR0000SEHC01", name: "CPI: Owners' Equivalent Rent, Primary Residence, NSA", unit: "index", industryTags: ["restaurant"], costBucket: "housing", frequency: "monthly" },
  { code: "FRED:CSUSHPINSA", source: "fred", sourceId: "CSUSHPINSA", name: "S&P/Case-Shiller US National Home Price Index", unit: "index", industryTags: ["restaurant"], costBucket: "housing", frequency: "monthly" },
  { code: "FRED:MSACSR", source: "fred", sourceId: "MSACSR", name: "Monthly Supply of New Houses", unit: "months", industryTags: ["restaurant"], costBucket: "housing", frequency: "monthly" },
  { code: "FRED:USSTHPI", source: "fred", sourceId: "USSTHPI", name: "FHFA All-Transactions HPI, US", unit: "index", industryTags: ["restaurant"], costBucket: "housing", frequency: "quarterly" },
  { code: "FRED:BOGZ1FL075035503Q", source: "fred", sourceId: "BOGZ1FL075035503Q", name: "Nonfinancial Business CRE Debt, Commercial Mortgages", unit: "USD millions", industryTags: ["restaurant"], costBucket: "housing", frequency: "quarterly" },

  // --- Consumer demand (retail, sentiment, income, PCE, SNAP) ---
  { code: "FRED:RSFSDP", source: "fred", sourceId: "RSFSDP", name: "Retail Sales: Food Svcs & Drinking Places", unit: "USD millions", industryTags: ["restaurant"], costBucket: "demand", frequency: "monthly" },
  { code: "FRED:RSNSR", source: "fred", sourceId: "RSNSR", name: "Retail Sales: Non-Store Retailers", unit: "USD millions", industryTags: ["restaurant"], costBucket: "demand", frequency: "monthly" },
  { code: "FRED:MRTSSM722USN", source: "fred", sourceId: "MRTSSM722USN", name: "Retail Trade: Food Svcs & Drinking Places, NSA", unit: "USD millions", industryTags: ["restaurant"], costBucket: "demand", frequency: "monthly" },
  { code: "FRED:MRTSSM722USS", source: "fred", sourceId: "MRTSSM722USS", name: "Retail Trade: Food Svcs & Drinking Places, SA", unit: "USD millions", industryTags: ["restaurant"], costBucket: "demand", frequency: "monthly" },
  { code: "FRED:CSCICP03USM665S", source: "fred", sourceId: "CSCICP03USM665S", name: "OECD Consumer Confidence Indicator, US", unit: "index", industryTags: ["restaurant"], costBucket: "demand", frequency: "monthly" },
  { code: "FRED:DSPI", source: "fred", sourceId: "DSPI", name: "Disposable Personal Income", unit: "USD billions", industryTags: ["restaurant"], costBucket: "demand", frequency: "monthly" },
  { code: "FRED:PCE", source: "fred", sourceId: "PCE", name: "Personal Consumption Expenditures", unit: "USD billions", industryTags: ["restaurant"], costBucket: "demand", frequency: "monthly" },
  { code: "FRED:PCEDG", source: "fred", sourceId: "PCEDG", name: "PCE: Durable Goods", unit: "USD billions", industryTags: ["restaurant"], costBucket: "demand", frequency: "monthly" },
  { code: "FRED:PCESV", source: "fred", sourceId: "PCESV", name: "PCE: Services", unit: "USD billions", industryTags: ["restaurant"], costBucket: "demand", frequency: "monthly" },
  { code: "FRED:DRCCLACBS", source: "fred", sourceId: "DRCCLACBS", name: "Delinquency Rate: Credit Card Loans", unit: "%", industryTags: ["restaurant"], costBucket: "consumer_credit", frequency: "quarterly" },
  { code: "FRED:DRCLACBS", source: "fred", sourceId: "DRCLACBS", name: "Delinquency Rate: Consumer Loans", unit: "%", industryTags: ["restaurant"], costBucket: "consumer_credit", frequency: "quarterly" },
  { code: "FRED:DRBLACBS", source: "fred", sourceId: "DRBLACBS", name: "Delinquency Rate: Business Loans", unit: "%", industryTags: ["restaurant"], costBucket: "credit", frequency: "quarterly" },
  { code: "FRED:FODSP", source: "fred", sourceId: "FODSP", name: "SNAP Participation", unit: "persons", industryTags: ["restaurant"], costBucket: "demand", frequency: "monthly" },
  { code: "FRED:CUSR0000SEFV05", source: "fred", sourceId: "CUSR0000SEFV05", name: "CPI: Food From Vending Machines & Mobile Vendors", unit: "index", industryTags: ["restaurant"], costBucket: "menu_pricing", frequency: "monthly" },

  // --- Financing & credit (rates, spreads, loans, FX) ---
  { code: "FRED:FEDFUNDS", source: "fred", sourceId: "FEDFUNDS", name: "Federal Funds Effective Rate, Monthly", unit: "%", industryTags: ["restaurant"], costBucket: "interest_rates", frequency: "monthly" },
  { code: "FRED:SOFR", source: "fred", sourceId: "SOFR", name: "Secured Overnight Financing Rate (SOFR)", unit: "%", industryTags: ["restaurant"], costBucket: "interest_rates", frequency: "daily" },
  { code: "FRED:DGS2", source: "fred", sourceId: "DGS2", name: "2-Year Treasury Constant Maturity Rate", unit: "%", industryTags: ["restaurant"], costBucket: "interest_rates", frequency: "daily" },
  { code: "FRED:BAMLC0A0CM", source: "fred", sourceId: "BAMLC0A0CM", name: "ICE BofA US Corporate Index OAS", unit: "%", industryTags: ["restaurant"], costBucket: "credit", frequency: "daily" },
  { code: "FRED:BAMLC0A4CBBB", source: "fred", sourceId: "BAMLC0A4CBBB", name: "ICE BofA BBB US Corporate Index OAS", unit: "%", industryTags: ["restaurant"], costBucket: "credit", frequency: "daily" },
  { code: "FRED:DRTSCILM", source: "fred", sourceId: "DRTSCILM", name: "Senior Loan Survey: Net % Tightening C&I Loans", unit: "%", industryTags: ["restaurant"], costBucket: "financing", frequency: "quarterly" },
  { code: "FRED:BUSLOANS", source: "fred", sourceId: "BUSLOANS", name: "Commercial & Industrial Loans, All Commercial Banks", unit: "USD billions", industryTags: ["restaurant"], costBucket: "financing", frequency: "weekly" },
  { code: "FRED:TOTCI", source: "fred", sourceId: "TOTCI", name: "Total Consumer Credit Outstanding", unit: "USD billions", industryTags: ["restaurant"], costBucket: "consumer_credit", frequency: "monthly" },
  { code: "FRED:DEXCAUS", source: "fred", sourceId: "DEXCAUS", name: "Canada / US Foreign Exchange Rate", unit: "CAD per USD", industryTags: ["restaurant"], costBucket: "currency", frequency: "daily" },
  { code: "FRED:DEXMXUS", source: "fred", sourceId: "DEXMXUS", name: "Mexico / US Foreign Exchange Rate", unit: "MXN per USD", industryTags: ["restaurant"], costBucket: "currency", frequency: "daily" },

  // --- Macro / inflation (cross-reference) ---
  { code: "FRED:CPILFESL", source: "fred", sourceId: "CPILFESL", name: "Core CPI (All Items Less Food & Energy)", unit: "index", industryTags: ["restaurant"], costBucket: "inflation", frequency: "monthly" },
  { code: "FRED:CPIUFDSL", source: "fred", sourceId: "CPIUFDSL", name: "CPI: Food", unit: "index", industryTags: ["restaurant"], costBucket: "inflation", frequency: "monthly" },
  { code: "FRED:PCEPI", source: "fred", sourceId: "PCEPI", name: "PCE Price Index", unit: "index", industryTags: ["restaurant"], costBucket: "inflation", frequency: "monthly" },

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

  // ────────────────────────────────────────────────────────────────────────
  // EIA — energy prices (diesel, electricity, natural gas)
  // ────────────────────────────────────────────────────────────────────────
  {
    code: "EIA:PET.EMD_EPD2D_PTE_NUS_DPG.W",
    source: "eia",
    sourceId: "PET.EMD_EPD2D_PTE_NUS_DPG.W",
    name: "Weekly US Diesel Retail Price",
    unit: "USD/gal",
    industryTags: ["restaurant", "construction", "retail"],
    costBucket: "fuel",
    frequency: "weekly",
  },
  {
    code: "EIA:ELEC.PRICE.US-COM.M",
    source: "eia",
    sourceId: "ELEC.PRICE.US-COM.M",
    name: "US Commercial Electricity Retail Price",
    unit: "¢/kWh",
    industryTags: ["restaurant", "retail"],
    costBucket: "energy",
    frequency: "monthly",
  },
  {
    code: "EIA:ELEC.PRICE.US-IND.M",
    source: "eia",
    sourceId: "ELEC.PRICE.US-IND.M",
    name: "US Industrial Electricity Retail Price",
    unit: "¢/kWh",
    industryTags: ["construction"],
    costBucket: "energy",
    frequency: "monthly",
  },
  {
    code: "EIA:ELEC.PRICE.US-RES.M",
    source: "eia",
    sourceId: "ELEC.PRICE.US-RES.M",
    name: "US Residential Electricity Retail Price",
    unit: "¢/kWh",
    industryTags: ["retail"],
    costBucket: "energy",
    frequency: "monthly",
  },
  {
    code: "EIA:NG.N3020US3.M",
    source: "eia",
    sourceId: "NG.N3020US3.M",
    name: "US Natural Gas Commercial Price",
    unit: "USD/Mcf",
    industryTags: ["restaurant", "retail"],
    costBucket: "energy",
    frequency: "monthly",
  },
  {
    code: "EIA:NG.N3035US3.M",
    source: "eia",
    sourceId: "NG.N3035US3.M",
    name: "US Natural Gas Industrial Price",
    unit: "USD/Mcf",
    industryTags: ["construction"],
    costBucket: "energy",
    frequency: "monthly",
  },

  // ────────────────────────────────────────────────────────────────────────
  // USDA NASS — food commodity prices received by farmers
  // sourceId keys map to NASS_SERIES lookup table in lib/data-sources/usda.ts
  // ────────────────────────────────────────────────────────────────────────
  {
    code: "USDA:EGGS_TABLE_PRICE_MONTHLY",
    source: "usda",
    sourceId: "EGGS_TABLE_PRICE_MONTHLY",
    name: "Table Eggs: Price Received",
    unit: "USD/dozen",
    industryTags: ["restaurant"],
    costBucket: "eggs",
    frequency: "monthly",
  },
  {
    code: "USDA:MILK_PRICE_MONTHLY",
    source: "usda",
    sourceId: "MILK_PRICE_MONTHLY",
    name: "Milk: Price Received",
    unit: "USD/cwt",
    industryTags: ["restaurant", "retail"],
    costBucket: "dairy",
    frequency: "monthly",
  },
  {
    code: "USDA:CORN_PRICE_MONTHLY",
    source: "usda",
    sourceId: "CORN_PRICE_MONTHLY",
    name: "Corn: Price Received",
    unit: "USD/bu",
    industryTags: ["restaurant"],
    costBucket: "grain",
    frequency: "monthly",
  },
  {
    code: "USDA:BROILERS_PRICE_MONTHLY",
    source: "usda",
    sourceId: "BROILERS_PRICE_MONTHLY",
    name: "Broilers: Price Received",
    unit: "USD/lb",
    industryTags: ["restaurant"],
    costBucket: "poultry",
    frequency: "monthly",
  },
  {
    code: "USDA:SOYBEANS_PRICE_MONTHLY",
    source: "usda",
    sourceId: "SOYBEANS_PRICE_MONTHLY",
    name: "Soybeans: Price Received",
    unit: "USD/bu",
    industryTags: ["restaurant", "retail"],
    costBucket: "grain",
    frequency: "monthly",
  },
  {
    code: "USDA:WHEAT_PRICE_MONTHLY",
    source: "usda",
    sourceId: "WHEAT_PRICE_MONTHLY",
    name: "Wheat: Price Received",
    unit: "USD/bu",
    industryTags: ["restaurant"],
    costBucket: "grain",
    frequency: "monthly",
  },

  // ────────────────────────────────────────────────────────────────────────
  // BLS — CPI, PPI, employment cost, wages
  // ────────────────────────────────────────────────────────────────────────
  {
    code: "BLS:CIU1010000000000A",
    source: "bls",
    sourceId: "CIU1010000000000A",
    name: "Employment Cost Index: Total Compensation, Civilian Workers",
    unit: "index",
    industryTags: ["restaurant", "construction", "retail"],
    costBucket: "labor",
    frequency: "quarterly",
  },
  {
    code: "BLS:CES7072200008",
    source: "bls",
    sourceId: "CES7072200008",
    name: "Average Hourly Earnings: Food Services and Drinking Places",
    unit: "USD/hour",
    industryTags: ["restaurant"],
    costBucket: "labor",
    frequency: "monthly",
  },
  {
    code: "BLS:CES4200000008",
    source: "bls",
    sourceId: "CES4200000008",
    name: "Average Hourly Earnings: Retail Trade",
    unit: "USD/hour",
    industryTags: ["retail"],
    costBucket: "labor",
    frequency: "monthly",
  },
  {
    code: "BLS:CUSR0000SAF11",
    source: "bls",
    sourceId: "CUSR0000SAF11",
    name: "CPI: Food at Home (Not Seasonally Adjusted)",
    unit: "index",
    industryTags: ["restaurant", "retail"],
    costBucket: "inflation",
    frequency: "monthly",
  },
  {
    code: "BLS:WPU1321",
    source: "bls",
    sourceId: "WPU1321",
    name: "PPI: Concrete Products",
    unit: "index",
    industryTags: ["construction"],
    costBucket: "materials",
    frequency: "monthly",
  },
  {
    code: "BLS:PCU327320327320",
    source: "bls",
    sourceId: "PCU327320327320",
    name: "PPI: Ready-Mix Concrete",
    unit: "index",
    industryTags: ["construction"],
    costBucket: "materials",
    frequency: "monthly",
  },

  // ────────────────────────────────────────────────────────────────────────
  // Treasury FiscalData — sovereign debt & cash position
  // ────────────────────────────────────────────────────────────────────────
  {
    code: "TREASURY:debt_to_penny",
    source: "treasury",
    sourceId: "debt_to_penny",
    name: "Total Public Debt Outstanding",
    unit: "USD",
    industryTags: ["restaurant", "construction", "retail"],
    costBucket: "sovereign_debt",
    frequency: "daily",
  },
  {
    code: "TREASURY:tga_operating_balance",
    source: "treasury",
    sourceId: "tga_operating_balance",
    name: "Treasury General Account: Closing Operating Balance",
    unit: "USD millions",
    industryTags: ["restaurant", "construction", "retail"],
    costBucket: "sovereign_debt",
    frequency: "daily",
  },

  // ────────────────────────────────────────────────────────────────────────
  // NOAA — active weather alerts (NWS) and climate baselines (NCEI)
  // NWS alerts are snapshots: one data point per fetch with value = alert count.
  // ────────────────────────────────────────────────────────────────────────
  {
    code: "NOAA:NWS:ALERTS:ACTIVE:ALL",
    source: "noaa",
    sourceId: "NWS:ALERTS:ACTIVE:ALL",
    name: "NWS Active Alerts — National Count",
    unit: "count",
    industryTags: ["restaurant", "construction", "retail"],
    costBucket: "weather",
    frequency: "daily",
  },
  {
    code: "NOAA:NWS:ALERTS:ACTIVE:Hurricane Warning",
    source: "noaa",
    sourceId: "NWS:ALERTS:ACTIVE:Hurricane Warning",
    name: "NWS Active Alerts — Hurricane Warnings",
    unit: "count",
    industryTags: ["restaurant", "construction", "retail"],
    costBucket: "weather",
    frequency: "daily",
  },
  {
    code: "NOAA:NWS:ALERTS:ACTIVE:Tornado Warning",
    source: "noaa",
    sourceId: "NWS:ALERTS:ACTIVE:Tornado Warning",
    name: "NWS Active Alerts — Tornado Warnings",
    unit: "count",
    industryTags: ["restaurant", "construction", "retail"],
    costBucket: "weather",
    frequency: "daily",
  },

  // ────────────────────────────────────────────────────────────────────────
  // Census — international trade, monthly imports by HS2 commodity
  // ────────────────────────────────────────────────────────────────────────
  {
    code: "CENSUS:IMPORTS:HS2:02",
    source: "census",
    sourceId: "IMPORTS:HS2:02",
    name: "US Imports: Meat & Edible Meat Offal (HS 02)",
    unit: "USD",
    industryTags: ["restaurant"],
    costBucket: "trade_flow",
    frequency: "monthly",
  },
  {
    code: "CENSUS:IMPORTS:HS2:10",
    source: "census",
    sourceId: "IMPORTS:HS2:10",
    name: "US Imports: Cereals (HS 10)",
    unit: "USD",
    industryTags: ["restaurant"],
    costBucket: "trade_flow",
    frequency: "monthly",
  },
  {
    code: "CENSUS:IMPORTS:HS2:27",
    source: "census",
    sourceId: "IMPORTS:HS2:27",
    name: "US Imports: Mineral Fuels & Oils (HS 27)",
    unit: "USD",
    industryTags: ["restaurant", "construction", "retail"],
    costBucket: "trade_flow",
    frequency: "monthly",
  },
  {
    code: "CENSUS:IMPORTS:HS2:72",
    source: "census",
    sourceId: "IMPORTS:HS2:72",
    name: "US Imports: Iron & Steel (HS 72)",
    unit: "USD",
    industryTags: ["construction"],
    costBucket: "trade_flow",
    frequency: "monthly",
  },
  {
    code: "CENSUS:IMPORTS:HS2:87",
    source: "census",
    sourceId: "IMPORTS:HS2:87",
    name: "US Imports: Vehicles (HS 87)",
    unit: "USD",
    industryTags: ["retail"],
    costBucket: "trade_flow",
    frequency: "monthly",
  },

  // ────────────────────────────────────────────────────────────────────────
  // USDA AMS — daily wholesale livestock/meat/dairy
  // Distinct from USDA NASS (farmer-received prices) in lib/data-sources/usda.ts
  // ────────────────────────────────────────────────────────────────────────
  {
    code: "USDA_AMS:NATIONAL_BOXED_BEEF_CHOICE_DAILY",
    source: "usda_ams",
    sourceId: "NATIONAL_BOXED_BEEF_CHOICE_DAILY",
    name: "National Daily Boxed Beef Cutout — Choice (600-900 lb)",
    unit: "USD/cwt",
    industryTags: ["restaurant"],
    costBucket: "wholesale_meat",
    frequency: "daily",
  },
  {
    code: "USDA_AMS:NATIONAL_BOXED_BEEF_SELECT_DAILY",
    source: "usda_ams",
    sourceId: "NATIONAL_BOXED_BEEF_SELECT_DAILY",
    name: "National Daily Boxed Beef Cutout — Select (600-900 lb)",
    unit: "USD/cwt",
    industryTags: ["restaurant"],
    costBucket: "wholesale_meat",
    frequency: "daily",
  },
  {
    code: "USDA_AMS:NATIONAL_BONELESS_PROCESSING_BEEF_DAILY",
    source: "usda_ams",
    sourceId: "NATIONAL_BONELESS_PROCESSING_BEEF_DAILY",
    name: "National Daily Boneless Processing Beef — Weighted Average",
    unit: "USD/cwt",
    industryTags: ["restaurant"],
    costBucket: "wholesale_meat",
    frequency: "daily",
  },
  {
    code: "USDA_AMS:NATIONAL_DAILY_HOG_PURCHASED_SWINE",
    source: "usda_ams",
    sourceId: "NATIONAL_DAILY_HOG_PURCHASED_SWINE",
    name: "National Daily Direct Hog — Barrows & Gilts Weighted Avg Net",
    unit: "USD/cwt",
    industryTags: ["restaurant"],
    costBucket: "wholesale_pork",
    frequency: "daily",
  },

  // ────────────────────────────────────────────────────────────────────────
  // Federal Register — policy / regulatory event counts, weekly buckets
  // INTERFACE-FIT: docs, not a time series. Stored as weekly counts where
  // value = number of matching publications in the ISO week.
  // ────────────────────────────────────────────────────────────────────────
  {
    code: "FEDERAL_REGISTER:tariff",
    source: "federal_register",
    sourceId: "tariff",
    name: "Federal Register: Weekly Tariff Publications",
    unit: "count",
    industryTags: ["restaurant", "construction", "retail"],
    costBucket: "policy",
    frequency: "weekly",
  },
  {
    code: "FEDERAL_REGISTER:import duty",
    source: "federal_register",
    sourceId: "import duty",
    name: "Federal Register: Weekly Import-Duty Publications",
    unit: "count",
    industryTags: ["restaurant", "retail"],
    costBucket: "policy",
    frequency: "weekly",
  },
  {
    code: "FEDERAL_REGISTER:trade",
    source: "federal_register",
    sourceId: "trade",
    name: "Federal Register: Weekly Trade Publications",
    unit: "count",
    industryTags: ["restaurant", "construction", "retail"],
    costBucket: "policy",
    frequency: "weekly",
  },

  // ────────────────────────────────────────────────────────────────────────
  // FHFA — House Price Index, CSV-sourced
  // ────────────────────────────────────────────────────────────────────────
  {
    code: "FHFA:HPI_PO_MONTHLY_USA_SA",
    source: "fhfa",
    sourceId: "HPI_PO_MONTHLY_USA_SA",
    name: "FHFA Purchase-Only HPI — National (SA, Monthly)",
    unit: "index",
    industryTags: ["construction", "retail"],
    costBucket: "housing",
    frequency: "monthly",
  },
  {
    code: "FHFA:HPI_AT_QUARTERLY_USA_NSA",
    source: "fhfa",
    sourceId: "HPI_AT_QUARTERLY_USA_NSA",
    name: "FHFA All-Transactions HPI — National (NSA, Quarterly)",
    unit: "index",
    industryTags: ["construction", "retail"],
    costBucket: "housing",
    frequency: "quarterly",
  },
  {
    code: "FHFA:HPI_EXP_QUARTERLY_USA_NSA",
    source: "fhfa",
    sourceId: "HPI_EXP_QUARTERLY_USA_NSA",
    name: "FHFA Expanded-Data HPI — National (NSA, Quarterly)",
    unit: "index",
    industryTags: ["construction", "retail"],
    costBucket: "housing",
    frequency: "quarterly",
  },

  // ────────────────────────────────────────────────────────────────────────
  // FEMA — monthly disaster declaration counts (risk signal)
  // ────────────────────────────────────────────────────────────────────────
  {
    code: "FEMA:DECLARATIONS:MONTHLY:US",
    source: "fema",
    sourceId: "DECLARATIONS:MONTHLY:US",
    name: "FEMA Disaster Declarations — US Monthly Count",
    unit: "count",
    industryTags: ["restaurant", "construction", "retail"],
    costBucket: "disaster_risk",
    frequency: "monthly",
  },
  {
    code: "FEMA:DECLARATIONS:MONTHLY:US:Hurricane",
    source: "fema",
    sourceId: "DECLARATIONS:MONTHLY:US:Hurricane",
    name: "FEMA Disaster Declarations — Hurricanes Monthly Count",
    unit: "count",
    industryTags: ["restaurant", "construction", "retail"],
    costBucket: "disaster_risk",
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
