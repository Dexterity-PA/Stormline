export type DashboardTileMock = {
  label: string;
  value: string;
  weekDelta: string;
  weekDeltaSign: "up" | "down" | "flat";
  isCostInput: boolean;
  direction: "cost" | "demand";
  source: string;
  percentile5yr: number;
};

export type BriefingSection = {
  label: string;
  body: string;
};

export type BriefingMock = {
  weekOf: string;
  headline: string;
  inputCosts: BriefingSection[];
  demandSignal: string;
  watchList: BriefingSection[];
  operatorActions: string[];
};

export type IndustryContent = {
  slug: string;
  name: string;
  heroHeadline: string;
  heroSubheadline: string;
  personaDesc: string;
  ctaText: string;
  tiles: DashboardTileMock[];
  briefing: BriefingMock;
};

const RESTAURANTS: IndustryContent = {
  slug: "restaurants",
  name: "Restaurants",
  heroHeadline: "You set your menu prices before checking the beef report.",
  heroSubheadline:
    "Stormline tracks wholesale beef, poultry, cooking oil, labor costs, and regional discretionary spend — then sends you a plain-English briefing every Monday before you open. No Bloomberg terminal required.",
  personaDesc:
    "Built for 1–5 location independent operators who make decisions on gut, Square data, and what the distributor rep says on the phone.",
  ctaText: "Start your 14-day free trial",
  tiles: [
    {
      label: "Wholesale Beef — Choice",
      value: "$7.24 / lb",
      weekDelta: "+6.2%",
      weekDeltaSign: "up",
      isCostInput: true,
      direction: "cost",
      source: "FRED / USDA NASS",
      percentile5yr: 81,
    },
    {
      label: "Broiler Chicken Wholesale",
      value: "$1.84 / lb",
      weekDelta: "-1.1%",
      weekDeltaSign: "down",
      isCostInput: true,
      direction: "cost",
      source: "FRED / USDA NASS",
      percentile5yr: 48,
    },
    {
      label: "Soybean Oil (Cooking Oil)",
      value: "$0.58 / lb",
      weekDelta: "+2.8%",
      weekDeltaSign: "up",
      isCostInput: true,
      direction: "cost",
      source: "FRED / USDA AMS",
      percentile5yr: 67,
    },
    {
      label: "Wheat — Global Price",
      value: "$178 / mt",
      weekDelta: "-3.4%",
      weekDeltaSign: "down",
      isCostInput: true,
      direction: "cost",
      source: "FRED (PWHEAMTUSDM)",
      percentile5yr: 54,
    },
    {
      label: "Natural Gas — Henry Hub",
      value: "$2.71 / MMBtu",
      weekDelta: "-8.3%",
      weekDeltaSign: "down",
      isCostInput: true,
      direction: "cost",
      source: "FRED (DHHNGSP)",
      percentile5yr: 22,
    },
    {
      label: "Hospitality Hourly Wage",
      value: "$19.84 / hr",
      weekDelta: "+3.1% YoY",
      weekDeltaSign: "up",
      isCostInput: true,
      direction: "cost",
      source: "BLS (CES7000000008)",
      percentile5yr: 74,
    },
    {
      label: "CPI: Food Away From Home",
      value: "321.4",
      weekDelta: "+4.2% YoY",
      weekDeltaSign: "up",
      isCostInput: false,
      direction: "demand",
      source: "BLS (CUSR0000SEFV)",
      percentile5yr: 91,
    },
    {
      label: "Consumer Sentiment",
      value: "67.8",
      weekDelta: "-4.3 pts",
      weekDeltaSign: "down",
      isCostInput: false,
      direction: "demand",
      source: "U. of Michigan (UMCSENT)",
      percentile5yr: 28,
    },
    {
      label: "Regular Gasoline — National",
      value: "$3.42 / gal",
      weekDelta: "+0.8%",
      weekDeltaSign: "up",
      isCostInput: true,
      direction: "cost",
      source: "FRED (GASREGW)",
      percentile5yr: 51,
    },
    {
      label: "Federal Funds Rate",
      value: "5.25%",
      weekDelta: "flat",
      weekDeltaSign: "flat",
      isCostInput: true,
      direction: "cost",
      source: "FRED (DFF)",
      percentile5yr: 88,
    },
  ],
  briefing: {
    weekOf: "April 14, 2026",
    headline:
      "Wholesale beef at a 14-month high; kitchen energy costs softening on natural gas retreat.",
    inputCosts: [
      {
        label: "Beef",
        body: "USDA choice beef wholesale hit $7.24/lb this week, up 6.2% from 30 days ago and sitting at the 81st percentile of its 5-year range. The move is driven by tighter cattle-on-feed inventories — USDA reports feedlot placements running 12% below year-ago — combined with sustained export demand from South Korea and Japan. Historical data shows that wholesale-to-menu price transmission typically runs 6–8 weeks with a 40–60% pass-through ratio for independent restaurants. Operators with beef-heavy menus are entering a period where the contract price and the current spot diverge materially.",
      },
      {
        label: "Poultry",
        body: "Broiler wholesale prices held at $1.84/lb, down 1.1% week-over-week, within normal seasonal range. The USDA Cold Storage report released Thursday showed frozen chicken inventories at a 3-year high, which historically correlates with price stability or modest declines over the following 45–60 days. Avian influenza watch remains active — USDA confirmed new outbreaks in Iowa and Minnesota flocks as of April 12. Historical data from prior HPAI multi-state spreads shows 15–25% poultry price spikes within 30–45 days of confirmed spread; current inventory buffer provides some protection but not immunity.",
      },
      {
        label: "Cooking Oil (Soybean)",
        body: "Soybean oil settled at $0.58/lb, up 2.8% on the month, driven by Brazilian weather disruptions and continued biodiesel mandates competing with food-grade supply. At the 67th percentile of its 5-year range, this is not a crisis level — but the trend is upward. Independent restaurant operators with high-fryer-volume menus (wings, fried chicken, donuts) have historically seen margin compression of 0.8–1.2% per 10% oil price increase. The Brazil harvest window closes in May; if weather disruptions persist, analysts tracking futures markets project additional 5–8% upside before the next supply report.",
      },
      {
        label: "Kitchen Energy (Natural Gas)",
        body: "Henry Hub spot settled at $2.71/MMBtu this week, down 8.3% from the 30-day average and at the 22nd percentile of the 5-year range. This is one of the more favorable cost signals in the current environment. Lower gas prices historically reduce commercial kitchen energy costs with a 30–45 day lag depending on utility billing cycles and whether the operator is on a variable or fixed rate plan. Operators on variable-rate utility agreements are likely to see benefit in May and June billing periods.",
      },
      {
        label: "Labor",
        body: "Average hourly earnings in food services and drinking places rose to $19.84/hr in March (BLS), up 3.1% year-over-year. This remains above the 5-year average real wage growth of 2.4% for the sector, reflecting continued labor market tightness in hospitality. Historical data from similar wage pressure environments shows that scheduling efficiency tools — specifically algorithmic shift-floor controls — have correlated with 8–12% reductions in overtime costs among operators who adopted them within 60 days of crossing the 3% YoY threshold.",
      },
    ],
    demandSignal:
      "The University of Michigan Consumer Sentiment Index fell to 67.8 in April, a 3-month low, driven by inflation expectations and geopolitical uncertainty. CPI Food Away From Home rose 4.2% year-over-year in March, the highest reading since mid-2023, outpacing headline CPI by 1.6 points. Historical data from comparable sentiment troughs — including late-2019 and mid-2022 — shows a 60–90 day lag between consumer sentiment declines and measurable restaurant traffic softness. Fast-casual and casual dining segments historically show 2–4% traffic decreases before full-service; check average compression typically follows 30–45 days after traffic declines begin. The divergence between rising menu pricing (CPI Food Away From Home) and falling consumer sentiment represents a margin environment that historical data suggests resolves one of two ways: operators reduce check average to defend traffic, or traffic softens to clear the price increase.",
    watchList: [
      {
        label: "FOMC Meeting — May 7",
        body: "Markets are pricing a 62% probability of a hold at 5.25%. Historical data shows restaurant equipment financing costs and commercial lease renewal rates track the federal funds rate with roughly a 3-month lag. A hold maintains current conditions. A cut would begin to relieve floating-rate obligations, with the effect materializing in Q3 2026 billing periods for operators with variable-rate financing.",
      },
      {
        label: "USDA Cattle on Feed Report — May 23",
        body: "April's tight inventory reading sets up potential for further beef price pressure into Q3. In three of the last four instances when cattle-on-feed inventories fell below current levels, wholesale beef prices advanced an additional 4–9% over the following quarter before supply normalization. The May report will be the clearest signal of whether this is a seasonal dip or a structural tightening cycle.",
      },
      {
        label: "HPAI (Avian Influenza) — Active Watch",
        body: "USDA-confirmed outbreaks in Iowa and Minnesota as of April 12 are early-stage but geographically clustered near major production facilities. Historically, outbreaks of this scale that reach multi-state commercial production facilities have produced 15–25% poultry price spikes within 30–45 days. Current frozen inventory levels provide a 3–4 week buffer before wholesale pricing typically responds at the operator level.",
      },
    ],
    operatorActions: [
      "Operators in similar beef price environments — above the 80th percentile for 4+ consecutive weeks — have historically renegotiated supply contracts to include quarterly price adjustment clauses rather than annual fixed pricing, particularly on beef and cooking oil.",
      "In prior periods when beef sat above the 80th percentile while poultry remained below the 50th percentile, operators with multiple protein menu options saw margin recovery 2–3x faster than those with concentrated beef exposure. Historical menus from high-beef-cost periods show a measurable shift toward featuring chicken and pork dishes.",
      "When consumer sentiment falls below 68 while food-away-from-home CPI exceeds 4%, historical patterns show operators who maintained value-tier menu options — not just premium items — retained traffic 15–20% better than those without an accessible price point.",
      "During the two prior natural gas price pullbacks of similar magnitude, operators who locked in commercial energy supply agreements within 30 days of the trough captured savings averaging $4,200/year per 2,000 sq ft of kitchen space, based on regional utility rate data from the 2020 and 2023 pullback windows.",
      "Labor cost growth above 3% YoY has historically correlated with faster adoption of scheduling optimization tools among regional operators. Those who implemented shift-floor controls within 60 days of crossing that threshold showed 8–12% reduction in overtime costs over the following two quarters, per BLS establishment survey data.",
    ],
  },
};

