import { createWorker, Worker as TesseractWorker } from 'tesseract.js';

let worker: TesseractWorker | null = null;
let isInitialized = false;

// Initialize Tesseract worker
const initWorker = async () => {
  if (!worker) {
    worker = await createWorker('eng+hin', 1, {
      logger: (m) => {
        // Send progress updates to main thread
        if (m.status === 'recognizing text') {
          postMessage({
            type: 'OCR_PROGRESS',
            data: { progress: m.progress }
          });
        }
      }
    });

    // Configure for better receipt recognition
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,:-/₹$€£¥ \n',
      tessedit_pageseg_mode: '6' as any, // Uniform block of text
      tessedit_ocr_engine_mode: '1', // LSTM only
    });

    isInitialized = true;
  }
  return worker;
};

// Handle messages from main thread  
self.onmessage = async (event) => {
  const { type, data, id } = event.data;

  try {
    switch (type) {
      case 'OCR_IMAGE':
        const { imageData, options = {} } = data;
        
        try {
          const tesseractWorker = await initWorker();
          
          // Set PSM (Page Segmentation Mode) if specified
          if (options.psm) {
            await tesseractWorker.setParameters({
              tessedit_pageseg_mode: options.psm.toString()
            });
          }

          const { data: result } = await tesseractWorker.recognize(imageData);
          
          postMessage({
            type: 'OCR_SUCCESS',
            id,
            data: {
              text: result.text,
              confidence: result.confidence,
              words: (result as any).words?.map((word: any) => ({
                text: word.text,
                confidence: word.confidence,
                bbox: word.bbox
              })) || [],
              lines: (result as any).lines?.map((line: any) => ({
                text: line.text,
                confidence: line.confidence,
                bbox: line.bbox
              })) || []
            }
          });
        } catch (error) {
          postMessage({
            type: 'OCR_ERROR',
            id,
            error: error instanceof Error ? error.message : 'OCR failed'
          });
        }
        break;

      case 'OCR_RECEIPT':
        const { imageData: receiptImage } = data;
        
        try {
          const tesseractWorker = await initWorker();
          
          // Configure for receipt-specific OCR
          await tesseractWorker.setParameters({
            tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,:-/₹$€£¥ \n()[]',
            tessedit_pageseg_mode: '6' as any, // Uniform block of text
            tessedit_ocr_engine_mode: '1', // LSTM only
          });

          const { data: result } = await tesseractWorker.recognize(receiptImage);
          
          // Parse receipt data
          const parsedReceipt = parseReceiptText(result.text);
          
          postMessage({
            type: 'OCR_RECEIPT_SUCCESS',
            id,
            data: {
              raw_text: result.text,
              confidence: result.confidence,
              parsed: parsedReceipt,
              words: (result as any).words?.map((word: any) => ({
                text: word.text,
                confidence: word.confidence,
                bbox: word.bbox
              })) || []
            }
          });
        } catch (error) {
          postMessage({
            type: 'OCR_ERROR',
            id,
            error: error instanceof Error ? error.message : 'Receipt OCR failed'
          });
        }
        break;

      case 'TERMINATE':
        if (worker) {
          await worker.terminate();
          worker = null;
          isInitialized = false;
        }
        postMessage({ type: 'TERMINATED', id });
        break;

      default:
        postMessage({
          type: 'ERROR',
          id,
          error: `Unknown message type: ${type}`
        });
        break;
    }
  } catch (error) {
    postMessage({
      type: 'ERROR',
      id,
      error: error instanceof Error ? error.message : 'OCR Worker error'
    });
  }
};

// Parse receipt text to extract structured data
const parseReceiptText = (text: string) => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const items: Array<{ description: string; amount: number }> = [];
  let total = 0;
  let merchantName = '';
  let date = '';

  // Try to identify merchant name (usually first few lines)
  if (lines.length > 0) {
    merchantName = lines[0].replace(/[^a-zA-Z0-9\s]/g, '').trim();
  }

  // Try to find date patterns
  const datePattern = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})|(\d{1,2}\s+\w+\s+\d{2,4})/;
  for (const line of lines) {
    const dateMatch = line.match(datePattern);
    if (dateMatch && !date) {
      date = dateMatch[0];
      break;
    }
  }

  // Parse items and amounts
  for (const line of lines) {
    // Look for price patterns: numbers with currency symbols or decimal points
    const pricePattern = /(?:₹|Rs\.?|\$|€|£)?\s*(\d+(?:\.\d{2})?)|(\d+\.\d{2})\s*(?:₹|Rs\.?|\$|€|£)?/g;
    const matches = Array.from(line.matchAll(pricePattern));

    if (matches.length > 0) {
      // Try to extract item description (text before the price)
      const lastMatch = matches[matches.length - 1];
      const amount = parseFloat(lastMatch[1] || lastMatch[2]);
      
      if (amount > 0) {
        const description = line.substring(0, lastMatch.index).trim();
        
        // Skip lines that look like totals
        if (!description.toLowerCase().includes('total') && 
            !description.toLowerCase().includes('subtotal') &&
            !description.toLowerCase().includes('tax') &&
            description.length > 2) {
          items.push({ description, amount });
        }

        // Check if this looks like a total
        if (description.toLowerCase().includes('total')) {
          total = Math.max(total, amount);
        }
      }
    }
  }

  // If no explicit total found, sum the items
  if (total === 0 && items.length > 0) {
    total = items.reduce((sum, item) => sum + item.amount, 0);
  }

  return {
    type: 'receipt' as const,
    merchant: merchantName,
    date,
    items,
    total,
    raw_text: text
  };
};

// Handle worker errors
self.onerror = (error) => {
  console.error('OCR Worker Error:', error);
  postMessage({
    type: 'WORKER_ERROR',
    error: typeof error === 'string' ? error : (error as ErrorEvent).message || 'Unknown OCR worker error'
  });
};