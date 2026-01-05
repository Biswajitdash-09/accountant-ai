// Nigeria Personal Income Tax Act 2025 (Effective January 1, 2026)
// This module provides accurate tax calculations based on the new Nigerian tax law

export interface NigeriaTaxInput {
  grossIncome: number;
  annualRent?: number;
  pensionContribution?: number;  // Usually 8% of gross
  nhisContribution?: number;     // National Health Insurance
  nhfContribution?: number;      // National Housing Fund
  lifeInsurance?: number;
  housingLoanInterest?: number;
  otherDeductions?: number;
}

export interface NigeriaTaxResult {
  grossIncome: number;
  deductions: {
    pension: number;
    rentRelief: number;
    nhis: number;
    nhf: number;
    lifeInsurance: number;
    housingLoanInterest: number;
    other: number;
    total: number;
  };
  taxableIncome: number;
  taxBreakdown: Array<{
    band: string;
    amount: number;
    rate: number;
    tax: number;
  }>;
  totalTax: number;
  monthlyTax: number;
  effectiveRate: number;
  netIncome: number;
}

// 2026 Nigerian Personal Income Tax Bands
// Source: Nigeria Tax Act 2025, effective January 1, 2026
const TAX_BANDS_2026 = [
  { min: 0, max: 800000, rate: 0, label: "First ₦800,000 (Exempt)" },
  { min: 800001, max: 3000000, rate: 0.15, label: "₦800,001 - ₦3,000,000" },
  { min: 3000001, max: 12000000, rate: 0.18, label: "₦3,000,001 - ₦12,000,000" },
  { min: 12000001, max: 25000000, rate: 0.21, label: "₦12,000,001 - ₦25,000,000" },
  { min: 25000001, max: 50000000, rate: 0.23, label: "₦25,000,001 - ₦50,000,000" },
  { min: 50000001, max: Infinity, rate: 0.25, label: "Above ₦50,000,000" },
];

// Constants for deduction limits
const RENT_RELIEF_RATE = 0.20;  // 20% of annual rent
const RENT_RELIEF_CAP = 500000; // Maximum ₦500,000

/**
 * Calculate Nigerian Personal Income Tax for 2026 tax year
 * Based on the Nigeria Tax Act 2025 (effective January 1, 2026)
 */
export function calculateNigeriaTax2026(input: NigeriaTaxInput): NigeriaTaxResult {
  const {
    grossIncome,
    annualRent = 0,
    pensionContribution = 0,
    nhisContribution = 0,
    nhfContribution = 0,
    lifeInsurance = 0,
    housingLoanInterest = 0,
    otherDeductions = 0,
  } = input;

  // Calculate rent relief (20% of rent, capped at ₦500,000)
  const rentRelief = Math.min(annualRent * RENT_RELIEF_RATE, RENT_RELIEF_CAP);

  // Total deductions
  const deductions = {
    pension: pensionContribution,
    rentRelief,
    nhis: nhisContribution,
    nhf: nhfContribution,
    lifeInsurance,
    housingLoanInterest,
    other: otherDeductions,
    total: pensionContribution + rentRelief + nhisContribution + nhfContribution + 
           lifeInsurance + housingLoanInterest + otherDeductions,
  };

  // Calculate taxable income
  const taxableIncome = Math.max(0, grossIncome - deductions.total);

  // Calculate tax using progressive bands
  const taxBreakdown: Array<{ band: string; amount: number; rate: number; tax: number }> = [];
  let totalTax = 0;
  let remainingIncome = taxableIncome;

  for (const band of TAX_BANDS_2026) {
    if (remainingIncome <= 0) break;

    const bandStart = band.min;
    const bandEnd = band.max;
    
    if (taxableIncome <= bandStart) continue;

    // Calculate amount taxable in this band
    const taxableInBand = Math.min(
      remainingIncome,
      Math.min(taxableIncome, bandEnd) - bandStart + (band.min === 0 ? 0 : 1)
    );

    if (taxableInBand <= 0) continue;

    const taxInBand = taxableInBand * band.rate;
    totalTax += taxInBand;

    if (band.rate > 0 || taxableInBand > 0) {
      taxBreakdown.push({
        band: band.label,
        amount: Math.round(taxableInBand),
        rate: band.rate * 100,
        tax: Math.round(taxInBand),
      });
    }

    remainingIncome -= taxableInBand;
  }

  const monthlyTax = Math.round(totalTax / 12);
  const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;
  const netIncome = grossIncome - totalTax;

  return {
    grossIncome,
    deductions,
    taxableIncome,
    taxBreakdown,
    totalTax: Math.round(totalTax),
    monthlyTax,
    effectiveRate: parseFloat(effectiveRate.toFixed(2)),
    netIncome: Math.round(netIncome),
  };
}

/**
 * Format currency in Nigerian Naira
 */
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate a human-readable tax calculation summary
 */
export function generateTaxSummary(result: NigeriaTaxResult): string {
  const lines = [
    `📊 **Nigerian Personal Income Tax Calculation (2026)**`,
    ``,
    `**Gross Annual Income:** ${formatNaira(result.grossIncome)}`,
    ``,
    `**Allowable Deductions:**`,
  ];

  if (result.deductions.pension > 0) {
    lines.push(`  • Pension Contribution: ${formatNaira(result.deductions.pension)}`);
  }
  if (result.deductions.rentRelief > 0) {
    lines.push(`  • Rent Relief (20% of rent): ${formatNaira(result.deductions.rentRelief)}`);
  }
  if (result.deductions.nhis > 0) {
    lines.push(`  • NHIS Contribution: ${formatNaira(result.deductions.nhis)}`);
  }
  if (result.deductions.nhf > 0) {
    lines.push(`  • NHF Contribution: ${formatNaira(result.deductions.nhf)}`);
  }
  if (result.deductions.lifeInsurance > 0) {
    lines.push(`  • Life Insurance: ${formatNaira(result.deductions.lifeInsurance)}`);
  }
  if (result.deductions.other > 0) {
    lines.push(`  • Other Deductions: ${formatNaira(result.deductions.other)}`);
  }
  
  lines.push(`  • **Total Deductions:** ${formatNaira(result.deductions.total)}`);
  lines.push(``);
  lines.push(`**Taxable Income:** ${formatNaira(result.taxableIncome)}`);
  lines.push(``);
  lines.push(`**Tax Breakdown (2026 Rates):**`);

  for (const item of result.taxBreakdown) {
    lines.push(`  • ${item.band}: ${formatNaira(item.amount)} @ ${item.rate}% = ${formatNaira(item.tax)}`);
  }

  lines.push(``);
  lines.push(`**Total Annual Tax Payable:** ${formatNaira(result.totalTax)}`);
  lines.push(`**Monthly Tax:** ${formatNaira(result.monthlyTax)}`);
  lines.push(`**Effective Tax Rate:** ${result.effectiveRate}%`);
  lines.push(`**Net Annual Income:** ${formatNaira(result.netIncome)}`);

  return lines.join('\n');
}
