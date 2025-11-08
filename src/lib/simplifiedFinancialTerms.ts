export const simplifiedTerms: Record<string, string> = {
  // Investment Terms
  "Amortization": "Paying off a loan gradually over time",
  "Asset Allocation": "How your money is spread across different investments",
  "Capital Gains": "Profit from selling an investment",
  "Depreciation": "How much value an asset loses over time",
  "Diversification": "Spreading your money across different investments to reduce risk",
  "Dividend": "A share of company profits paid to investors",
  "Equity": "Ownership stake in a company or property",
  "ETF": "Exchange-Traded Fund - a basket of investments you can buy and sell like a stock",
  "Liquidity": "How quickly you can turn an asset into cash",
  "Portfolio": "All your investments together",
  "ROI": "Return on Investment - how much profit you made",
  "Volatility": "How much an investment's value goes up and down",
  "YTD": "Year-to-Date - from January 1st until now",
  
  // Banking Terms
  "APR": "Annual Percentage Rate - the yearly cost of a loan",
  "APY": "Annual Percentage Yield - the yearly interest you earn",
  "Compound Interest": "Earning interest on your interest",
  "Credit Score": "A number showing how good you are at paying back loans",
  "Debit": "Money leaving your account",
  "Credit": "Money coming into your account",
  "Overdraft": "Spending more money than you have in your account",
  "Principal": "The original amount of money borrowed or invested",
  "Interest Rate": "The cost of borrowing money or reward for saving",
  
  // Accounting Terms
  "Assets": "Things you own that have value",
  "Liabilities": "Money you owe to others",
  "Net Worth": "Your total assets minus your debts",
  "Cash Flow": "Money coming in and going out",
  "Revenue": "Total money earned before expenses",
  "Profit": "Money left after paying all expenses",
  "Gross Income": "Total income before deductions",
  "Net Income": "Income after all deductions",
  "Operating Expenses": "Regular costs of running a business",
  "EBITDA": "Earnings Before Interest, Taxes, Depreciation, and Amortization - company profit",
  
  // Tax Terms
  "Tax Deduction": "Expenses that reduce your taxable income",
  "Tax Credit": "Direct reduction of taxes owed",
  "Taxable Income": "The amount of income subject to taxes",
  "Filing Status": "Your tax category (single, married, etc.)",
  "Standard Deduction": "Fixed amount you can subtract from income",
  "Itemized Deductions": "List of specific expenses to reduce taxes",
  "W-2": "Tax form showing your income from employer",
  "1099": "Tax form showing income from freelance work",
  "Estimated Tax": "Quarterly tax payments for self-employed",
  "Tax Bracket": "The percentage of your income paid in taxes",
  "Capital Gains Tax": "Tax on profit from selling investments",
  
  // Crypto Terms
  "Blockchain": "Digital ledger that records all crypto transactions",
  "Wallet": "Digital storage for your cryptocurrency",
  "Gas Fee": "Transaction cost on a blockchain",
  "Mining": "Process of verifying crypto transactions",
  "Staking": "Locking crypto to earn rewards",
  "DeFi": "Decentralized Finance - financial services without banks",
  "NFT": "Non-Fungible Token - unique digital item",
  "Smart Contract": "Self-executing agreement on blockchain",
  "Cold Storage": "Keeping crypto offline for security",
  "Hot Wallet": "Crypto wallet connected to internet",
  
  // Business Terms
  "Burn Rate": "How fast a company spends money",
  "Runway": "How long your money will last at current spending",
  "Break-Even": "Point where income equals expenses",
  "Profit Margin": "Percentage of revenue that's profit",
  "Overhead": "Fixed costs of running a business",
  "Inventory": "Goods you have for sale",
  "Accounts Receivable": "Money customers owe you",
  "Accounts Payable": "Money you owe to suppliers",
  "Cash Reserve": "Emergency fund for unexpected costs",
  
  // Financial Planning Terms
  "Emergency Fund": "Savings for unexpected expenses",
  "Retirement Account": "Special savings account for when you stop working",
  "401(k)": "Employer retirement savings plan",
  "IRA": "Individual Retirement Account - personal retirement savings",
  "Roth IRA": "Retirement account where you pay taxes now, not later",
  "Pension": "Regular payments in retirement from former employer",
  "Annuity": "Insurance product that pays you regular income",
  "Estate Planning": "Deciding what happens to your assets when you die",
  "Trust": "Legal arrangement to manage assets for beneficiaries",
};

export const simplifyTerm = (term: string): string => {
  return simplifiedTerms[term] || term;
};

export const getAllSimplifiedTerms = (): Record<string, string> => {
  return simplifiedTerms;
};

export const hasSimplification = (term: string): boolean => {
  return term in simplifiedTerms;
};
