
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
  const { availableCredits, useCredit } = useCredits();

  const generateResponse = async (message: string): Promise<AIResponse> => {
    // Check if user has credits available
    if (availableCredits <= 0) {
      toast({
        title: "No Credits Available",
        description: "You need credits to use AI features. Please purchase credits or wait for daily reset.",
        variant: "destructive",
      });
      return {
        text: "I'm sorry, but you don't have enough credits to use AI features. Please purchase credits or wait for your daily free credits to reset.",
        error: 'No credits available'
      };
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
