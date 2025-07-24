
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAI } from '@/hooks/useAI';

export const useOCR = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { generateResponse } = useAI();

  const extractTextFromImage = async (imageFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          
          // Simple OCR simulation - in production, you'd use a proper OCR service
          // For now, we'll return a placeholder text
          resolve("OCR text extraction would be implemented here with a service like Tesseract.js or Google Vision API");
        };
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  };

  const processDocument = async (file: File): Promise<{
    extractedText: string;
    category: string;
    confidence: number;
    tags: string[];
  }> => {
    setIsProcessing(true);
    
    try {
      let extractedText = '';
      
      // Extract text based on file type
      if (file.type.startsWith('image/')) {
        extractedText = await extractTextFromImage(file);
      } else if (file.type === 'application/pdf') {
        // PDF text extraction would go here
        extractedText = "PDF text extraction would be implemented here";
      } else {
        extractedText = "Text extraction for this file type is not yet implemented";
      }

      // Use AI to categorize the document
      const aiResponse = await generateResponse(
        `Analyze this document text and categorize it. Return a JSON object with category, confidence (0-1), and tags array. 
        
        Categories should be one of: invoice, receipt, tax-document, bank-statement, contract, other
        
        Text: ${extractedText}`
      );

      let category = 'other';
      let confidence = 0.5;
      let tags: string[] = [];

      try {
        const parsed = JSON.parse(aiResponse.text);
        category = parsed.category || 'other';
        confidence = parsed.confidence || 0.5;
        tags = parsed.tags || [];
      } catch (e) {
        console.error('Failed to parse AI response:', e);
        // Fallback categorization based on file name
        const fileName = file.name.toLowerCase();
        if (fileName.includes('invoice')) category = 'invoice';
        else if (fileName.includes('receipt')) category = 'receipt';
        else if (fileName.includes('tax')) category = 'tax-document';
        else if (fileName.includes('bank') || fileName.includes('statement')) category = 'bank-statement';
      }

      return {
        extractedText,
        category,
        confidence,
        tags
      };
    } catch (error) {
      console.error('Document processing error:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process document. Please try again.",
        variant: "destructive",
      });
      
      return {
        extractedText: '',
        category: 'other',
        confidence: 0,
        tags: []
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processDocument,
    isProcessing
  };
};
