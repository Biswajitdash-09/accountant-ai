export interface NigeriaTaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export const NIGERIA_TAX_BRACKETS: NigeriaTaxBracket[] = [
  { min: 0, max: 800000, rate: 0 },
  { min: 800001, max: 3000000, rate: 15 },
  { min: 3000001, max: 12000000, rate: 18 },
  { min: 12000001, max: 25000000, rate: 21 },
  { min: 25000001, max: 50000000, rate: 23 },
  { min: 50000001, max: null, rate: 25 },
];

export interface NigeriaDeductions {
  rentAllowance?: number;
  pensionContribution?: number;
  nhfContribution?: number;
  lifeInsurance?: number;
  medicalExpenses?: number;
}

export interface NigeriaTaxResult {
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  totalTax: number;
  netIncome: number;
  effectiveRate: number;
  breakdown: Array<{
    bracket: string;
    amount: number;
    rate: number;
    tax: number;
  }>;
}

// 2026 Updated Tax Calculation
export function calculateNigeriaTax2026({
  grossIncome,
  annualRent = 0,
  pension = 0,
  nhis = 0,
  nhf = 0,
  lifeInsurance = 0,
  housingLoanInterest = 0,
  otherDeductions = 0,
}: {
  grossIncome: number;
  annualRent?: number;
  pension?: number;
  nhis?: number;
  nhf?: number;
  lifeInsurance?: number;
  housingLoanInterest?: number;
  otherDeductions?: number;
}) {
  const rentRelief = Math.min(annualRent * 0.20, 500000);
  const totalDeductions = rentRelief + pension + nhis + nhf + lifeInsurance + housingLoanInterest + otherDeductions;
  const taxableIncome = Math.max(grossIncome - totalDeductions, 0);

  if (taxableIncome <= 800000) {
    return { taxPayable: 0, effectiveRate: 0, taxableIncome, totalDeductions, monthlyTax: 0 };
  }

  const bands = [
    { limit: 3000000, rate: 0.15 },
    { limit: 12000000, rate: 0.18 },
    { limit: 25000000, rate: 0.21 },
    { limit: 50000000, rate: 0.23 },
    { limit: Infinity, rate: 0.25 },
  ];

  let remaining = taxableIncome;
  let taxPayable = 0;
  let prevLimit = 800000;

  for (let band of bands) {
    if (remaining <= prevLimit) break;
    const bandAmount = Math.min(remaining - prevLimit, band.limit - prevLimit);
    taxPayable += bandAmount * band.rate;
    prevLimit = band.limit;
    if (remaining <= band.limit) break;
  }

  const effectiveRate = (taxPayable / grossIncome) * 100;
  const monthlyTax = Math.round(taxPayable / 12);

  return {
    taxPayable: Math.round(taxPayable),
    effectiveRate: parseFloat(effectiveRate.toFixed(2)),
    taxableIncome,
    totalDeductions,
    monthlyTax
  };
}

export function calculateNigeriaTax(
  grossIncome: number,
  deductions: NigeriaDeductions = {}
): NigeriaTaxResult {
  // Calculate total deductions
  const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + (val || 0), 0);
  
  // Calculate taxable income
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);
  
  // Calculate tax for each bracket
  const breakdown: Array<{
    bracket: string;
    amount: number;
    rate: number;
    tax: number;
  }> = [];
  
  let totalTax = 0;
  let remainingIncome = taxableIncome;
  
  for (const bracket of NIGERIA_TAX_BRACKETS) {
    if (remainingIncome <= 0) break;
    
    const bracketMin = bracket.min;
    const bracketMax = bracket.max || Infinity;
    
    if (taxableIncome <= bracketMin) continue;
    
    const taxableInBracket = Math.min(
      remainingIncome,
      Math.min(taxableIncome, bracketMax) - bracketMin + 1
    );
    
    if (taxableInBracket <= 0) continue;
    
    const taxForBracket = (taxableInBracket * bracket.rate) / 100;
    totalTax += taxForBracket;
    
    breakdown.push({
      bracket: `₦${bracketMin.toLocaleString()} - ${bracket.max ? `₦${bracket.max.toLocaleString()}` : 'Above'}`,
      amount: taxableInBracket,
      rate: bracket.rate,
      tax: taxForBracket,
    });
    
    remainingIncome -= taxableInBracket;
  }
  
  const netIncome = grossIncome - totalTax;
  const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;
  
  return {
    grossIncome,
    totalDeductions,
    taxableIncome,
    totalTax,
    netIncome,
    effectiveRate,
    breakdown,
  };
}

// Corporate tax rates for Nigeria
export const NIGERIA_CORPORATE_TAX_RATE = 30; // Standard rate
export const NIGERIA_SMALL_COMPANY_TAX_RATE = 20; // For companies with turnover < ₦25M
export const NIGERIA_VAT_RATE = 7.5;

export function calculateNigeriaBusinessTax(
  revenue: number,
  expenses: number,
  isSmallCompany: boolean = false
): {
  revenue: number;
  expenses: number;
  profit: number;
  taxRate: number;
  corporateTax: number;
  netProfit: number;
} {
  const profit = Math.max(0, revenue - expenses);
  const taxRate = isSmallCompany ? NIGERIA_SMALL_COMPANY_TAX_RATE : NIGERIA_CORPORATE_TAX_RATE;
  const corporateTax = (profit * taxRate) / 100;
  const netProfit = profit - corporateTax;
  
  return {
    revenue,
    expenses,
    profit,
    taxRate,
    corporateTax,
    netProfit,
  };
}

export function calculateNigeriaVAT(amount: number): number {
  return (amount * NIGERIA_VAT_RATE) / 100;
}
