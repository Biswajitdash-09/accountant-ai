
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

interface ChartData {
  month: string;
  income: number;
  expenses: number;
}

interface IncomeExpenseChartProps {
  data: ChartData[];
}

const IncomeExpenseChart = ({ data }: IncomeExpenseChartProps) => {
  const { formatCurrency } = useCurrencyFormatter();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-green-600">
            {`Income: ${formatCurrency(payload[0].value)}`}
          </p>
          <p className="text-red-600">
            {`Expenses: ${formatCurrency(payload[1].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
        <CardDescription>
          Monthly comparison of your income and expenses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value, undefined, undefined, { showSymbol: false })} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name="Income" />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default IncomeExpenseChart;
