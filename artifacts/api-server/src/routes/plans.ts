import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, insurersTable, medigapPlansTable, zipCodesTable } from "@workspace/db";
import {
  GetPlansQueryParams,
  GetPlansSummaryQueryParams,
  GetZipInfoQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

// Age factor: Medigap premiums increase with age (attained-age rating)
// ~3% per year above baseline age 65
function ageFactor(age: number): number {
  const yearsAbove65 = Math.max(0, age - 65);
  return 1 + yearsAbove65 * 0.03;
}

const MARRIED_DISCOUNT_RATE = 0.07; // 7% household discount

// Plan letter definitions (static)
const PLAN_LETTER_DEFS = [
  {
    letter: "A",
    headline: "Basic Coverage",
    description:
      "Covers Part A hospital coinsurance and hospital costs, Part B coinsurance or copayments, and the first 3 pints of blood. This is the minimum standardized benefit all Medigap plans must include.",
    partACoinsurance: true,
    partBCoinsurance: true,
    partBDeductible: false,
    partADeductible: false,
    skilledNursing: false,
    foreignTravel: false,
    outOfPocketLimit: false,
    popularity: "Low",
  },
  {
    letter: "B",
    headline: "Basic + Part A Deductible",
    description:
      "Includes everything in Plan A, plus coverage for the Medicare Part A deductible (hospitalization). Good for those who want basic protection against major hospital costs.",
    partACoinsurance: true,
    partBCoinsurance: true,
    partBDeductible: false,
    partADeductible: true,
    skilledNursing: false,
    foreignTravel: false,
    outOfPocketLimit: false,
    popularity: "Low",
  },
  {
    letter: "D",
    headline: "Broad Coverage, No Part B Deductible",
    description:
      "Covers hospital costs, Part B coinsurance, Part A deductible, and skilled nursing facility care. Does not cover the Part B deductible. A solid mid-tier option.",
    partACoinsurance: true,
    partBCoinsurance: true,
    partBDeductible: false,
    partADeductible: true,
    skilledNursing: true,
    foreignTravel: true,
    outOfPocketLimit: false,
    popularity: "Low",
  },
  {
    letter: "F",
    headline: "Most Comprehensive (Pre-2020 Enrollees Only)",
    description:
      "The only plan that covers the Medicare Part B deductible along with virtually all Medicare cost-sharing. Only available to those who became eligible for Medicare before January 1, 2020.",
    partACoinsurance: true,
    partBCoinsurance: true,
    partBDeductible: true,
    partADeductible: true,
    skilledNursing: true,
    foreignTravel: true,
    outOfPocketLimit: false,
    popularity: "High (legacy)",
  },
  {
    letter: "G",
    headline: "Most Popular Comprehensive Plan",
    description:
      "Covers almost everything Plan F covers, except the Part B deductible ($240 in 2024). After meeting that deductible, you pay nothing else for Medicare-covered services. The most popular plan for new enrollees.",
    partACoinsurance: true,
    partBCoinsurance: true,
    partBDeductible: false,
    partADeductible: true,
    skilledNursing: true,
    foreignTravel: true,
    outOfPocketLimit: false,
    popularity: "Very High",
  },
  {
    letter: "K",
    headline: "Lower Premium, 50% Cost-Sharing",
    description:
      "Pays 50% of most cost-sharing items and includes an out-of-pocket spending limit. Once you reach the limit, Medigap pays 100% of covered services. Lower premiums make it attractive for healthy beneficiaries.",
    partACoinsurance: true,
    partBCoinsurance: true,
    partBDeductible: false,
    partADeductible: true,
    skilledNursing: true,
    foreignTravel: false,
    outOfPocketLimit: true,
    popularity: "Moderate",
  },
  {
    letter: "L",
    headline: "Lower Premium, 75% Cost-Sharing",
    description:
      "Similar to Plan K but covers 75% of cost-sharing instead of 50%. Still includes an out-of-pocket limit. A middle ground between Plan K and more comprehensive options.",
    partACoinsurance: true,
    partBCoinsurance: true,
    partBDeductible: false,
    partADeductible: true,
    skilledNursing: true,
    foreignTravel: false,
    outOfPocketLimit: true,
    popularity: "Low",
  },
  {
    letter: "M",
    headline: "Covers 50% of Part A Deductible",
    description:
      "Covers Part B coinsurance, Part A hospital coinsurance, skilled nursing care, and 50% of the Part A deductible. Does not cover Part B deductible. Premiums are lower than Plan G.",
    partACoinsurance: true,
    partBCoinsurance: true,
    partBDeductible: false,
    partADeductible: false,
    skilledNursing: true,
    foreignTravel: true,
    outOfPocketLimit: false,
    popularity: "Low",
  },
  {
    letter: "N",
    headline: "Lower Premium, Small Copays",
    description:
      "Covers most gaps but requires copays for some office visits (up to $20) and emergency room visits ($50 if not admitted). No Part B deductible or Part B excess charges coverage. A budget-friendly option for those who don't see specialists often.",
    partACoinsurance: true,
    partBCoinsurance: true,
    partBDeductible: false,
    partADeductible: true,
    skilledNursing: true,
    foreignTravel: true,
    outOfPocketLimit: false,
    popularity: "High",
  },
];

// GET /plans
router.get("/plans", async (req, res): Promise<void> => {
  const parsed = GetPlansQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { zip, age, married, planLetter, sortBy } = parsed.data;

  // Look up zip
  const [zipRecord] = await db
    .select()
    .from(zipCodesTable)
    .where(eq(zipCodesTable.zip, zip))
    .limit(1);

  const costMultiplier = zipRecord?.costMultiplier ?? 1.0;
  const factor = ageFactor(age) * costMultiplier;

  // Fetch all plans with insurer data
  const rows = await db
    .select({
      plan: medigapPlansTable,
      insurer: insurersTable,
    })
    .from(medigapPlansTable)
    .innerJoin(insurersTable, eq(medigapPlansTable.insurerId, insurersTable.id));

  let results = rows
    .filter((r) => !planLetter || r.plan.planLetter === planLetter)
    .map((r) => {
      const base = r.plan.basePremium * factor;
      const discount = married && r.plan.marriedDiscount ? MARRIED_DISCOUNT_RATE : 0;
      const monthlyPremium = Math.round(base * (1 - discount) * 100) / 100;
      return {
        id: r.plan.id,
        insurerName: r.insurer.name,
        planLetter: r.plan.planLetter,
        monthlyPremium,
        annualDeductible: r.plan.annualDeductible,
        outOfPocketLimit: r.plan.outOfPocketLimit,
        amBestRating: r.insurer.amBestRating,
        moodyRating: r.insurer.moodyRating,
        yearsInBusiness: r.insurer.yearsInBusiness,
        marriedDiscount: r.plan.marriedDiscount,
        notes: r.plan.notes,
        planType: r.plan.planType,
        partBDeductibleCovered: r.plan.partBDeductibleCovered,
        foreignTravelCovered: r.plan.foreignTravelCovered,
      };
    });

  // Sort
  if (sortBy === "premium-desc") {
    results.sort((a, b) => b.monthlyPremium - a.monthlyPremium);
  } else if (sortBy === "insurer") {
    results.sort((a, b) => a.insurerName.localeCompare(b.insurerName));
  } else {
    // default: premium-asc
    results.sort((a, b) => a.monthlyPremium - b.monthlyPremium);
  }

  res.json(results);
});

// GET /plans/summary
router.get("/plans/summary", async (req, res): Promise<void> => {
  const parsed = GetPlansSummaryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { zip, age, married } = parsed.data;

  const [zipRecord] = await db
    .select()
    .from(zipCodesTable)
    .where(eq(zipCodesTable.zip, zip))
    .limit(1);

  const costMultiplier = zipRecord?.costMultiplier ?? 1.0;
  const factor = ageFactor(age) * costMultiplier;

  const rows = await db
    .select({
      plan: medigapPlansTable,
      insurer: insurersTable,
    })
    .from(medigapPlansTable)
    .innerJoin(insurersTable, eq(medigapPlansTable.insurerId, insurersTable.id));

  const premiums = rows.map((r) => {
    const base = r.plan.basePremium * factor;
    const discount = married && r.plan.marriedDiscount ? MARRIED_DISCOUNT_RATE : 0;
    return {
      letter: r.plan.planLetter,
      monthlyPremium: Math.round(base * (1 - discount) * 100) / 100,
    };
  });

  if (premiums.length === 0) {
    res.json({
      state: zipRecord?.state ?? "Unknown",
      county: zipRecord?.county ?? "Unknown",
      totalPlans: 0,
      lowestPremium: 0,
      highestPremium: 0,
      medianPremium: 0,
      byLetter: [],
      popularPlanLetter: "G",
    });
    return;
  }

  const allPremiums = premiums.map((p) => p.monthlyPremium).sort((a, b) => a - b);
  const mid = Math.floor(allPremiums.length / 2);
  const medianPremium =
    allPremiums.length % 2 === 0
      ? (allPremiums[mid - 1] + allPremiums[mid]) / 2
      : allPremiums[mid];

  // Group by letter
  const letterMap = new Map<string, number[]>();
  for (const p of premiums) {
    if (!letterMap.has(p.letter)) letterMap.set(p.letter, []);
    letterMap.get(p.letter)!.push(p.monthlyPremium);
  }

  const byLetter = Array.from(letterMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, vals]) => {
      const sorted = [...vals].sort((a, b) => a - b);
      return {
        letter,
        count: vals.length,
        minPremium: Math.round(sorted[0] * 100) / 100,
        maxPremium: Math.round(sorted[sorted.length - 1] * 100) / 100,
        avgPremium: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100,
      };
    });

  // Most popular by count of insurers offering it
  const popularLetter = [...letterMap.entries()].sort(
    ([, a], [, b]) => b.length - a.length
  )[0]?.[0] ?? "G";

  res.json({
    state: zipRecord?.state ?? "Unknown",
    county: zipRecord?.county ?? "Unknown",
    totalPlans: premiums.length,
    lowestPremium: Math.round(allPremiums[0] * 100) / 100,
    highestPremium: Math.round(allPremiums[allPremiums.length - 1] * 100) / 100,
    medianPremium: Math.round(medianPremium * 100) / 100,
    byLetter,
    popularPlanLetter: popularLetter,
  });
});

// GET /plans/letters
router.get("/plans/letters", async (_req, res): Promise<void> => {
  res.json(PLAN_LETTER_DEFS);
});

// GET /plans/zip-info
router.get("/plans/zip-info", async (req, res): Promise<void> => {
  const parsed = GetZipInfoQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { zip } = parsed.data;

  const [zipRecord] = await db
    .select()
    .from(zipCodesTable)
    .where(eq(zipCodesTable.zip, zip))
    .limit(1);

  if (!zipRecord) {
    res.status(404).json({ error: "Zip code not found" });
    return;
  }

  res.json({
    zip: zipRecord.zip,
    city: zipRecord.city,
    state: zipRecord.state,
    stateCode: zipRecord.stateCode,
    county: zipRecord.county,
    region: zipRecord.region,
  });
});

export default router;
