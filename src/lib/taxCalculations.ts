// Tax calculation engine for multiple countries (2026 tax year)

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  name?: string;
}

export interface TaxCalculationResult {
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
  breakdown: {
    bracket: string;
    range: string;
    rate: number;
    taxableInBracket: number;
    taxPaid: number;
  }[];
}

// USA Federal Tax Calculator (2026)
export const calculateUSATax = (
  income: number,
  filingStatus: 'single' | 'married_jointly' | 'married_separately' | 'head_of_household' = 'single'
): TaxCalculationResult => {
  const brackets: Record<typeof filingStatus, TaxBracket[]> = {
    single: [
      { min: 0, max: 11000, rate: 0.10, name: '10% bracket' },
      { min: 11000, max: 44725, rate: 0.12, name: '12% bracket' },
      { min: 44725, max: 95375, rate: 0.22, name: '22% bracket' },
      { min: 95375, max: 182050, rate: 0.24, name: '24% bracket' },
      { min: 182050, max: 231250, rate: 0.32, name: '32% bracket' },
      { min: 231250, max: 578125, rate: 0.35, name: '35% bracket' },
      { min: 578125, max: Infinity, rate: 0.37, name: '37% bracket' }
    ],
    married_jointly: [
      { min: 0, max: 22000, rate: 0.10, name: '10% bracket' },
      { min: 22000, max: 89450, rate: 0.12, name: '12% bracket' },
      { min: 89450, max: 190750, rate: 0.22, name: '22% bracket' },
      { min: 190750, max: 364200, rate: 0.24, name: '24% bracket' },
      { min: 364200, max: 462500, rate: 0.32, name: '32% bracket' },
      { min: 462500, max: 693750, rate: 0.35, name: '35% bracket' },
      { min: 693750, max: Infinity, rate: 0.37, name: '37% bracket' }
    ],
    married_separately: [
      { min: 0, max: 11000, rate: 0.10, name: '10% bracket' },
      { min: 11000, max: 44725, rate: 0.12, name: '12% bracket' },
      { min: 44725, max: 95375, rate: 0.22, name: '22% bracket' },
      { min: 95375, max: 182100, rate: 0.24, name: '24% bracket' },
      { min: 182100, max: 231250, rate: 0.32, name: '32% bracket' },
      { min: 231250, max: 346875, rate: 0.35, name: '35% bracket' },
      { min: 346875, max: Infinity, rate: 0.37, name: '37% bracket' }
    ],
    head_of_household: [
      { min: 0, max: 15700, rate: 0.10, name: '10% bracket' },
      { min: 15700, max: 59850, rate: 0.12, name: '12% bracket' },
      { min: 59850, max: 95350, rate: 0.22, name: '22% bracket' },
      { min: 95350, max: 182050, rate: 0.24, name: '24% bracket' },
      { min: 182050, max: 231250, rate: 0.32, name: '32% bracket' },
      { min: 231250, max: 578100, rate: 0.35, name: '35% bracket' },
      { min: 578100, max: Infinity, rate: 0.37, name: '37% bracket' }
    ]
  };

  return calculateProgressiveTax(income, brackets[filingStatus], 'USD');
};

// UK Tax Calculator (2026/27)
export const calculateUKTax = (income: number): TaxCalculationResult => {
  const brackets: TaxBracket[] = [
    { min: 0, max: 12570, rate: 0.00, name: 'Personal Allowance' },
    { min: 12570, max: 50270, rate: 0.20, name: 'Basic rate' },
    { min: 50270, max: 125140, rate: 0.40, name: 'Higher rate' },
    { min: 125140, max: Infinity, rate: 0.45, name: 'Additional rate' }
  ];

  // Personal allowance tapering for high earners (£100k+)
  let adjustedBrackets = [...brackets];
  if (income > 100000) {
    const reduction = Math.min(12570, Math.floor((income - 100000) / 2));
    adjustedBrackets[0].max = 12570 - reduction;
    adjustedBrackets[1].min = 12570 - reduction;
  }

  return calculateProgressiveTax(income, adjustedBrackets, 'GBP');
};

// India Tax Calculator - New Tax Regime (2026)
export const calculateIndiaTax = (income: number): TaxCalculationResult => {
  const brackets: TaxBracket[] = [
    { min: 0, max: 300000, rate: 0.00, name: 'Nil rate' },
    { min: 300000, max: 500000, rate: 0.05, name: '5% slab' },
    { min: 500000, max: 700000, rate: 0.10, name: '10% slab' },
    { min: 700000, max: 1000000, rate: 0.15, name: '15% slab' },
    { min: 1000000, max: 5000000, rate: 0.20, name: '20% slab' },
    { min: 5000000, max: Infinity, rate: 0.30, name: '30% slab' }
  ];

  const result = calculateProgressiveTax(income, brackets, 'INR');
  
  // Add 4% Health and Education Cess
  const cess = result.totalTax * 0.04;
  result.totalTax += cess;
  result.breakdown.push({
    bracket: 'Cess',
    range: '4% of tax',
    rate: 4,
    taxableInBracket: result.totalTax - cess,
    taxPaid: cess
  });
  
  return result;
};

