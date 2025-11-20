import React, { useState } from "react";
import { motion } from "framer-motion";
import { AnimatedPaymentCard } from "./AnimatedPaymentCard";
import { PaymentProcessingModal } from "./PaymentProcessingModal";
import { usePaymentFlow } from "@/hooks/usePaymentFlow";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Zap, Crown, Building2 } from "lucide-react";
import { paymentAnimations } from "@/lib/paymentAnimations";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
    monthlyPrice: 9.99,
    yearlyPrice: 99,
    credits: 100,
    features: [
      "100 AI credits/month",
      "Basic analytics",
      "Email support",
      "Single user",
      "Mobile app access",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Professional",
    icon: Crown,
    color: "from-purple-500 to-pink-500",
    monthlyPrice: 29.99,
    yearlyPrice: 299,
    credits: 500,
    features: [
      "500 AI credits/month",
      "Advanced analytics",
      "Priority support",
      "Up to 5 users",
      "API access",
      "Custom reports",
      "Data export",
    ],
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    icon: Building2,
    color: "from-orange-500 to-red-500",
    monthlyPrice: 99.99,
    yearlyPrice: 999,
    credits: 2000,
    features: [
      "2000 AI credits/month",
      "Premium analytics",
      "24/7 dedicated support",
      "Unlimited users",
      "Advanced API access",
      "Custom integrations",
      "White-label options",
      "SLA guarantee",
    ],
    popular: false,
  },
];

export const PricingPlansSection = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { selectedPlan, billingCycle, selectPlan, processPayment, status, error, retry, reset } =
    usePaymentFlow();

  const handleSelectPlan = (planId: string) => {
    selectPlan(planId);
    // In a real implementation, this would open a payment modal/form
    // For now, we'll simulate the payment flow
    setTimeout(() => {
      processPayment({
        cardNumber: "4242424242424242",
        expiryDate: "12/25",
        cvv: "123",
      });
    }, 1000);
  };

  const getPrice = (plan: typeof PLANS[0]) => {
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getSavings = (plan: typeof PLANS[0]) => {
    const yearlyCost = plan.monthlyPrice * 12;
    const savings = yearlyCost - plan.yearlyPrice;
    const percentage = Math.round((savings / yearlyCost) * 100);
    return { amount: savings, percentage };
  };

  return (
    <div className="py-12 space-y-12">
      {/* Billing Toggle */}
      <motion.div
        variants={paymentAnimations.fadeSlide}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-center gap-4"
      >
        <Label htmlFor="billing-toggle" className={!isYearly ? "font-semibold" : ""}>
          Monthly
        </Label>
        <Switch id="billing-toggle" checked={isYearly} onCheckedChange={setIsYearly} />
        <Label htmlFor="billing-toggle" className={isYearly ? "font-semibold" : ""}>
          Yearly
          <span className="ml-2 text-xs text-finance-positive">Save up to 17%</span>
        </Label>
      </motion.div>

      {/* Plans Grid */}
      <motion.div
        variants={paymentAnimations.staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto"
      >
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const price = getPrice(plan);
          const savings = getSavings(plan);

          return (
            <AnimatedPaymentCard
              key={plan.id}
              planId={plan.id}
              name={plan.name}
              price={price}
              billingCycle={isYearly ? "yearly" : "monthly"}
              features={plan.features}
              isPopular={plan.popular}
              isSelected={selectedPlan === plan.id}
              onSelect={() => handleSelectPlan(plan.id)}
              icon={<Icon className="h-6 w-6" />}
              gradientColors={plan.color}
              credits={plan.credits}
            >
              {isYearly && (
                <div className="absolute top-4 right-4">
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="bg-finance-positive text-white text-xs px-2 py-1 rounded-full"
                  >
                    Save ${savings.amount}
                  </motion.div>
                </div>
              )}
            </AnimatedPaymentCard>
          );
        })}
      </motion.div>

      {/* Features Comparison */}
      <motion.div
        variants={paymentAnimations.fadeSlide}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        <h3 className="text-2xl font-bold text-center mb-8">All plans include</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Advanced security",
            "Regular updates",
            "Mobile & desktop apps",
            "Data encryption",
            "99.9% uptime",
            "Cancel anytime",
          ].map((feature, index) => (
            <motion.div
              key={feature}
              variants={paymentAnimations.fadeSlide}
              custom={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
            >
              <Check className="h-5 w-5 text-finance-positive flex-shrink-0" />
              <span>{feature}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Payment Processing Modal */}
      <PaymentProcessingModal
        isOpen={
          status === "processing" || status === "success" || status === "error"
        }
        onClose={reset}
        status={status as "processing" | "success" | "error"}
        message={
          status === "success"
            ? "Payment completed successfully!"
            : status === "processing"
            ? "Processing your payment..."
            : undefined
        }
        errorMessage={error || undefined}
        onRetry={retry}
      />
    </div>
  );
};
