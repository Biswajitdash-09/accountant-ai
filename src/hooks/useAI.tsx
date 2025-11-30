
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useCredits } from '@/hooks/useCredits';
import { supabase } from '@/integrations/supabase/client';

interface AIResponse {
  text: string;
  error?: string;
}

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { availableCredits, useCredit, credits } = useCredits();

  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const generateResponse = async (message: string): Promise<AIResponse> => {
    // Check if user has credits available
    if (availableCredits <= 0) {
      const resetTime = getTimeUntilReset();
      toast({
        title: "No Credits Available",
        description: `Daily free credits reset in ${resetTime}. Purchase credits to continue using AI features now.`,
        variant: "destructive",
      });
      return {
        text: `I'm sorry, but you don't have enough credits. Your daily free credits will reset in ${resetTime}, or you can purchase credits to continue now.`,
        error: 'No credits available'
      };
    }

    // Warn when credits are low
    if (availableCredits <= 5 && availableCredits > 0) {
      toast({
        title: "Low Credits Warning",
        description: `You have ${availableCredits} credits remaining. Consider purchasing more.`,
        variant: "default",
      });
    }

    setIsLoading(true);
    
    try {
      // Use a credit before making the API call
      const creditUsed = await useCredit.mutateAsync(1);
      
      if (!creditUsed) {
        throw new Error('Failed to use credit');
      }

      // Call secure AI edge function instead of direct API call
      const { data, error } = await supabase.functions.invoke('ai-generate', {
        body: { message }
      });

      if (error) {
        console.error('AI Edge Function Error:', error);
        throw new Error(error.message || 'Failed to get AI response');
      }

      if (data && data.success && data.text) {
        return {
          text: data.text
        };
      } else {
        throw new Error('Invalid response format from AI');
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
      
      return {
        text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateResponse,
    isLoading,
    availableCredits
  };
};
