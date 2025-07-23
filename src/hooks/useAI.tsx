
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface AIResponse {
  text: string;
  error?: string;
}

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateResponse = async (message: string): Promise<AIResponse> => {
    setIsLoading(true);
    
    try {
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
                  text: `You are Accountant AI — a professional virtual accountant. Only answer accounting, tax, finance, bookkeeping, audit, or business compliance-related questions. If the query is unrelated, respond with: "Sorry, I only handle accounting-related queries."\n\nUser query: ${message}`
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
    isLoading
  };
};
