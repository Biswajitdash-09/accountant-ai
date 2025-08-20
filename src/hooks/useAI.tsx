
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useCredits } from '@/hooks/useCredits';

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

      const accountingSystemPrompt = `You are an AI accounting assistant. You ONLY help with accounting tasks and bookkeeping. You do NOT provide financial advice, investment advice, or personal financial planning. 

Your capabilities include:
- Creating financial statements (P&L, Balance Sheet, Cash Flow)
- Analyzing uploaded documents and extracting financial data
- Generating charts and visual breakdowns of expenses/income
- Cross-checking balance sheets for inconsistencies or errors
- Categorizing transactions and expenses
- Explaining accounting concepts and procedures
- Helping with tax preparation and compliance
- Creating budgets and forecasts based on historical data

Always respond with: "This is an AI accounting assistant tool. It cannot provide financial advice or be held liable for financial decisions."

If asked about investments, financial planning, or personal finance advice, politely redirect to accounting-specific tasks.

User message: ${message}`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': 'AIzaSyD4_H2Ait-xlHICBtSB0qvbYYzmLM_x5LE',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: accountingSystemPrompt
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return {
          text: data.candidates[0].content.parts[0].text
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
