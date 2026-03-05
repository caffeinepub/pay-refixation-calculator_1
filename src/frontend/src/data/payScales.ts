// ============================================================
// Pay Refixation Calculator — Data Constants
// Government of India, as per Supreme Court Judgment
// ============================================================

// -------------------------------------------------------
// 5th CPC Pay Scales (S-1 through S-34)
// -------------------------------------------------------
export interface PayScaleStage {
  upTo: number;
  increment: number;
}

export interface FifthCPCScale {
  id: string;
  label: string;
  min: number;
  increment: number; // primary increment (or 0 for fixed)
  max: number;
  stages: PayScaleStage[]; // multi-stage: [{upTo, increment}, ...]
  description?: string;
}

export const FIFTH_CPC_SCALES: FifthCPCScale[] = [
  {
    id: "S-1",
    label: "S-1: 2550-55-3200",
    min: 2550,
    increment: 55,
    max: 3200,
    stages: [{ upTo: 3200, increment: 55 }],
  },
  {
    id: "S-2",
    label: "S-2: 2610-60-3150-65-3540",
    min: 2610,
    increment: 60,
    max: 3540,
    stages: [
      { upTo: 3150, increment: 60 },
      { upTo: 3540, increment: 65 },
    ],
  },
  {
    id: "S-3",
    label: "S-3: 2650-65-3300-70-4000",
    min: 2650,
    increment: 65,
    max: 4000,
    stages: [
      { upTo: 3300, increment: 65 },
      { upTo: 4000, increment: 70 },
    ],
  },
  {
    id: "S-4",
    label: "S-4: 2750-70-3800-75-4400",
    min: 2750,
    increment: 70,
    max: 4400,
    stages: [
      { upTo: 3800, increment: 70 },
      { upTo: 4400, increment: 75 },
    ],
  },
  {
    id: "S-5",
    label: "S-5: 3050-75-3950-80-4590",
    min: 3050,
    increment: 75,
    max: 4590,
    stages: [
      { upTo: 3950, increment: 75 },
      { upTo: 4590, increment: 80 },
    ],
  },
  {
    id: "S-6",
    label: "S-6: 3200-80-4480",
    min: 3200,
    increment: 80,
    max: 4480,
    stages: [{ upTo: 4480, increment: 80 }],
  },
  {
    id: "S-7",
    label: "S-7: 3700-85-4510-100-5510",
    min: 3700,
    increment: 85,
    max: 5510,
    stages: [
      { upTo: 4510, increment: 85 },
      { upTo: 5510, increment: 100 },
    ],
    description: "Lower Division Clerk etc.",
  },
  {
    id: "S-8",
    label: "S-8: 4000-100-6000",
    min: 4000,
    increment: 100,
    max: 6000,
    stages: [{ upTo: 6000, increment: 100 }],
  },
  {
    id: "S-9",
    label: "S-9: 4500-125-7000",
    min: 4500,
    increment: 125,
    max: 7000,
    stages: [{ upTo: 7000, increment: 125 }],
    description: "Most common scale",
  },
  {
    id: "S-10",
    label: "S-10: 5000-150-8000",
    min: 5000,
    increment: 150,
    max: 8000,
    stages: [{ upTo: 8000, increment: 150 }],
  },
  {
    id: "S-11",
    label: "S-11: 5500-175-9000",
    min: 5500,
    increment: 175,
    max: 9000,
    stages: [{ upTo: 9000, increment: 175 }],
  },
  {
    id: "S-12",
    label: "S-12: 6500-200-10500",
    min: 6500,
    increment: 200,
    max: 10500,
    stages: [{ upTo: 10500, increment: 200 }],
  },
  {
    id: "S-13",
    label: "S-13: 7450-225-11500",
    min: 7450,
    increment: 225,
    max: 11500,
    stages: [{ upTo: 11500, increment: 225 }],
  },
  {
    id: "S-14",
    label: "S-14: 7500-250-12000",
    min: 7500,
    increment: 250,
    max: 12000,
    stages: [{ upTo: 12000, increment: 250 }],
  },
  {
    id: "S-15",
    label: "S-15: 8000-275-13500",
    min: 8000,
    increment: 275,
    max: 13500,
    stages: [{ upTo: 13500, increment: 275 }],
  },
  {
    id: "S-16",
    label: "S-16: 9000 (Fixed)",
    min: 9000,
    increment: 0,
    max: 9000,
    stages: [{ upTo: 9000, increment: 0 }],
    description: "Fixed pay, no increment",
  },
  {
    id: "S-17",
    label: "S-17: 9000-300-15000",
    min: 9000,
    increment: 300,
    max: 15000,
    stages: [{ upTo: 15000, increment: 300 }],
  },
  {
    id: "S-18",
    label: "S-18: 10000-325-15200",
    min: 10000,
    increment: 325,
    max: 15200,
    stages: [{ upTo: 15200, increment: 325 }],
  },
  {
    id: "S-19",
    label: "S-19: 10650-325-15850",
    min: 10650,
    increment: 325,
    max: 15850,
    stages: [{ upTo: 15850, increment: 325 }],
  },
  {
    id: "S-20",
    label: "S-20: 11000-325-15200",
    min: 11000,
    increment: 325,
    max: 15200,
    stages: [{ upTo: 15200, increment: 325 }],
  },
  {
    id: "S-21",
    label: "S-21: 11500-350-14000",
    min: 11500,
    increment: 350,
    max: 14000,
    stages: [{ upTo: 14000, increment: 350 }],
  },
  {
    id: "S-22",
    label: "S-22: 12000-375-18000",
    min: 12000,
    increment: 375,
    max: 18000,
    stages: [{ upTo: 18000, increment: 375 }],
  },
  {
    id: "S-23",
    label: "S-23: 12750-375-18750",
    min: 12750,
    increment: 375,
    max: 18750,
    stages: [{ upTo: 18750, increment: 375 }],
  },
  {
    id: "S-24",
    label: "S-24: 14300-400-18300",
    min: 14300,
    increment: 400,
    max: 18300,
    stages: [{ upTo: 18300, increment: 400 }],
  },
  {
    id: "S-25",
    label: "S-25: 15100-400-18300",
    min: 15100,
    increment: 400,
    max: 18300,
    stages: [{ upTo: 18300, increment: 400 }],
  },
  {
    id: "S-26",
    label: "S-26: 16400-450-20900",
    min: 16400,
    increment: 450,
    max: 20900,
    stages: [{ upTo: 20900, increment: 450 }],
    description: "HAG-equivalent start",
  },
  {
    id: "S-27",
    label: "S-27: 16400-450-20900 (Alt)",
    min: 16400,
    increment: 450,
    max: 20900,
    stages: [{ upTo: 20900, increment: 450 }],
  },
  {
    id: "S-28",
    label: "S-28: 18400-500-22400",
    min: 18400,
    increment: 500,
    max: 22400,
    stages: [{ upTo: 22400, increment: 500 }],
  },
  {
    id: "S-29",
    label: "S-29: 22400-525-24500",
    min: 22400,
    increment: 525,
    max: 24500,
    stages: [{ upTo: 24500, increment: 525 }],
  },
  {
    id: "S-30",
    label: "S-30: 22400-600-26000",
    min: 22400,
    increment: 600,
    max: 26000,
    stages: [{ upTo: 26000, increment: 600 }],
  },
  {
    id: "S-31",
    label: "S-31: 24050-650-26000 (Senior)",
    min: 24050,
    increment: 650,
    max: 26000,
    stages: [{ upTo: 26000, increment: 650 }],
  },
  {
    id: "S-32",
    label: "S-32: 26000-650-30200",
    min: 26000,
    increment: 650,
    max: 30200,
    stages: [{ upTo: 30200, increment: 650 }],
  },
  {
    id: "S-33",
    label: "S-33: 30000-1000-32000 (Apex-like)",
    min: 30000,
    increment: 1000,
    max: 32000,
    stages: [{ upTo: 32000, increment: 1000 }],
  },
  {
    id: "S-34",
    label: "S-34: 30000 (Fixed/Apex)",
    min: 30000,
    increment: 0,
    max: 34500,
    stages: [{ upTo: 34500, increment: 0 }],
    description: "Fixed pay",
  },
];

