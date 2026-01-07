import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Sparkles, Check, ArrowRight, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface CreditUpsellModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
  requiredCredits?: number;
  currentCredits?: number;
}

const plans = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    price: 4.99,
    popular: false,
    savings: 0,
    features: ['100 AI credits', 'Basic insights', 'Email support'],
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 500,
    price: 19.99,
    popular: true,
    savings: 20,
    features: ['500 AI credits', 'Advanced analytics', 'Priority support', 'Voice assistant'],
  },
  {
    id: 'business',
    name: 'Business Pack',
    credits: 2000,
    price: 59.99,
    popular: false,
    savings: 40,
    features: ['2000 AI credits', 'All features', 'Dedicated support', 'API access', 'Team sharing'],
  },
];

export const CreditUpsellModal = ({
  open,
  onOpenChange,
  feature = 'this feature',
  requiredCredits = 1,
  currentCredits = 0,
}: CreditUpsellModalProps) => {
  const navigate = useNavigate();
  const creditsNeeded = Math.max(0, requiredCredits - currentCredits);

  const handleSelectPlan = (planId: string) => {
    onOpenChange(false);
    navigate(`/pricing?plan=${planId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl">Unlock {feature}</DialogTitle>
          <DialogDescription className="text-base">
            {creditsNeeded > 0 ? (
              <>
                You need <span className="font-semibold text-foreground">{creditsNeeded} more credits</span> to use {feature}.
                Choose a plan that works for you!
              </>
            ) : (
              <>Get more credits to unlock AI-powered features and insights!</>
            )}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence>
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`relative p-6 h-full flex flex-col ${
                    plan.popular 
                      ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                      : 'border-border hover:border-primary/50'
                  } transition-all cursor-pointer hover:shadow-md`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  )}

                  {plan.savings > 0 && (
                    <Badge variant="secondary" className="absolute -top-3 right-2 bg-green-500 text-white">
                      <Gift className="h-3 w-3 mr-1" />
                      Save {plan.savings}%
                    </Badge>
                  )}

                  <div className="text-center mb-4 pt-2">
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1 mt-2">
                      <span className="text-3xl font-bold">${plan.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.credits} credits
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${(plan.price / plan.credits).toFixed(3)}/credit
                    </p>
                  </div>

                  <ul className="space-y-2 flex-1 mb-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${plan.popular ? '' : 'variant-outline'}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    Get {plan.name}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            💡 <span className="font-medium">Tip:</span> Higher plans include more features and better value per credit!
          </p>
          <Button
            variant="link"
            className="mt-2 text-muted-foreground"
            onClick={() => navigate('/pricing')}
          >
            View all pricing options →
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditUpsellModal;
