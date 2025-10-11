import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserFinancialProfile {
  age?: number;
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals?: string[];
  retirementAge?: number;
  hasInvestments: boolean;
  totalInvestments: number;
}

export const useUserFinancialProfile = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user_financial_profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get user profile for age calculation
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Get user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get investment count
      const { count: investmentCount } = await supabase
        .from('user_investments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Calculate age from user metadata if available
      const birthDate = user.user_metadata?.birth_date;
      let age: number | undefined;
      if (birthDate) {
        const birth = new Date(birthDate);
        const today = new Date();
        age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
      }

      // Safely parse notification preferences
      const notifPrefs = preferences?.notification_preferences as Record<string, any> | null;
      
      const financialProfile: UserFinancialProfile = {
        age,
        riskTolerance: notifPrefs?.risk_tolerance as 'conservative' | 'moderate' | 'aggressive' | undefined,
        investmentGoals: Array.isArray(notifPrefs?.goals) ? notifPrefs.goals : undefined,
        retirementAge: typeof notifPrefs?.retirement_age === 'number' ? notifPrefs.retirement_age : undefined,
        hasInvestments: (investmentCount || 0) > 0,
        totalInvestments: investmentCount || 0,
      };

      return financialProfile;
    },
  });

  // Determine if user should see retirement planning prompts
  const shouldShowRetirementAdvice = profile?.age && profile.age >= 35;

  // Determine risk level text
  const getRiskLevelText = () => {
    if (!profile?.riskTolerance) return 'Not set';
    return profile.riskTolerance.charAt(0).toUpperCase() + profile.riskTolerance.slice(1);
  };

  return {
    profile,
    isLoading,
    shouldShowRetirementAdvice,
    getRiskLevelText,
  };
};