// -------------------------------------------------------
// 6th CPC Pay Bands
// -------------------------------------------------------
export interface SixthCPCPayBand {
  id: string;
  label: string;
  min: number;
  max: number;
  gradePays: number[];
  isFixed?: boolean;
  fixedPay?: number;
}

export const SIXTH_CPC_PAY_BANDS: SixthCPCPayBand[] = [
  {
    id: "PB-1",
    label: "PB-1 (5200–20200)",
    min: 5200,
    max: 20200,
    gradePays: [1800, 1900, 2000, 2400, 2800],
  },
  {
    id: "PB-2",
    label: "PB-2 (9300–34800)",
    min: 9300,
    max: 34800,
    gradePays: [4200, 4600, 4800],
  },
  {
    id: "PB-3",
    label: "PB-3 (15600–39100)",
    min: 15600,
    max: 39100,
    gradePays: [5400, 6600, 7600],
  },
  {
    id: "PB-4",
    label: "PB-4 (37400–67000)",
    min: 37400,
    max: 67000,
    gradePays: [8700, 8900, 10000],
  },
  {
    id: "HAG",
    label: "HAG (67000–79000)",
    min: 67000,
    max: 79000,
    gradePays: [0],
  },
  {
    id: "HAG+",
    label: "HAG+ (75500–80000)",
    min: 75500,
    max: 80000,
    gradePays: [0],
  },
  {
    id: "APEX",
    label: "APEX (80000 Fixed)",
    min: 80000,
    max: 80000,
    gradePays: [0],
    isFixed: true,
    fixedPay: 80000,
  },
];

