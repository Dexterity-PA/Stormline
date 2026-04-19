/**
 * One-off verifier for the construction-200 candidate list.
 *
 * Hits /series/observations?limit=1 through node fetch (same pattern as
 * FredAdapter) to check whether a series_id resolves. Prints OK/MISS per
 * line so we can filter before encoding into the registry.
 *
 * Usage:
 *   FRED_API_KEY=... pnpm tsx scripts/verify-construction-series.ts
 */
const KEY = process.env.FRED_API_KEY;
if (!KEY) {
  console.error("Missing FRED_API_KEY");
  process.exit(1);
}

const CANDIDATES: string[] = [
  "WPU0811","WPU0812","WPU083","WPU0831","WPU0832","PCU321219321219",
  "PCU32121232121203","WPU0813","PCU321113321113","WPU081103",
  "WPU132","WPU133","WPU1331","WPU134","PCU327320327320","PCU327331327331",
  "PCU327390327390","PCU327310327310","PCU212321212321","WPU1322",
  "WPU1371","PCU327121327121","WPU137101",
  "WPU101704","WPU101706","WPU10170302","WPU10170502","WPU10170701",
  "WPU10230302","PCU332312332312","PCU332321332321","PCU331110331110",
  "WPU1026","WPU10260106",
  "WPU0586","PCU324122324122","WPU058601","PCU332322332322","WPU0586011",
  "WPU0586013","WPU0911","WPU0912","WPU0913","WPU09110101","WPU09110201",
  "PCU324122324122A","WPU0586012",
  "WPU1371020402","PCU327420327420","WPU1392","PCU327993327993",
  "PCU326150326150","WPU137103","PCU327420","WPU0531",
  "PCU3272113272110","PCU332321332321B","PCU321911321911","WPU08130103",
  "WPU08130106","PCU326199326199A","PCU327211327211","PCU332321332321A",
  "PCU321918321918","PCU326199326199C","PCU327120327120","WPU0383",
  "PCU314110314110","PCU327122327122",
  "WPU0621","PCU325510325510","WPU0641","PCU325520325520","WPU0711",
  "PCU331420331420","PCU326122326122","WPU10260203","PCU332913332913",
  "PCU335228335228",
  "PCU335931335931","PCU335932335932","PCU335313335313","PCU335911335911",
  "PCU331420331420B","PCU335122335122","PCU332618332618","PCU335110335110",
  "PCU333415333415","PCU333415333415A","PCU333414333414",
  "PCU332322332322B","PCU325120325120","PCU333912333912","WPU1175",
  "PCU333415333414",
  "PCU332722332722","PCU332510332510","WPU1085","PCU332721332721",
  "USCONS","CES2000000001","CES2023600001","CES2023610001","CES2023620001",
  "CES2023700001","CES2023800001","CES2023810001",
  "CES2023820001","CES2023821001","CES2023822001","CES2023830001",
  "CES2023890001","CES2023811001",
  "CES2000000003","CES2023600008","CES2023800008","CES2023820008",
  "CES2023700008","AWHAECON","ECICONWAG","CIU2012300000000A",
  "JTS230000JOL","JTS230000HIL","JTS230000QUL","JTS230000LDL",
  "JTS230000TSL","JTS230000QUR",
  "SMU48000002000000008","SMU48000002000000001",
  "SMU12000002000000008","SMU12000002000000001",
  "SMU06000002000000008","SMU06000002000000001",
  "SMU04000002000000008","SMU04000002000000001",
  "SMU37000002000000008","SMU37000002000000001",
  "LNS14000048",
  "HOUST1F","HOUST2F","HOUST5F","HOUSTNE","HOUSTMW","HOUSTS","HOUSTW",
  "PERMIT1","PERMIT5","PERMITNSA",
  "HSN1F","MSACSR","EXHOSLUSM495S","HOSSUPUSM673N","MEDLISPRI","HOUSSTA",
  "CSUSHPINSA","CSUSHPISA","USSTHPI","SPCS20RSA","SPCS10RSA",
  "DAXRSA","DAXRNSA","DFXRSA","MIXRSA","LXXRSA","PHXRSA","CRXRSA",
  "ATXRSA","TPXRSA","SFXRSA","CHXRSA","DNXRSA","BOXRSA","NYXRSA",
  "WDXRSA","SEXRSA","POXRSA","LVXRSA","MNXRSA","CEXRSA",
  "TLRESCONS","PRRESCONS","PNRESCONS","TLNRESCONS","PRIVRESIMPS",
  "MORTGAGE15US","MORTGAGE5US","OBMMIFHA30YF","OBMMIVA30YF","OBMMIJUMBO30YF",
  "DGS30","DGS2","SOFR","DPRIME",
  "RIFLPBCIANM48NM","TERMCBAUTO48NS","TERMCBCCALLNS","DRTSCILM",
  "MBAPURCHASE","MBAREFI","MORTGAGEAPPLICATIONS",
  "WPU057","WPU0573","DCOILWTICO",
];

type R = { id: string; ok: boolean; reason?: string; freq?: string; title?: string };

async function verify(id: string): Promise<R> {
  const url =
    `https://api.stlouisfed.org/fred/series?series_id=${encodeURIComponent(id)}` +
    `&api_key=${KEY}&file_type=json`;
  try {
    const r = await fetch(url);
    if (r.status === 200) {
      const j = (await r.json()) as { seriess?: Array<{ title: string; frequency_short: string }> };
      const s = j.seriess?.[0];
      return s
        ? { id, ok: true, title: s.title, freq: s.frequency_short }
        : { id, ok: false, reason: "no_series" };
    }
    if (r.status === 400) {
      const j = (await r.json().catch(() => ({}))) as { error_message?: string };
      return { id, ok: false, reason: j.error_message || "400" };
    }
    return { id, ok: false, reason: `status_${r.status}` };
  } catch (e) {
    return { id, ok: false, reason: `err_${(e as Error).message}` };
  }
}

async function main() {
  const out: R[] = [];
  for (const id of CANDIDATES) {
    const r = await verify(id);
    out.push(r);
    process.stderr.write(r.ok ? "." : r.reason?.startsWith("status_403") ? "!" : "x");
    // MEMORY: 1s between FRED calls, bail on 403 (shared-IP cooldown is 25 min).
    if (r.reason === "status_403") {
      process.stderr.write("\n403 — aborting to avoid extending the block.\n");
      break;
    }
    await new Promise((res) => setTimeout(res, 1000));
  }
  process.stderr.write("\n");
  console.log(JSON.stringify(out, null, 2));
}

void main();
