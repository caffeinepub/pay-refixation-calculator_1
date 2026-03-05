// ============================================================
// Pay Refixation Calculator — Calculation Engine
// Government of India, as per Supreme Court Judgment
// ============================================================

import {
  FIFTH_CPC_DA_RATES,
  type FifthCPCScale,
  SEVENTH_CPC_DA_RATES,
  SIXTH_CPC_DA_RATES,
  type SeventhCPCLevel,
  type SixthCPCPayBand,
  getFifthCPCTA,
  getSeventhCPCTA,
  getSixthCPCTA,
} from "./data/payScales";

export type CPCEra = "5th" | "6th" | "7th";

export interface PayRow {
  year: number;
  era: CPCEra;
  isRefixedYear: boolean;

  // Due amounts (calculated)
  dueBasic: number;
  dueDA: number;
  dueTA: number;
  dueTotal: number;

  // Drawn amounts (user-editable, defaults to due)
  drawnBasic: number;
  drawnDA: number;
  drawnTA: number;
  drawnTotal: number;

  // Difference
  difference: number;

  // Metadata
  daRate: number;
  gradePay?: number;
  level?: number;
}

export interface CalculationResult {
  rows: PayRow[];

  // Summary
  fifthCPCPayAt2005: number;
  sixthCPCRefixedAt2006: number;
  seventhCPCRefixedAt2016: number;

  // Arrears
  totalArrears: number;
  basicArrears: number;
  daArrears: number;
  taArrears: number;
  fifthCPCPeriodArrears: number;
  sixthCPCPeriodArrears: number;
  seventhCPCPeriodArrears: number;
}

// -------------------------------------------------------
// Helper: Apply 5th CPC annual increment
// -------------------------------------------------------
function applyFifthCPCIncrement(basic: number, scale: FifthCPCScale): number {
  if (scale.increment === 0) return basic; // fixed pay

  // Determine which stage we're in
  let currentBasic = basic;
  for (const stage of scale.stages) {
    if (currentBasic < stage.upTo) {
      // We're in this stage
      const next = currentBasic + stage.increment;
      return Math.min(next, stage.upTo);
    }
  }
  return basic; // already at max
}

// -------------------------------------------------------
// Helper: Round up to nearest n
// -------------------------------------------------------
function roundUpTo(value: number, nearest: number): number {
  if (nearest === 0) return value;
  return Math.ceil(value / nearest) * nearest;
}

