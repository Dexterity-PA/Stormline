/**
 * One-off: verify candidate FRED series IDs exist.
 * Hits FRED /series metadata endpoint. Valid ID → 200 with {seriess:[...]}.
 * Invalid ID → 400 with error_code 45.
 *
 * Run: npx tsx scripts/verify-retail-ids.ts
 */
import "dotenv/config";

const ids = [
  // Group A
  "RSBMGESD", "RSMSR", "MRTSIR44X72USS", "MRTSSM44X72USS", "UMCSENT1", "TOTALNSA", "HNWSA",
  // Group B — CES retail subsector employment
  "CES4244100001", "CES4244300001", "CES4244200001", "CES4245100001", "CES4244900001",
  "CES4244600001", "CES4245200001", "CES4244700001", "CES4245400001", "CES4200000001",
  "CES4348100001", "CES4244100008", "CES4245200008",
  "CES4200000003", "CES4200000002", "CES4200000011",
  "USTRADE",
  // JOLTS
  "JTS4400JOL", "JTS4400HIL", "JTS4400QUL", "JTS4400TSL", "JTS4400LDL",
  // Warehouse/transport
  "CES4349300001", "CES4349300008", "CES4349200001", "CES4349200008", "USTPU",
  // Macro labor
  "AWHAETP", "CES0500000003", "CES0500000008", "CIVPART", "EMRATIO",
  // Consumer credit/inventory
  "REVOLSL", "NONREVSL", "DRCCLACBS", "CORCCACBS", "DRCLACBS", "CCLACBW027SBOG",
  "TERMCBCCALLNS", "TERMCBCCINTNS", "RETAILIMSA", "RETAILIRSA", "ISRATIO", "BUSINV",
  // PCE / income
  "DSPI", "PCE", "PCEC96", "PCEDG", "PCEND", "PCES", "W875RX1", "PI",
  // Discretionary
  "DGORDER", "NEWORDER", "ACOGNO", "AMTMNO", "TOTALSA", "RRSFS", "CMRMTSPL",
  // HH balance sheet
  "TDSP", "FODSP",
  // Sentiment
  "MICH", "CSCICP03USM665S", "USSLIND",
  // Retail sales
  "RSXFS", "RSCCAS", "RSEAS", "RSSGHBMS", "RSFHFS", "RSGMS", "RSDBS", "RSNSR",
  "RSFSDP", "RSHPCS", "RSMVPD", "RSGASS",
  // Min wage
  "FEDMINNFRWG", "STTMINWGCA",
  // Group D — apparel PPI (canonical WPU rollups)
  "WPU0381", "WPU03810311", "WPU03810312", "WPU03810313",
  "WPU0422", "WPU0423", "WPU012302", "WPU0511", "WPU012304",
  // Group E — CPI apparel
  "CPIAPPSL", "CUSR0000SAA", "CUSR0000SAA1", "CUSR0000SAA2",
  // Electronics
  "WPU1178", "PCU334334", "CUSR0000SEEE", "CUSR0000SEEE01", "CUSR0000SEEE02",
  // Furniture
  "WPU121", "WPU1211", "CUSR0000SAH3", "PCU337337", "CUSR0000SEHJ",
  // Toys
  "WPU1394", "WPU1395", "WPU1511", "CUSR0000SERA", "CUSR0000SEGA", "WPU1392", "WPU159402",
  // Packaging
  "WPU0911", "WPU0915", "WPU072", "WPU0913", "WPU1312", "WPU1381",
  // Import prices
  "IR", "IR400", "IRC", "IRMEXICO", "CHNTOT", "MEXTOT", "IQ", "IQAG",
  // Logistics
  "GASDESW", "DCOILWTICO", "DCOILBRENTEU", "WJFUELUSGULF",
  "PCU484484", "PCU4841214841212", "PCU4841224841221", "PCU482482",
  "PCU493493", "PCU492492", "PCU491491", "PCU4911149111",
  "RAILFRTINTERMODAL", "TRUCKD11", "TSIFRGHTM", "CAURFRGTD11",
  "WAREHUSQ176N", "CUUR0000SEHC",
  "IMPCH",
  // Real estate
  "CUUR0000SEHA", "CUUR0000SEHC01", "CUUR0000SAH",
  "PCU5311153111", "PCU531120531120", "WPU3911",
  "CSUSHPINSA", "CSUSHPISA", "SPCS20RSA",
  "TLCOMCONS", "PRRESCONS", "TLPRVCONS",
  "CRELNS", "DRTSCLCC", "BOGZ1FL075035503Q", "ASPUS", "MSPUS",
  // Financing
  "SOFR", "DPRIME", "DCPF3M", "DCPN3M",
  "BAMLC0A0CM", "BAMLC0A4CBBB",
  "DRTSCILM", "DRTSCIS", "DRISCFLM",
  "T10Y2Y", "T10Y3M",
  "H8B1058NCBCMG", "BUSLOANS", "TOTLL", "SBIS",
  // E-comm
  "ECOMPCTNSA", "ECOMPCTSA", "ECOMSA", "ECOMNSA",
  "CUSR0000SS27053", "PCU518210518210", "PCU541810541810",
];