const CONSTRUCTION: IndustryContent = {
  slug: "construction",
  name: "Construction",
  heroHeadline: "You locked the bid before the lumber report dropped.",
  heroSubheadline:
    "Stormline tracks lumber, steel, copper, diesel, mortgage rates, and building permits — then sends you a plain-English briefing every Monday before your crew shows up. Know what's moving before your sub quotes change.",
  personaDesc:
    "Built for residential remodelers and small GCs with 5–30 employees who bid 8 weeks out and feel every material move in their margin.",
  ctaText: "Start your 14-day free trial",
  tiles: [
    {
      label: "Lumber PPI — Framing",
      value: "312 (index)",
      weekDelta: "-4.1%",
      weekDeltaSign: "down",
      isCostInput: true,
      direction: "cost",
      source: "FRED (WPU081)",
      percentile5yr: 58,
    },
    {
      label: "Steel Mill Products PPI",
      value: "284 (index)",
      weekDelta: "-0.4%",
      weekDeltaSign: "down",
      isCostInput: true,
      direction: "cost",
      source: "FRED (WPU1017)",
      percentile5yr: 71,
    },
    {
      label: "Copper — Global Price",
      value: "$9,847 / mt",
      weekDelta: "+2.1%",
      weekDeltaSign: "up",
      isCostInput: true,
      direction: "cost",
      source: "FRED (PCOPPUSDM)",
      percentile5yr: 92,
    },
    {
      label: "On-Highway Diesel",
      value: "$3.94 / gal",
      weekDelta: "-1.8%",
      weekDeltaSign: "down",
      isCostInput: true,
      direction: "cost",
      source: "EIA (weekly)",
      percentile5yr: 44,
    },
    {
      label: "30-Year Mortgage Rate",
      value: "7.21%",
      weekDelta: "+0.04 pts",
      weekDeltaSign: "up",
      isCostInput: false,
      direction: "cost",
      source: "FRED (MORTGAGE30US)",
      percentile5yr: 83,
    },
    {
      label: "Building Permits (SAAR)",
      value: "1,482k units",
      weekDelta: "-3.2%",
      weekDeltaSign: "down",
      isCostInput: false,
      direction: "demand",
      source: "FRED (PERMIT)",
      percentile5yr: 38,
    },
    {
      label: "Housing Starts (SAAR)",
      value: "1,319k units",
      weekDelta: "-5.1%",
      weekDeltaSign: "down",
      isCostInput: false,
      direction: "demand",
      source: "FRED (HOUST)",
      percentile5yr: 32,
    },
    {
      label: "Construction Hourly Wage",
      value: "$34.24 / hr",
      weekDelta: "+4.1% YoY",
      weekDeltaSign: "up",
      isCostInput: true,
      direction: "cost",
      source: "BLS (CES2000000008)",
      percentile5yr: 79,
    },
    {
      label: "Total Construction Spending",
      value: "$2,114B (SAAR)",
      weekDelta: "+1.2%",
      weekDeltaSign: "up",
      isCostInput: false,
      direction: "demand",
      source: "FRED (TTLCONS)",
      percentile5yr: 64,
    },
    {
      label: "Federal Funds Rate",
      value: "5.25%",
      weekDelta: "flat",
      weekDeltaSign: "flat",
      isCostInput: true,
      direction: "cost",
      source: "FRED (DFF)",
      percentile5yr: 88,
    },
  ],
  briefing: {
    weekOf: "April 14, 2026",
    headline:
      "Lumber correcting from March peak; copper at 3-year high as mortgage rates hold at 7.2%, suppressing new residential starts.",
    inputCosts: [
      {
        label: "Lumber",
        body: "The PPI for framing lumber fell to 312 this week, down 4.1% from the March 28 peak of 325. Historical data on lumber price cycles shows corrections of this magnitude after sharp run-ups have averaged 8–14 weeks before stabilizing, with recovery typically driven by spring-summer housing start seasonality. The current level sits at the 58th percentile of the 5-year range — elevated relative to pre-pandemic norms, but well below the 2021 peak environment. For operators pricing projects over the next 60 days, this correction window is historically one of the more favorable supply-agreement environments.",
      },
      {
        label: "Steel",
        body: "The PPI for steel mill products held at 284, down 0.4% week-over-week but still 8.7% above year-ago levels. Domestic capacity utilization at steel mills remained at 76%, above the historical 70% threshold that has preceded price declines in prior cycles. Infrastructure-driven demand from ongoing federal construction programs continues to absorb domestic output, limiting the downside in steel pricing. For operators using structural steel or steel framing, historical data from similar utilization environments suggests prices are likely to remain elevated through mid-year.",
      },
      {
        label: "Copper",
        body: "Global copper prices rose to $9,847/mt this week, up 2.1% and a 3-year high. The drivers are layered: Chinese grid expansion, domestic data-center construction demand for wiring, and below-target production from Codelco's Chilean operations. At the 92nd percentile of its 5-year range, copper is in historically expensive territory. Historical data shows that copper price increases exceeding 15% over a rolling 6-month window — current reading is +18.3% — typically produce full pass-through to electrical subcontractor bids within 45–60 days. Bids that include significant electrical scope may see subcontractor revisions in May.",
      },
      {
        label: "Diesel",
        body: "On-highway diesel settled at $3.94/gal nationally (EIA), down 1.8% on the week and at the 44th percentile of the 5-year range. For crews running 3–5 vehicles and equipment, historical patterns suggest fuel at current prices represents 6–9% of gross project cost on a 20-mile radius job. The current level is modestly favorable relative to the past 18 months. OPEC+ production decisions scheduled for May 5 are the primary near-term variable; prior similar decisions have moved diesel prices 3–6% within 30 days.",
      },
      {
        label: "Labor",
        body: "Average hourly earnings in construction rose to $34.24/hr in March (BLS), up 4.1% year-over-year, the 7th consecutive month above 4% YoY growth. Skilled trade wages — electricians, plumbers, HVAC — historically track 1.2–1.5x the general construction wage index, suggesting specialty subcontractor labor pressure may be running 5–6% YoY. Historical data from prior sustained 4%+ wage growth periods shows this level of labor cost pressure has coincided with increased subcontractor bid-win-rate volatility, as subs are more selective about which jobs they price competitively.",
      },
    ],
    demandSignal:
      "New privately-owned housing units authorized by building permits came in at 1,482,000 (SAAR) for March, down 3.2% from February and 6.8% below year-ago. The 30-year fixed mortgage rate held at 7.21% this week (Freddie Mac Primary Mortgage Market Survey). Historical data from the 2018–2019 rate environment — the last sustained period of 7%+ mortgage rates — shows a 9–12 month lag before residential contractor backlogs normalize downward, with renovation and remodel work historically holding 70–80% of volume while new-build pipelines thin. Total construction spending remained solid at $2,114B (SAAR), supported by non-residential and infrastructure categories. For small GCs with flexible portfolio mix, this environment has historically favored operators who can shift capacity toward renovation, commercial tenant improvement, and accessory dwelling units over new residential.",
    watchList: [
      {
        label: "USTR Section 232 Steel Review — May 15",
        body: "A tariff review on imported steel and aluminum is scheduled for May 15. Prior Section 232 tariff announcements of similar scope produced 8–12% domestic steel price spikes within 45 days of implementation. Historical data from the 2018 Section 232 implementation shows domestic remodelers with significant steel framing or structural steel exposure saw bid renegotiation requests increase 22% in the 30 days following the announcement. Operators with open bids containing structural steel should assess exposure.",
      },
      {
        label: "FOMC Meeting — May 7",
        body: "Markets are pricing a 62% probability of a hold at 5.25%. At current mortgage rates, each 25bps move in the federal funds rate has historically correlated with a 3.4% change in new residential permit applications within 60 days. A hold continues current demand suppression. A cut — even a single 25bps move — would likely produce measurable improvement in permit activity in Q3, based on historical lead/lag relationships from 2019 and 2023 rate-cycle turns.",
      },
      {
        label: "Codelco Copper Supply Guidance — Q2",
        body: "Codelco's Chilean production operations guided 3–5% below target for Q1 2026. If Q2 guidance follows suit, historical patterns from prior Codelco output shortfalls suggest another 8–12% copper price advance is possible within the next 60 days, as the global market has limited short-term alternative supply. Electrical subcontractors monitor this closely; bids pending their pricing should account for this risk.",
      },
    ],
    operatorActions: [
      "Operators in similar lumber price-correction environments have historically used the correction window to lock in supply agreements for 60–90 day forward delivery, capturing lower prices before seasonal spring construction demand restores upward pressure on framing materials.",
      "Historical data from prior copper price cycles shows subcontractors who issued revised electrical bid add-ons — copper escalation clauses — within the first 30 days of a sustained price advance captured 78% more margin than those who absorbed the cost into existing bid structures.",
      "In the 2018–2019 high-rate environment, residential contractors who explicitly shifted marketing and sales capacity toward renovation-over-new-build captured 40–60% more qualified leads per dollar of marketing spend vs. operators who maintained new-build positioning.",
      "When construction labor wages exceed 4% YoY for 6+ consecutive months, historical patterns show operators who invested in pre-apprentice training partnerships with local community colleges saw labor turnover rates 28% lower over the following year vs. those relying on open-market hiring alone.",
      "Diesel at the 44th percentile has historically represented a favorable window for fuel supply agreements. Operators who locked commercial fleet card or forward-fuel agreements at similar percentile readings averaged 12% fuel cost savings over the following 6-month period, based on EIA price data from the 2020 and 2023 favorable windows.",
    ],
  },
};

