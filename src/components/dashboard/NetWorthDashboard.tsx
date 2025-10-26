import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface NetWorthData {
  assets: number;
  liabilities: number;
  netWorth: number;
  history: Array<{
    date: string;
    value: number;
  }>;
}

const NetWorthDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<NetWorthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchNetWorth = async () => {
      try {
        setLoading(true);

        // Fetch all accounts (assets)
        const { data: accounts } = await supabase
          .from('accounts')
          .select('balance')
          .eq('user_id', user.id);

        const totalAssets = accounts?.reduce((sum, acc) => sum + Number(acc.balance || 0), 0) || 0;

        // Fetch balance sheet items
        const { data: balanceItems } = await supabase
          .from('balance_sheet_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);

        const assets = balanceItems
          ?.filter(item => item.item_type === 'asset')
          .reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0;

        const liabilities = balanceItems
          ?.filter(item => item.item_type === 'liability')
          .reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0;

        const totalAssetsWithAccounts = totalAssets + assets;
        const netWorth = totalAssetsWithAccounts - liabilities;

        // Generate mock historical data (in real app, would fetch from historical snapshots)
        const history = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          
          // Simulate gradual growth
          const growth = (6 - i) * (netWorth * 0.02);
          history.push({
            date: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            value: Math.round((netWorth - growth) * 100) / 100,
          });
        }

        setData({
          assets: Math.round(totalAssetsWithAccounts * 100) / 100,
          liabilities: Math.round(liabilities * 100) / 100,
          netWorth: Math.round(netWorth * 100) / 100,
          history,
        });
      } catch (error) {
        console.error('Error fetching net worth:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNetWorth();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Net Worth Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const trend = data.history.length > 1 
    ? data.history[data.history.length - 1].value - data.history[0].value 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Net Worth Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Net Worth Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Assets</p>
            <p className="text-2xl font-bold text-primary">
              ${data.assets.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Liabilities</p>
            <p className="text-2xl font-bold text-destructive">
              ${data.liabilities.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Net Worth</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">
                ${data.netWorth.toLocaleString()}
              </p>
              {trend !== 0 && (
                <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="ml-1">
                    {Math.abs(trend).toFixed(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.history}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Net Worth']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 text-sm text-muted-foreground">
          <DollarSign className="h-4 w-4 mt-0.5" />
          <p>Track your financial progress over time. Add assets and liabilities to get accurate net worth calculations.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetWorthDashboard;
