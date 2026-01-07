
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
            Out of Credits
          </CardTitle>
          <CardDescription className="text-amber-700 dark:text-amber-300">
            You've used all your credits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
              To continue using AI features like <span className="font-semibold">Chat</span> and <span className="font-semibold">Arnold AI Assistant</span>, you need to purchase credits.
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-4">
              Credits are required for AI-powered analysis, chat responses, and smart insights.
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
