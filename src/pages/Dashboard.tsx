
import { DollarSign, ArrowUp, ArrowDown, FileText, CreditCard } from "lucide-react";
import MetricCard from "@/components/dashboard/MetricCard";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import IncomeExpenseChart from "@/components/dashboard/IncomeExpenseChart";

const Dashboard = () => {
  // Mock data for demonstration
  const metrics = {
    totalBalance: "$24,563.65",
    income: "$8,350.00",
    expenses: "$3,285.75",
    pendingTaxes: "$1,543.25",
  };

  const recentTransactions = [
    {
      id: "tx1",
      date: "Jul 20, 2025",
      description: "Client Payment - XYZ Corp",
      category: "Income",
      amount: 2500,
      type: "income" as const,
    },
    {
      id: "tx2",
      date: "Jul 19, 2025",
      description: "Office Rent",
      category: "Rent",
      amount: 1200,
      type: "expense" as const,
    },
    {
      id: "tx3",
      date: "Jul 17, 2025",
      description: "Software Subscription",
      category: "Software",
      amount: 49.99,
      type: "expense" as const,
    },
    {
      id: "tx4",
      date: "Jul 15, 2025",
      description: "Client Payment - ABC Inc",
      category: "Income",
      amount: 3500,
      type: "income" as const,
    },
    {
      id: "tx5",
      date: "Jul 12, 2025",
      description: "Utility Bills",
      category: "Utilities",
      amount: 175.25,
      type: "expense" as const,
    },
  ];

  const expenseData = [
    { name: "Rent", value: 1200 },
    { name: "Software", value: 450 },
    { name: "Utilities", value: 175 },
    { name: "Marketing", value: 300 },
    { name: "Other", value: 150 },
  ];

  const incomeExpenseData = [
    { month: "Jan", income: 5000, expenses: 3200 },
    { month: "Feb", income: 5500, expenses: 3300 },
    { month: "Mar", income: 6000, expenses: 3400 },
    { month: "Apr", income: 6500, expenses: 3500 },
    { month: "May", income: 7000, expenses: 3600 },
    { month: "Jun", income: 7500, expenses: 3700 },
    { month: "Jul", income: 8000, expenses: 3800 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Balance"
          value={metrics.totalBalance}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Across all accounts"
        />
        <MetricCard
          title="Income (This Month)"
          value={metrics.income}
          icon={<ArrowUp className="h-4 w-4 text-finance-positive" />}
          trend={{ value: 12, positive: true }}
          description="vs last month"
        />
        <MetricCard
          title="Expenses (This Month)"
          value={metrics.expenses}
          icon={<ArrowDown className="h-4 w-4 text-finance-negative" />}
          trend={{ value: 5, positive: false }}
          description="vs last month"
        />
        <MetricCard
          title="Pending Tax"
          value={metrics.pendingTaxes}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          description="Estimated due"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeExpenseChart data={incomeExpenseData} />
        <ExpenseChart data={expenseData} />
      </div>

      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
};

export default Dashboard;