// Nigeria Tax Calculator (2026)
export const calculateNigeriaTax = (income: number): TaxCalculationResult => {
  // First NGN 800,000 is exempt
  const brackets: TaxBracket[] = [
    { min: 0, max: 800000, rate: 0.00, name: 'Tax-free' },
    { min: 800000, max: 3000000, rate: 0.15, name: '15% band' },
    { min: 3000000, max: 12000000, rate: 0.18, name: '18% band' },
    { min: 12000000, max: 25000000, rate: 0.21, name: '21% band' },
    { min: 25000000, max: 50000000, rate: 0.23, name: '23% band' },
    { min: 50000000, max: Infinity, rate: 0.25, name: '25% band' }
  ];

  return calculateProgressiveTax(income, brackets, 'NGN');
};

// Core progressive tax calculation engine
function calculateProgressiveTax(
  income: number,
  brackets: TaxBracket[],
  currency: string
): TaxCalculationResult {
  let totalTax = 0;
  let remainingIncome = income;
  const breakdown: TaxCalculationResult['breakdown'] = [];
  let marginalRate = 0;

  for (const bracket of brackets) {
    const bracketSize = bracket.max - bracket.min;
    const taxableInBracket = Math.min(
      Math.max(0, remainingIncome),
      bracketSize
    );
    
    if (taxableInBracket > 0) {
      const taxPaid = taxableInBracket * bracket.rate;
      totalTax += taxPaid;
      marginalRate = bracket.rate;

      breakdown.push({
        bracket: bracket.name || `${(bracket.rate * 100).toFixed(0)}% bracket`,
        range: formatRange(bracket.min, bracket.max, currency),
        rate: bracket.rate * 100,
        taxableInBracket,
        taxPaid
      });
    }

    remainingIncome -= taxableInBracket;
    if (remainingIncome <= 0) break;
  }

  const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0;

  return {
    totalTax,
    effectiveRate,
    marginalRate: marginalRate * 100,
    breakdown
  };
}

function formatRange(min: number, max: number, currency: string): string {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    GBP: '£',
    INR: '₹',
    NGN: '₦'
  };

  const symbol = currencySymbols[currency] || currency;
  const formatNum = (n: number) => n === Infinity ? '∞' : n.toLocaleString();
  
  return `${symbol}${formatNum(min)} - ${symbol}${formatNum(max)}`;
}

// VAT/GST Calculator
export const calculateIndirectTax = (
  amount: number,
  country: 'USA' | 'UK' | 'India' | 'Nigeria',
  category?: string
): { netAmount: number; taxAmount: number; grossAmount: number; rate: number } => {
  let rate = 0;

  switch (country) {
    case 'UK':
      rate = 0.20; // 20% VAT
      break;
    case 'India':
      // GST rates vary by category
      const gstRates: Record<string, number> = {
        'essential': 0.00,
        'basic': 0.05,
        'standard': 0.12,
        'luxury': 0.18,
        'sin': 0.28
      };
      rate = gstRates[category || 'standard'] || 0.18;
      break;
    case 'Nigeria':
      rate = 0.075; // 7.5% VAT
      break;
    case 'USA':
      // State-dependent, using average
      rate = 0.07; // ~7% average sales tax
      break;
  }

  const taxAmount = amount * rate;
  const grossAmount = amount + taxAmount;

  return {
    netAmount: amount,
    taxAmount,
    grossAmount,
    rate: rate * 100
  };
};

// Corporate Tax Calculator
export const calculateCorporateTax = (
  profit: number,
  country: 'USA' | 'UK' | 'India' | 'Nigeria'
): { tax: number; rate: number; netProfit: number } => {
  let rate = 0;

  switch (country) {
    case 'USA':
      rate = 0.21; // 21% federal corporate tax
      break;
    case 'UK':
      // Small profits rate vs main rate
      rate = profit <= 50000 ? 0.19 : 0.25;
      break;
    case 'India':
      // Domestic companies
      rate = 0.25; // 25% (22% with conditions)
      break;
    case 'Nigeria':
      rate = 0.25; // 25% corporate income tax
      break;
  }

  const tax = profit * rate;
  const netProfit = profit - tax;

  return { tax, rate: rate * 100, netProfit };
};
