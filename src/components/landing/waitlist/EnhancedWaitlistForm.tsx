import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, Mail, User, Building2, ArrowRight, ArrowLeft, 
  Sparkles, SkipForward 
} from "lucide-react";
import confetti from "canvas-confetti";
import { WaitlistSuccess } from "../WaitlistSuccess";
import { SurveyProgress } from "./SurveyProgress";
import { SurveyRadioGroup } from "./SurveyRadioGroup";
import { SurveyCheckboxGroup } from "./SurveyCheckboxGroup";
import {
  userTypes,
  stressLevels,
  painPoints,
  valueRatings,
  pricingPreferences,
  urgencyTriggers,
  notificationPreferences,
  getDefaultSurveyResponses,
  SurveyResponses,
} from "./surveyConfig";

export const EnhancedWaitlistForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponses>(
    getDefaultSurveyResponses()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const { toast } = useToast();

  const updateSurveyResponse = <K extends keyof SurveyResponses>(
    key: K,
    value: SurveyResponses[K]
  ) => {
    setSurveyResponses((prev) => ({ ...prev, [key]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!email) {
          toast({
            title: "Email required",
            description: "Please enter your email address",
            variant: "destructive",
          });
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          toast({
            title: "Invalid email",
            description: "Please enter a valid email address",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 2:
        if (!surveyResponses.user_type) {
          toast({
            title: "Please select an option",
            description: "Tell us which best describes you",
            variant: "destructive",
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSkipSurvey = async () => {
    await handleSubmit(true);
  };

  const handleSubmit = async (skipSurvey = false) => {
    if (!validateStep(1)) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("waitlist-signup", {
        body: {
          email,
          full_name: fullName || undefined,
          company_name: companyName || undefined,
          referral_source: "landing_page",
          survey_responses: skipSurvey ? undefined : surveyResponses,
        },
      });

      if (error) throw error;

      // Fire confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#8b5cf6", "#ec4899"],
      });

      setPosition(data.position);
      setTotalCount(data.totalCount);
      setShowSuccess(true);

      toast({
        title: data.isExisting ? "Already on waitlist!" : "🎉 You're on the waitlist!",
        description: `You're #${data.position} in line. Check your email for confirmation!`,
      });
    } catch (error: any) {
      console.error("Waitlist signup error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess && position && totalCount) {
    return (
      <WaitlistSuccess
        position={position}
        totalCount={totalCount}
        email={email}
        onClose={() => setShowSuccess(false)}
      />
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <SurveyProgress currentStep={currentStep} />

      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-lg">
        <AnimatePresence mode="wait" custom={currentStep}>
          <motion.div
            key={currentStep}
            custom={currentStep}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                    Join the Accountant AI Waitlist
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get early access to AI-powered accounting
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                    <Input
                      type="email"
                      placeholder="Enter your email *"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 text-base"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                      <Input
                        type="text"
                        placeholder="Full Name (optional)"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 h-11"
                      />
                    </div>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                      <Input
                        type="text"
                        placeholder="Company (optional)"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 h-12"
                  >
                    Continue to Survey
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSkipSurvey}
                    disabled={isLoading}
                    className="h-12"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <SkipForward className="mr-2 h-4 w-4" />
                        Quick Join
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Complete our 1-minute survey to help us build the perfect product for you
                </p>
              </div>
            )}

            {/* Step 2: User Type & Stress Level */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <SurveyRadioGroup
                  label="Which best describes you?"
                  options={userTypes}
                  value={surveyResponses.user_type}
                  onChange={(value) => updateSurveyResponse("user_type", value)}
                  required
                />

                <SurveyRadioGroup
                  label="How stressful do you currently find managing taxes, accounting, or compliance?"
                  options={stressLevels}
                  value={surveyResponses.stress_level}
                  onChange={(value) => updateSurveyResponse("stress_level", value)}
                />
              </div>
            )}

            {/* Step 3: Pain Points & Value Rating */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <SurveyCheckboxGroup
                  label="Have you ever experienced any of the following because of tax or accounting issues?"
                  hint="Select all that apply"
                  options={painPoints}
                  values={surveyResponses.pain_points}
                  onChange={(values) => updateSurveyResponse("pain_points", values)}
                  exclusiveOption="none"
                />

                <SurveyRadioGroup
                  label="If an AI could automatically handle your accounting, tax compliance, and explain everything in simple language, how valuable would that be to you?"
                  options={valueRatings}
                  value={surveyResponses.value_rating}
                  onChange={(value) => updateSurveyResponse("value_rating", value)}
                />
              </div>
            )}

            {/* Step 4: Pricing & Notifications */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <SurveyRadioGroup
                  label="Would you pay for a tool that helps you avoid tax penalties and simplifies your finances?"
                  options={pricingPreferences}
                  value={surveyResponses.pricing_preference}
                  onChange={(value) => updateSurveyResponse("pricing_preference", value)}
                />

                <SurveyCheckboxGroup
                  label="What would make you start using Accountant AI immediately?"
                  hint="Select all that apply"
                  options={urgencyTriggers}
                  values={surveyResponses.urgency_triggers}
                  onChange={(values) => updateSurveyResponse("urgency_triggers", values)}
                />

                <SurveyCheckboxGroup
                  label="Can we notify you when early access opens?"
                  options={notificationPreferences}
                  values={surveyResponses.notification_preferences}
                  onChange={(values) =>
                    updateSurveyResponse("notification_preferences", values)
                  }
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons for steps 2-4 */}
        {currentStep > 1 && (
          <div className="flex gap-3 mt-6 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1 h-12"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isLoading}
                className="flex-1 h-12"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Join Waitlist
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
