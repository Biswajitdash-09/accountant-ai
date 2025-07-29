
import React from 'react';
import { useCredits } from '@/hooks/useCredits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreditGuardProps {
  children: React.ReactNode;
  requiredCredits?: number;
  featureName?: string;
}

const CreditGuard = ({ 
  children, 
  requiredCredits = 1, 
  featureName = "this feature" 
}: CreditGuardProps) => {
  const { availableCredits, dailyCreditsRemaining } = useCredits();
  const navigate = useNavigate();

  const totalCredits = availableCredits + dailyCreditsRemaining;

  if (totalCredits < requiredCredits) {
    return (
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-amber-800 dark:text-amber-200">
            <CreditCard className="h-5 w-5" />
            Credits Required
          </CardTitle>
          <CardDescription className="text-amber-700 dark:text-amber-300">
            You need {requiredCredits} credit{requiredCredits > 1 ? 's' : ''} to use {featureName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
              Available Credits: <span className="font-bold">{availableCredits}</span>
              {dailyCreditsRemaining > 0 && (
                <> (+ {dailyCreditsRemaining} daily free)</>
              )}
            </p>
            <Button 
              onClick={() => navigate('/pricing')}
              className="bg-primary hover:bg-primary/90"
            >
              <Zap className="h-4 w-4 mr-2" />
              Buy Credits
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default CreditGuard;
