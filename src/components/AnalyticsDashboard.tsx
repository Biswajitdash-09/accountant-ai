
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, DollarSign, FileText, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactions } from '@/hooks/useTransactions';
import { useDocuments } from '@/hooks/useDocuments';
import { useAnalyticsCache } from '@/hooks/useAnalyticsCache';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const { transactions } = useTransactions();
  const { documents } = useDocuments();
  const { getCacheByKey, setCachedData } = useAnalyticsCache();

  const [analytics, setAnalytics] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    documentCount: 0,
    monthlyTrend: [],
    categoryBreakdown: [],
    predictionData: []
  });

  const calculateAnalytics = () => {
    const cacheKey = `analytics_${timeRange}`;
    const cached = getCacheByKey(cacheKey);
    
    if (cached) {
      setAnalytics(cached);
      return;
    }

    const now = new Date();
    const daysBack = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const filteredTransactions = transactions.filter(t => 
      new Date(t.date) >= startDate
    );

    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const netIncome = totalIncome - totalExpenses;

    // Monthly trend calculation
    const monthlyTrend = [];
    for (let i = 0; i < 12; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthTransactions = filteredTransactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === month.getMonth() && tDate.getFullYear() === month.getFullYear();
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      monthlyTrend.unshift({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income,
        expenses,
        net: income - expenses
      });
    }

    // Category breakdown
    const categoryMap = new Map();
    filteredTransactions.forEach(t => {
      if (t.category) {
        categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + Number(t.amount));
      }
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount
    }));

    // Simple prediction based on trend
    const predictionData = monthlyTrend.slice(-6).map((item, index) => ({
      month: `Pred ${index + 1}`,
      predicted: item.net * 1.05 // Simple 5% growth prediction
    }));

    const result = {
      totalIncome,
      totalExpenses,
      netIncome,
      documentCount: documents.length,
      monthlyTrend,
      categoryBreakdown,
      predictionData
    };

    setAnalytics(result);

    // Cache the result for 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    setCachedData.mutate({ cache_key: cacheKey, data: result, expires_at: expiresAt });
  };

  useEffect(() => {
    calculateAnalytics();
  }, [timeRange, transactions, documents]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Advanced Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="90d">90 Days</SelectItem>
            <SelectItem value="365d">1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(analytics.totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(analytics.totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${analytics.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(analytics.netIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analytics.documentCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>Income vs Expenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="income" stroke="#22c55e" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" />
                <Line type="monotone" dataKey="net" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Prediction</CardTitle>
            <CardDescription>Predicted net income based on trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.predictionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