// -------------------------------------------------------
// 7th CPC Pay Matrix Levels
// -------------------------------------------------------
export interface SeventhCPCLevel {
  id: string;
  label: string;
  level: number;
  minPay: number;
}

export const SEVENTH_CPC_LEVELS: SeventhCPCLevel[] = [
  { id: "L1", label: "Level 1", level: 1, minPay: 18000 },
  { id: "L2", label: "Level 2", level: 2, minPay: 19900 },
  { id: "L3", label: "Level 3", level: 3, minPay: 21700 },
  { id: "L4", label: "Level 4", level: 4, minPay: 25500 },
  { id: "L5", label: "Level 5", level: 5, minPay: 29200 },
  { id: "L6", label: "Level 6", level: 6, minPay: 35400 },
  { id: "L7", label: "Level 7", level: 7, minPay: 44900 },
  { id: "L8", label: "Level 8", level: 8, minPay: 47600 },
  { id: "L9", label: "Level 9", level: 9, minPay: 53100 },
  { id: "L10", label: "Level 10", level: 10, minPay: 56100 },
  { id: "L11", label: "Level 11", level: 11, minPay: 67700 },
  { id: "L12", label: "Level 12", level: 12, minPay: 78800 },
  { id: "L13", label: "Level 13", level: 13, minPay: 123100 },
  { id: "L13A", label: "Level 13A", level: 13.5, minPay: 131100 },
  { id: "L14", label: "Level 14", level: 14, minPay: 144200 },
  { id: "L15", label: "Level 15", level: 15, minPay: 182200 },
  { id: "L16", label: "Level 16", level: 16, minPay: 205400 },
  { id: "L17", label: "Level 17", level: 17, minPay: 225000 },
  { id: "L18", label: "Level 18", level: 18, minPay: 250000 },
];

// -------------------------------------------------------
// DA Rates (% of basic pay) per year
// -------------------------------------------------------
export const FIFTH_CPC_DA_RATES: Record<number, number> = {
  1998: 0,
  1999: 12,
  2000: 16,
  2001: 22,
  2002: 32,
  2003: 41,
  2004: 50,
  2005: 59,
};

export const SIXTH_CPC_DA_RATES: Record<number, number> = {
  2006: 2,
  2007: 9,
  2008: 16,
  2009: 27,
  2010: 45,
  2011: 58,
  2012: 72,
  2013: 90,
  2014: 107,
  2015: 119,
};

export const SEVENTH_CPC_DA_RATES: Record<number, number> = {
  2016: 0,
  2017: 5,
  2018: 9,
  2019: 17,
  2020: 17,
  2021: 28,
  2022: 34,
  2023: 42,
  2024: 50,
  2025: 55,
};

// -------------------------------------------------------
// TA (Transport Allowance) slabs
// -------------------------------------------------------
export function getFifthCPCTA(basic: number): number {
  if (basic < 3200) return 75;
  if (basic < 5500) return 100;
  if (basic < 9000) return 150;
  return 200;
}

export function getSixthCPCTA(basicPlusGP: number): number {
  if (basicPlusGP < 7500) return 600;
  if (basicPlusGP < 15000) return 1000;
  return 3200;
}

export function getSeventhCPCTA(level: number): number {
  if (level <= 2) return 1350;
  if (level <= 8) return 3600;
  return 7200;
}
