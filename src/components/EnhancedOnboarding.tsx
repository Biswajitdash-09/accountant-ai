import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Globe,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  CreditCard,
  Brain,
  Target,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Region = "UK" | "US" | "India" | "Nigeria";

interface OnboardingData {
  region: Region | null;
  bankConnected: boolean;
  accountingSoftware: string | null;
  fiscalYearEnd: string;
  preferredLanguage: string;
}

export const EnhancedOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    region: null,
    bankConnected: false,
    accountingSoftware: null,
    fiscalYearEnd: new Date().toISOString().split("T")[0],
    preferredLanguage: "en",
  });

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;
  const [arnoldGreeting, setArnoldGreeting] = useState("");
  const [goals, setGoals] = useState({ savings: "", investment: "", debt: "" });

  const regions: { value: Region; label: string; flag: string }[] = [
    { value: "UK", label: "United Kingdom", flag: "🇬🇧" },
    { value: "US", label: "United States", flag: "🇺🇸" },
    { value: "India", label: "India", flag: "🇮🇳" },
    { value: "Nigeria", label: "Nigeria", flag: "🇳🇬" },
  ];

  const accountingSoftwareOptions = [
    { value: "quickbooks", label: "QuickBooks Online" },
    { value: "xero", label: "Xero" },
    { value: "zoho", label: "Zoho Books" },
    { value: "none", label: "None (I'll set this up later)" },
  ];

  const handleRegionSelect = (region: Region) => {
    setOnboardingData({ ...onboardingData, region });
  };

  const handleBankConnection = async () => {
    if (!onboardingData.region) {
      toast({
        title: "Select a region first",
        description: "Please go back and select your region",
        variant: "destructive",
      });
      return;
    }

    // Redirect to appropriate bank connection based on region
    const redirectMap: Record<Region, string> = {
      UK: "/integrations?connect=truelayer",
      US: "/integrations?connect=yodlee",
      India: "/integrations?connect=yodlee",
      Nigeria: "/integrations?connect=mono",
    };

    toast({
      title: "Redirecting to bank connection",
      description: `Opening ${onboardingData.region} banking integration...`,
    });

    // Mark as connected (they'll be redirected and come back)
    setOnboardingData({ ...onboardingData, bankConnected: true });
    
    // In a real scenario, we'd redirect and handle callback
    // For now, just mark as done and move forward
    setTimeout(() => {
      toast({
        title: "Bank connection initialized",
        description: "You can connect your bank account from the integrations page later",
      });
    }, 1500);
  };

  const handleAccountingSoftwareSelect = (software: string) => {
    setOnboardingData({
      ...onboardingData,
      accountingSoftware: software === "none" ? null : software,
    });
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          region: onboardingData.region,
          fiscal_year_end: onboardingData.fiscalYearEnd,
          accounting_software: onboardingData.accountingSoftware,
          preferred_language: onboardingData.preferredLanguage,
          onboarding_completed: true,
          onboarding_step: 4,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Welcome aboard! 🎉",
        description: "Your account is all set up. Let's get started!",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await supabase
        .from("profiles")
        .update({
          onboarding_completed: true,
          onboarding_step: currentStep,
        })
        .eq("id", user.id);

      navigate("/dashboard");
    } catch (error) {
      console.error("Error skipping onboarding:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleArnoldQuestion = (question: string) => {
    setArnoldGreeting(
      `Great question! ${question} - I can help you track income, expenses, optimize taxes, and provide AI-powered insights. I analyze your financial data in real-time and give you personalized advice in plain English. Try asking me anything once you complete setup!`
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return onboardingData.region !== null;
      case 2:
        return true; // Bank connection is optional
      case 3:
        return onboardingData.accountingSoftware !== null;
      case 4:
        return onboardingData.fiscalYearEnd !== "";
      case 5:
        return arnoldGreeting !== ""; // Arnold interaction required
      case 6:
        return true; // Goals are optional
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Globe className="h-16 w-16 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Choose Your Region</h2>
              <p className="text-muted-foreground">
                This helps us provide region-specific tax rules and banking integrations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regions.map((region) => (
                <Card
                  key={region.value}
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    onboardingData.region === region.value
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => handleRegionSelect(region.value)}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-4xl">{region.flag}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold">{region.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {region.value} tax rules & banking
                      </p>
                    </div>
                    {onboardingData.region === region.value && (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CreditCard className="h-16 w-16 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Connect Your Bank Account</h2>
              <p className="text-muted-foreground">
                Securely connect your bank to automatically sync transactions
              </p>
            </div>

            <Card className="p-6 space-y-4">
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Bank-level Security</h3>
                  <p className="text-sm text-muted-foreground">
                    256-bit encryption with read-only access to your accounts
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Automatic Sync</h3>
                  <p className="text-sm text-muted-foreground">
                    Transactions update automatically - no manual entry needed
                  </p>
                </div>
              </div>

              <Button
                onClick={handleBankConnection}
                className="w-full mt-4"
                size="lg"
              >
                Connect Bank Account
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Powered by {onboardingData.region === "UK" && "TrueLayer"}
                {onboardingData.region === "US" && "Yodlee"}
                {onboardingData.region === "India" && "Yodlee"}
                {onboardingData.region === "Nigeria" && "Mono"}
                {!onboardingData.region && "secure Open Banking APIs"}
              </p>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Building2 className="h-16 w-16 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Link Accounting Software</h2>
              <p className="text-muted-foreground">
                Sync with your existing accounting software (optional)
              </p>
            </div>

            <div className="space-y-3">
              {accountingSoftwareOptions.map((software) => (
                <Card
                  key={software.value}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    onboardingData.accountingSoftware === software.value ||
                    (software.value === "none" &&
                      onboardingData.accountingSoftware === null)
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => handleAccountingSoftwareSelect(software.value)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{software.label}</span>
                    {(onboardingData.accountingSoftware === software.value ||
                      (software.value === "none" &&
                        onboardingData.accountingSoftware === null)) && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <p className="text-sm text-muted-foreground text-center">
              You can always connect or change this later from Settings
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Calendar className="h-16 w-16 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Financial Preferences</h2>
              <p className="text-muted-foreground">
                Set up your accounting preferences
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fiscal-year-end">Fiscal Year End Date</Label>
                <Input
                  id="fiscal-year-end"
                  type="date"
                  value={onboardingData.fiscalYearEnd}
                  onChange={(e) =>
                    setOnboardingData({
                      ...onboardingData,
                      fiscalYearEnd: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  When does your fiscal year end? (Default: December 31st)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                <Select
                  value={onboardingData.preferredLanguage}
                  onValueChange={(value) =>
                    setOnboardingData({
                      ...onboardingData,
                      preferredLanguage: value,
                    })
                  }
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                    <SelectItem value="ig">Igbo</SelectItem>
                    <SelectItem value="yo">Yoruba</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Brain className="h-16 w-16 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Meet Arnold, Your AI Accountant</h2>
              <p className="text-muted-foreground">
                Arnold analyzes your finances and gives you insights in plain English
              </p>
            </div>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-4">
                <Brain className="h-8 w-8 text-primary flex-shrink-0" />
                <div className="space-y-2">
                  <p className="font-medium">
                    Hi! I'm Arnold, your AI financial assistant. Ask me anything about managing your finances!
                  </p>
                  {arnoldGreeting && (
                    <p className="text-sm text-muted-foreground bg-background p-3 rounded-lg">
                      {arnoldGreeting}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="justify-start h-auto py-3 text-left"
                onClick={() => handleArnoldQuestion("How can you help me?")}
              >
                <span className="text-sm">How can you help me manage my finances?</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3 text-left"
                onClick={() => handleArnoldQuestion("What insights do you provide?")}
              >
                <span className="text-sm">What kind of insights do you provide?</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3 text-left"
                onClick={() => handleArnoldQuestion("Can you help with taxes?")}
              >
                <span className="text-sm">Can you help me with tax optimization?</span>
              </Button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Target className="h-16 w-16 mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Set Your Financial Goals</h2>
              <p className="text-muted-foreground">
                What would you like to achieve? (Optional)
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="savings-goal">Savings Goal</Label>
                <Input
                  id="savings-goal"
                  type="text"
                  placeholder="e.g., Save $10,000 for emergency fund"
                  value={goals.savings}
                  onChange={(e) => setGoals({ ...goals, savings: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="investment-goal">Investment Goal</Label>
                <Input
                  id="investment-goal"
                  type="text"
                  placeholder="e.g., Build a $100k investment portfolio"
                  value={goals.investment}
                  onChange={(e) => setGoals({ ...goals, investment: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="debt-goal">Debt Reduction Goal</Label>
                <Input
                  id="debt-goal"
                  type="text"
                  placeholder="e.g., Pay off $5,000 credit card debt"
                  value={goals.debt}
                  onChange={(e) => setGoals({ ...goals, debt: e.target.value })}
                />
              </div>
            </div>

            <Card className="p-4 bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-2">Your Setup Summary</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Region:</span>{" "}
                  <span className="font-medium">{onboardingData.region}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Bank:</span>{" "}
                  <span className="font-medium">
                    {onboardingData.bankConnected ? "Will connect later" : "Not connected"}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Software:</span>{" "}
                  <span className="font-medium">
                    {onboardingData.accountingSoftware || "None"}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Fiscal Year:</span>{" "}
                  <span className="font-medium">
                    {new Date(onboardingData.fiscalYearEnd).toLocaleDateString()}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Arnold:</span>{" "}
                  <span className="font-medium">Ready to assist</span>
                </p>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <Card className="p-8 shadow-2xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-sm font-medium text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                disabled={loading}
              >
                Skip for now
              </Button>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {renderStep()}

          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed() || loading}
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed() || loading}
              >
                Complete Setup
                <CheckCircle2 className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