// -------------------------------------------------------
// Main calculation function
// -------------------------------------------------------
export function calculatePayProgression(
  basicPayAtAppointment: number,
  fifthCpcScale: FifthCPCScale,
  sixthCpcPayBand: SixthCPCPayBand,
  sixthCpcGradePay: number,
  seventhCpcLevel: SeventhCPCLevel,
  overrides?: {
    sixthCPCRefixOverride?: number;
    seventhCPCRefixOverride?: number;
    drawnOverrides?: Record<
      number,
      { basic?: number; da?: number; ta?: number }
    >;
  },
): CalculationResult {
  const rows: PayRow[] = [];
  const currentYear = new Date().getFullYear();

  // ====================================================
  // 5th CPC period: 1998–2005
  // ====================================================
  let basic5th = basicPayAtAppointment;
  // Clamp to scale min/max
  basic5th = Math.max(basic5th, fifthCpcScale.min);
  basic5th = Math.min(basic5th, fifthCpcScale.max);

  for (let year = 1998; year <= 2005; year++) {
    const daRate = FIFTH_CPC_DA_RATES[year] ?? 0;
    const da = Math.round((basic5th * daRate) / 100);
    const ta = getFifthCPCTA(basic5th);
    const total = basic5th + da + ta;

    const drawn = overrides?.drawnOverrides?.[year];
    const drawnBasic = drawn?.basic ?? basic5th;
    const drawnDA = drawn?.da ?? da;
    const drawnTA = drawn?.ta ?? ta;
    const drawnTotal = drawnBasic + drawnDA + drawnTA;

    rows.push({
      year,
      era: "5th",
      isRefixedYear: false,
      dueBasic: basic5th,
      dueDA: da,
      dueTA: ta,
      dueTotal: total,
      drawnBasic,
      drawnDA,
      drawnTA,
      drawnTotal,
      difference: total - drawnTotal,
      daRate,
    });

    // Apply increment at end of year (for next year's pay)
    if (year < 2005) {
      basic5th = applyFifthCPCIncrement(basic5th, fifthCpcScale);
    }
  }

  const fifthCPCPayAt2005 = basic5th;

  // ====================================================
  // 6th CPC refixation (2006)
  // ====================================================
  let basic6th: number;
  if (overrides?.sixthCPCRefixOverride !== undefined) {
    basic6th = overrides.sixthCPCRefixOverride;
  } else {
    const rawRefixed = fifthCPCPayAt2005 * 1.86;
    basic6th = roundUpTo(rawRefixed, 10);
    // Ensure minimum of pay band
    basic6th = Math.max(basic6th, sixthCpcPayBand.min);
  }

  const sixthCPCRefixedAt2006 = basic6th;

  // ====================================================
  // 6th CPC period: 2006–2015
  // ====================================================
  for (let year = 2006; year <= 2015; year++) {
    const daRate = SIXTH_CPC_DA_RATES[year] ?? 0;
    const da = Math.round((basic6th * daRate) / 100);
    const ta = getSixthCPCTA(basic6th + sixthCpcGradePay);
    const total = basic6th + da + ta;

    const drawn = overrides?.drawnOverrides?.[year];
    const drawnBasic = drawn?.basic ?? basic6th;
    const drawnDA = drawn?.da ?? da;
    const drawnTA = drawn?.ta ?? ta;
    const drawnTotal = drawnBasic + drawnDA + drawnTA;

    rows.push({
      year,
      era: "6th",
      isRefixedYear: year === 2006,
      dueBasic: basic6th,
      dueDA: da,
      dueTA: ta,
      dueTotal: total,
      drawnBasic,
      drawnDA,
      drawnTA,
      drawnTotal,
      difference: total - drawnTotal,
      daRate,
      gradePay: sixthCpcGradePay,
    });

    // Apply 6th CPC increment (July each year, so next year)
    if (year < 2015) {
      const increment = roundUpTo((basic6th + sixthCpcGradePay) * 0.03, 10);
      basic6th = Math.min(basic6th + increment, sixthCpcPayBand.max);
    }
  }

  const sixthCPCBasicAt2015 = basic6th;

  // ====================================================
  // 7th CPC refixation (2016)
  // ====================================================
  let basic7th: number;
  if (overrides?.seventhCPCRefixOverride !== undefined) {
    basic7th = overrides.seventhCPCRefixOverride;
  } else {
    const rawRefixed7 = sixthCPCBasicAt2015 * 2.57;
    basic7th = roundUpTo(rawRefixed7, 100);
    // Ensure minimum of level
    basic7th = Math.max(basic7th, seventhCpcLevel.minPay);
  }

  const seventhCPCRefixedAt2016 = basic7th;

  // ====================================================
  // 7th CPC period: 2016–current
  // ====================================================
  for (let year = 2016; year <= currentYear; year++) {
    const daRate =
      SEVENTH_CPC_DA_RATES[year] ?? SEVENTH_CPC_DA_RATES[2025] ?? 55;
    const da = Math.round((basic7th * daRate) / 100);
    const ta = getSeventhCPCTA(seventhCpcLevel.level);
    const total = basic7th + da + ta;

    const drawn = overrides?.drawnOverrides?.[year];
    const drawnBasic = drawn?.basic ?? basic7th;
    const drawnDA = drawn?.da ?? da;
    const drawnTA = drawn?.ta ?? ta;
    const drawnTotal = drawnBasic + drawnDA + drawnTA;

    rows.push({
      year,
      era: "7th",
      isRefixedYear: year === 2016,
      dueBasic: basic7th,
      dueDA: da,
      dueTA: ta,
      dueTotal: total,
      drawnBasic,
      drawnDA,
      drawnTA,
      drawnTotal,
      difference: total - drawnTotal,
      daRate,
      level: seventhCpcLevel.level,
    });

    // Apply 7th CPC increment (July each year, next year)
    if (year < currentYear) {
      const increment = roundUpTo(basic7th * 0.03, 100);
      basic7th += increment;
    }
  }

  // ====================================================
  // Arrears computation
  // ====================================================
  let totalArrears = 0;
  let basicArrears = 0;
  let daArrears = 0;
  let taArrears = 0;
  let fifthCPCPeriodArrears = 0;
  let sixthCPCPeriodArrears = 0;
  let seventhCPCPeriodArrears = 0;

  for (const row of rows) {
    if (row.difference > 0) {
      totalArrears += row.difference;
      basicArrears += Math.max(0, row.dueBasic - row.drawnBasic);
      daArrears += Math.max(0, row.dueDA - row.drawnDA);
      taArrears += Math.max(0, row.dueTA - row.drawnTA);

      if (row.era === "5th") fifthCPCPeriodArrears += row.difference;
      if (row.era === "6th") sixthCPCPeriodArrears += row.difference;
      if (row.era === "7th") seventhCPCPeriodArrears += row.difference;
    }
  }

  return {
    rows,
    fifthCPCPayAt2005,
    sixthCPCRefixedAt2006,
    seventhCPCRefixedAt2016,
    totalArrears,
    basicArrears,
    daArrears,
    taArrears,
    fifthCPCPeriodArrears,
    sixthCPCPeriodArrears,
    seventhCPCPeriodArrears,
  };
}

// -------------------------------------------------------
// Recalculate totals from current drawn values
// -------------------------------------------------------
export function recomputeArrears(rows: PayRow[]): {
  totalArrears: number;
  basicArrears: number;
  daArrears: number;
  taArrears: number;
  fifthCPCPeriodArrears: number;
  sixthCPCPeriodArrears: number;
  seventhCPCPeriodArrears: number;
} {
  let totalArrears = 0;
  let basicArrears = 0;
  let daArrears = 0;
  let taArrears = 0;
  let fifthCPCPeriodArrears = 0;
  let sixthCPCPeriodArrears = 0;
  let seventhCPCPeriodArrears = 0;

  for (const row of rows) {
    const diff = row.dueTotal - row.drawnTotal;
    if (diff > 0) {
      totalArrears += diff;
      basicArrears += Math.max(0, row.dueBasic - row.drawnBasic);
      daArrears += Math.max(0, row.dueDA - row.drawnDA);
      taArrears += Math.max(0, row.dueTA - row.drawnTA);

      if (row.era === "5th") fifthCPCPeriodArrears += diff;
      if (row.era === "6th") sixthCPCPeriodArrears += diff;
      if (row.era === "7th") seventhCPCPeriodArrears += diff;
    }
  }

  return {
    totalArrears,
    basicArrears,
    daArrears,
    taArrears,
    fifthCPCPeriodArrears,
    sixthCPCPeriodArrears,
    seventhCPCPeriodArrears,
  };
}

// -------------------------------------------------------
// Format number as Indian currency
// -------------------------------------------------------
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
}