async function main() {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    console.error("FRED_API_KEY not set");
    process.exit(1);
  }

  const unique = Array.from(new Set(ids));
  console.error(`Verifying ${unique.length} IDs...`);

  const results: Array<{
    id: string;
    ok: boolean;
    title?: string;
    frequency?: string;
    note?: string;
  }> = [];

  // Serial with small delay to respect FRED rate limits (120 req/min default).
  for (const id of unique) {
    const url = `https://api.stlouisfed.org/fred/series?series_id=${encodeURIComponent(id)}&api_key=${apiKey}&file_type=json`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = (await res.json()) as {
          seriess?: Array<{
            id: string;
            title: string;
            frequency_short: string;
            last_updated?: string;
            realtime_end?: string;
          }>;
        };
        const s = json.seriess?.[0];
        if (s) {
          results.push({
            id,
            ok: true,
            title: s.title,
            frequency: s.frequency_short,
            note: s.realtime_end ?? "",
          });
        } else {
          results.push({ id, ok: false, note: "empty_seriess" });
        }
      } else {
        // Hard-stop on 403: the shared egress IP is blocked by Akamai.
        // Do NOT retry — the cooldown is ~25 min. See feedback_fred_rate_limits memory.
        if (res.status === 403) {
          console.error(`\nABORT: FRED returned 403 on ${id}. IP is blocked. Wait ≥25 min before retrying.`);
          console.error(`Partial results: ${results.length} of ${unique.length} checked.`);
          break;
        }
        const body = await res.text();
        const m = /error_code":(\d+),"error_message":"([^"]+)"/.exec(body);
        results.push({
          id,
          ok: false,
          note: m ? `${m[1]}: ${m[2]}` : `http_${res.status}`,
        });
      }
    } catch (err) {
      results.push({ id, ok: false, note: `err: ${(err as Error).message}` });
    }
    // Throttle: 1s between calls. Akamai 403s the shared egress IP on bursts.
    // If a 403 appears, stop immediately — do not retry; the IP-level cooldown is ~25 min.
    await new Promise((r) => setTimeout(r, 1000));
  }

  const ok = results.filter((r) => r.ok);
  const bad = results.filter((r) => !r.ok);

  console.log(`\n=== OK (${ok.length}) ===`);
  for (const r of ok) {
    console.log(`  ${r.id.padEnd(22)} [${r.frequency}] ${r.title}`);
  }
  console.log(`\n=== BAD (${bad.length}) ===`);
  for (const r of bad) {
    console.log(`  ${r.id.padEnd(22)} ${r.note}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
