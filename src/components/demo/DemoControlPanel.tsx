import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Film, 
  Play, 
  Square, 
  RefreshCw, 
  Building2, 
  Receipt, 
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import DemoBankCard from './DemoBankCard';
import { cn } from '@/lib/utils';

const DemoControlPanel = () => {
  const {
    isDemoMode,
    isLoading,
    demoBankConnections,
    demoStats,
    activateDemoMode,
    deactivateDemoMode,
    resetDemoData,
  } = useDemoMode();

  return (
    <div className="space-y-6">
      {/* Main Control Card */}
      <Card className="border-2 border-dashed border-amber-300 dark:border-amber-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40">
              <Film className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Investor Demo Mode
                {isDemoMode && (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Simulate bank connections and transactions for investor presentations
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Info */}
          {!isDemoMode && (
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium">Demo Mode creates simulated data</p>
                  <p className="text-sm text-muted-foreground">
                    When activated, this will create 5 simulated bank accounts (US, UK, Nigeria, India) 
                    with 100+ realistic transactions. All demo data is clearly labeled and can be 
                    instantly removed when you're done.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Demo Stats (when active) */}
          {isDemoMode && (
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                <Building2 className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{demoStats.accountCount}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Demo Accounts</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                <Receipt className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{demoStats.transactionCount}</p>
                <p className="text-xs text-green-600 dark:text-green-400">Transactions</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  ${(demoStats.totalBalance / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Total Balance</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {!isDemoMode ? (
              <Button
                size="lg"
                onClick={activateDemoMode}
                disabled={isLoading}
                className="flex-1 min-h-[48px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Play className="h-5 w-5 mr-2" />
                )}
                Start Investor Demo
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={resetDemoData}
                  disabled={isLoading}
                  className="flex-1 min-h-[48px]"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-5 w-5 mr-2" />
                  )}
                  Reset Demo Data
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={deactivateDemoMode}
                  disabled={isLoading}
                  className="flex-1 min-h-[48px]"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Square className="h-5 w-5 mr-2" />
                  )}
                  End Demo
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Demo Bank Connections Grid */}
      {isDemoMode && demoBankConnections.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Simulated Bank Connections
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoBankConnections.map((connection) => (
              <DemoBankCard key={connection.id} connection={connection} />
            ))}
          </div>
        </div>
      )}

      {/* Feature Showcase */}
      {isDemoMode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Demo Features Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {[
                'Multi-Bank Connectivity',
                'Transaction Categorization',
                'Dashboard Analytics',
                'AI Insights (Arnold)',
                'Net Worth Tracking',
                'Multi-Currency Support',
                'Real-time Sync',
                'Financial Reports',
              ].map((feature) => (
                <div 
                  key={feature}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DemoControlPanel;