const RETAIL: IndustryContent = {
  slug: "retail",
  name: "Retail",
  heroHeadline: "You bought the season before the consumer sentiment report dropped.",
  heroSubheadline:
    "Stormline tracks cotton prices, freight rates, consumer sentiment, credit delinquencies, and real disposable income — then sends you a plain-English briefing every Monday before you place your next order. See the slowdown before it hits your floor.",
  personaDesc:
    "Built for single-store and small-chain operators with 5–25 employees who buy inventory 4–6 months ahead and feel every consumer shift in their foot traffic.",
  ctaText: "Start your 14-day free trial",
  tiles: [
    {
      label: "Cotton — Global Price",
      value: "81.4 ¢ / lb",
      weekDelta: "-3.2%",
      weekDeltaSign: "down",
      isCostInput: true,
      direction: "cost",
      source: "FRED (PCOTTINDUSDM)",
      percentile5yr: 39,
    },
    {
      label: "Container Freight (Asia–US)",
      value: "+22% YoY",
      weekDelta: "+4.8%",
      weekDeltaSign: "up",
      isCostInput: true,
      direction: "cost",
      source: "Drewry WCI (weekly)",
      percentile5yr: 61,
    },
    {
      label: "Consumer Sentiment",
      value: "67.8",
      weekDelta: "-4.3 pts",
      weekDeltaSign: "down",
      isCostInput: false,
      direction: "demand",
      source: "U. of Michigan (UMCSENT)",
      percentile5yr: 28,
    },
    {
      label: "Real Disposable Income",
      value: "$20,418B (chained)",
      weekDelta: "+0.6% MoM",
      weekDeltaSign: "up",
      isCostInput: false,
      direction: "demand",
      source: "FRED (DSPIC96)",
      percentile5yr: 55,
    },
    {
      label: "Personal Saving Rate",
      value: "4.2%",
      weekDelta: "+0.4 pts",
      weekDeltaSign: "up",
      isCostInput: false,
      direction: "cost",
      source: "FRED (PSAVERT)",
      percentile5yr: 42,
    },
    {
      label: "Credit Card Delinquency 30+",
      value: "3.4%",
      weekDelta: "+0.3 pts QoQ",
      weekDeltaSign: "up",
      isCostInput: false,
      direction: "cost",
      source: "NY Fed (Q1 2026 est.)",
      percentile5yr: 71,
    },
    {
      label: "Advance Retail Sales",
      value: "+0.4% MoM",
      weekDelta: "-0.2 pts",
      weekDeltaSign: "down",
      isCostInput: false,
      direction: "demand",
      source: "FRED (RSAFS)",
      percentile5yr: 46,
    },
    {
      label: "Unemployment Rate",
      value: "4.1%",
      weekDelta: "+0.1 pts",
      weekDeltaSign: "up",
      isCostInput: false,
      direction: "cost",
      source: "FRED (UNRATE)",
      percentile5yr: 38,
    },
    {
      label: "Retail Hourly Wage",
      value: "$21.14 / hr",
      weekDelta: "+3.8% YoY",
      weekDeltaSign: "up",
      isCostInput: true,
      direction: "cost",
      source: "BLS (CES4200000008)",
      percentile5yr: 68,
    },
    {
      label: "Consumer Credit Outstanding",
      value: "$5,182B",
      weekDelta: "+0.6%",
      weekDeltaSign: "up",
      isCostInput: false,
      direction: "cost",
      source: "FRED (TOTALSL)",
      percentile5yr: 82,
    },
  ],
  briefing: {
    weekOf: "April 14, 2026",
    headline:
      "Consumer sentiment at 3-month low; cotton easing on softer Chinese demand — but freight costs remain elevated and credit delinquencies are climbing.",
    inputCosts: [
      {
        label: "Cotton",
        body: "Global cotton prices fell to 81.4 cents/lb this week, down 3.2% on the month and sitting at the 39th percentile of the 5-year range. The decline reflects softer demand from Chinese apparel manufacturers and above-normal global acreage expectations for the 2026 crop. This is one of the more favorable signals in the current environment for apparel retailers. Historically, cotton price movements show a 4–6 month lead time to retail apparel input costs, given typical mill-to-shelf sourcing cycles. Operators currently negotiating Q3 and Q4 inventory contracts are entering what historical data suggests is a favorable pricing window.",
      },
      {
        label: "Freight (Container Rates)",
        body: "Spot container rates on the Asia–US West Coast lane rose 4.8% this week and remain 22% above year-ago levels. This diverges from the cotton signal: input fabric costs are softening, but the cost to move finished goods remains elevated. Historical data shows that sustained freight elevation exceeding 15% for 3+ months typically produces 2–4% input cost increases for independent apparel retailers sourcing from Asian factories, with peak impact landing 90–120 days from the rate move. Operators currently receiving spring inventory shipments are absorbing peak-freight-impacted unit costs; summer orders will depend on whether spot rates normalize.",
      },
      {
        label: "Labor",
        body: "Average hourly earnings in retail trade rose approximately 3.8% year-over-year (BLS, March). Independent retail operators with 5–15 employees have historically experienced 1.1–1.3x the national retail wage growth rate due to competitive pressure from QSR and warehouse employers in the same labor market. The current environment — where Amazon Fulfillment and DoorDash Dasher programs compete for part-time hours — has historically correlated with higher turnover among retail floor staff, which historical data shows costs 40–70% of an hourly employee's annual wage in combined recruiting, training, and ramp time.",
      },
    ],
    demandSignal:
      "University of Michigan Consumer Sentiment fell to 67.8 in April, the lowest since January and 6.2 points below the trailing 12-month average. Real disposable personal income grew only 0.6% in February (BEA), below the 12-month trailing average of 1.1%. The personal saving rate ticked up to 4.2%, a 6-month high — historically consistent with a consumer posture shift toward caution rather than spending. Total consumer credit outstanding held at $5,182B; 30+ day credit card delinquency rates rose to an estimated 3.4% for Q1 2026 (NY Fed), the highest since Q3 2019. The combination of falling sentiment, slowing income growth, rising savings, and rising delinquencies is a signal constellation that historical data from 2007–2008, 2015–2016, and 2019 associates with a 60–90 day lead into measurable independent retail traffic declines of 4–8%. Operators currently planning Q3 open-to-buy decisions are facing this data in real time.",
    watchList: [
      {
        label: "Advance Retail Sales — April 16",
        body: "March retail sales data releases Wednesday. The prior three months averaged +0.4% MoM. A reading below +0.2% MoM historically correlates with inventory markdown cycles among specialty independent retailers within 45 days, as national chains move first on clearance and competitive pressure cascades to independents. A strong reading above +0.6% would reframe the current sentiment data as a temporary blip rather than a trend.",
      },
      {
        label: "USTR Apparel Tariff Review — May 15",
        body: "Current Section 301 tariff exclusions for certain apparel HTS codes are scheduled for USTR review in May. Prior tariff reinstatements of similar scope produced 6–10% landed cost increases for independent retailers sourcing directly from China within 90 days of announcement. Operators currently booking Q4 inventory with China-based suppliers face meaningful uncertainty on landed cost until this review concludes.",
      },
      {
        label: "NY Fed Credit Data — Q2 Release (July)",
        body: "If Q2 Fed data shows credit card delinquency rates advancing past 3.6%, historical data from 2007–2008 and 2019 shows specialty apparel retail experiences meaningful SKU consolidation pressure in the 3–6 months following that threshold. Operators who preemptively reduced slow-moving inventory during the 3.4–3.6% window averaged 18% less markdown loss than those who held through the cycle peak. The May and June weeks will carry leading indicators on whether Q2 data is trending that direction.",
      },
    ],
    operatorActions: [
      "In prior periods when consumer sentiment fell below 68 alongside rising credit delinquencies, independent retail operators who shifted their open-to-buy toward faster-turning, lower price-point SKUs historically saw inventory turnover improve 1.3–1.7x over the following two quarters vs. those who maintained their existing SKU mix.",
      "Historical data from past freight-elevated cycles shows operators who booked import inventory 45–60 days earlier than their standard cycle captured freight rates 8–14% below spot during the subsequent seasonal demand peak, as spot rates typically spike ahead of the major shipping seasons.",
      "When real disposable income growth falls below 0.8% YoY and the personal saving rate rises simultaneously — the current reading matches this pattern — operators who shifted promotional cadence from quarterly to monthly historically maintained traffic 12–16% better than standard cadence operators over the following 6 months.",
      "Cotton at the 39th percentile of its 5-year range has historically represented a favorable window for longer-term fabric sourcing discussions with domestic distributors. Operators who committed to 6-month supply agreements at similar price percentiles averaged 9% lower blended fabric costs over the following year vs. those who continued spot purchasing.",
      "Operators in similar demand environments have historically used the consumer-caution window to renegotiate lease terms proactively, before their sales numbers deteriorate. Historical data shows landlord concession rates — rent abatements, tenant improvement allowances, lease shortening — average 15–22% more favorable during sentiment troughs than during expansions.",
    ],
  },
};

export const INDUSTRY_CONTENT: Record<string, IndustryContent> = {
  restaurants: RESTAURANTS,
  construction: CONSTRUCTION,
  retail: RETAIL,
};

export const VALID_SLUGS = ["restaurants", "construction", "retail"] as const;
export type ValidSlug = (typeof VALID_SLUGS)[number];
