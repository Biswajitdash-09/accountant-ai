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
  Loader2,
  Coins,
  FileText,
  Sparkles
} from 'lucide-react';
import { useDemoMode, DemoActivationStep } from '@/contexts/DemoModeContext';
import DemoBankCard from './DemoBankCard';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { cn } from '@/lib/utils';

const stepLabels: Record<DemoActivationStep, { label: string; icon: React.ReactNode }> = {
  idle: { label: 'Ready', icon: <Sparkles className="h-4 w-4" /> },
  starting: { label: 'Initializing...', icon: <Loader2 className="h-4 w-4 animate-spin" /> },
  fetching_currencies: { label: 'Fetching currencies...', icon: <Coins className="h-4 w-4 animate-pulse" /> },
  creating_bank_connections: { label: 'Creating bank connections...', icon: <Building2 className="h-4 w-4 animate-pulse" /> },
  creating_accounts: { label: 'Creating accounts...', icon: <FileText className="h-4 w-4 animate-pulse" /> },
  generating_transactions: { label: 'Generating transactions...', icon: <Receipt className="h-4 w-4 animate-pulse" /> },
  complete: { label: 'Demo ready!', icon: <CheckCircle2 className="h-4 w-4 text-success" /> },
  error: { label: 'Error occurred', icon: <AlertTriangle className="h-4 w-4 text-destructive" /> },
};

const getStepProgress = (step: DemoActivationStep): number => {
  const steps: DemoActivationStep[] = [
    'starting',
    'fetching_currencies',
    'creating_bank_connections',
    'creating_accounts',
    'generating_transactions',
    'complete',
  ];
  const index = steps.indexOf(step);
  if (index === -1) return 0;
  return Math.round(((index + 1) / steps.length) * 100);
};

const DemoControlPanel = () => {
  const {
    isDemoMode,
    isLoading,
    currentStep,
    stepProgress,
    demoBankConnections,
    demoStats,
    activateDemoMode,
    deactivateDemoMode,
    resetDemoData,
  } = useDemoMode();

  const isActivating = isLoading && !isDemoMode;
  const showProgress = isActivating && currentStep !== 'idle' && currentStep !== 'error';

  return (
    <div className="space-y-6">
      {/* Main Control Card */}
      <Card className="border-2 border-dashed border-warning/50 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-warning/20 to-warning/10">
              <Film className="h-6 w-6 text-warning" />
            </div>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 flex-wrap">
                Investor Demo Mode
                {isDemoMode && (
                  <Badge className="bg-success/20 text-success border-success/30">
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
          {/* Progress Indicator */}
          {showProgress && (
            <div className="space-y-4 p-4 rounded-lg bg-muted/50 border animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                {stepLabels[currentStep].icon}
                <span className="text-sm font-medium">{stepLabels[currentStep].label}</span>
              </div>
              <ProgressIndicator 
                value={getStepProgress(currentStep)} 
                variant="gradient"
                size="md"
                animated={true}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Step {Math.ceil(getStepProgress(currentStep) / 20)} of 5</span>
                <span>{getStepProgress(currentStep)}%</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {currentStep === 'error' && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 animate-in fade-in duration-300">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-destructive">Failed to activate demo mode</p>
                  <p className="text-sm text-muted-foreground">{stepProgress}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={activateDemoMode}
                    className="mt-2"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Status Info */}
          {!isDemoMode && !showProgress && currentStep !== 'error' && (
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
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
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-lg bg-info/10 text-center">
                <Building2 className="h-5 sm:h-6 w-5 sm:w-6 mx-auto mb-2 text-info" />
                <p className="text-xl sm:text-2xl font-bold text-info">{demoStats.accountCount}</p>
                <p className="text-[10px] sm:text-xs text-info/80">Demo Accounts</p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-success/10 text-center">
                <Receipt className="h-5 sm:h-6 w-5 sm:w-6 mx-auto mb-2 text-success" />
                <p className="text-xl sm:text-2xl font-bold text-success">{demoStats.transactionCount}</p>
                <p className="text-[10px] sm:text-xs text-success/80">Transactions</p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-primary/10 text-center">
                <DollarSign className="h-5 sm:h-6 w-5 sm:w-6 mx-auto mb-2 text-primary" />
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  ${(demoStats.totalBalance / 1000).toFixed(0)}K
                </p>
                <p className="text-[10px] sm:text-xs text-primary/80">Total Balance</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!isDemoMode ? (
              <Button
                size="lg"
                onClick={activateDemoMode}
                disabled={isLoading}
                className="flex-1 min-h-[48px] bg-gradient-to-r from-warning to-warning/80 hover:from-warning/90 hover:to-warning/70 text-warning-foreground shadow-lg"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoBankConnections.map((connection) => (
              <DemoBankCard key={connection.id} connection={connection} />
            ))}
          </div>
        </div>
      )}

      {/* Feature Showcase */}
      {isDemoMode && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Demo Features Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-sm">
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
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  <span className="text-xs sm:text-sm text-muted-foreground truncate">{feature}</span>
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
