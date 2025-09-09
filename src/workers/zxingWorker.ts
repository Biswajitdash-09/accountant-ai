import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat } from '@zxing/library';

let reader: BrowserMultiFormatReader | null = null;

// Initialize the reader
const initReader = () => {
  if (!reader) {
    reader = new BrowserMultiFormatReader(undefined, {
      delayBetweenScanAttempts: 100,
    });
  }
  return reader;
};

// Handle messages from main thread
self.onmessage = async (event) => {
  const { type, data, id } = event.data;

  try {
    const reader = initReader();

    switch (type) {
      case 'DECODE_IMAGE':
        const { imageData, formats } = data;
        
        // Set supported formats if provided
        if (formats && formats.length > 0) {
          const barcodeFormats = formats.map((format: string) => {
            switch (format) {
              case 'QR_CODE': return BarcodeFormat.QR_CODE;
              case 'CODE_128': return BarcodeFormat.CODE_128;
              case 'EAN_13': return BarcodeFormat.EAN_13;
              case 'EAN_8': return BarcodeFormat.EAN_8;
              case 'UPC_A': return BarcodeFormat.UPC_A;
              case 'UPC_E': return BarcodeFormat.UPC_E;
              case 'CODE_39': return BarcodeFormat.CODE_39;
              case 'ITF': return BarcodeFormat.ITF;
              case 'CODABAR': return BarcodeFormat.CODABAR;
              case 'PDF_417': return BarcodeFormat.PDF_417;
              case 'DATA_MATRIX': return BarcodeFormat.DATA_MATRIX;
              default: return BarcodeFormat.QR_CODE;
            }
          });
        }

        try {
          const result = await reader.decodeFromImageUrl(imageData);
          
          postMessage({
            type: 'DECODE_SUCCESS',
            id,
            data: {
              text: result.getText(),
              format: result.getBarcodeFormat(),
              resultPoints: result.getResultPoints()?.map(p => ({ x: p.getX(), y: p.getY() })) || []
            }
          });
        } catch (error) {
          postMessage({
            type: 'DECODE_ERROR', 
            id,
            error: error instanceof Error ? error.message : 'Decode failed'
          });
        }
        break;

      case 'DECODE_FROM_CANVAS':
        const { canvas } = data;
        try {
          const result = await reader.decodeFromCanvas(canvas);
          postMessage({
            type: 'DECODE_SUCCESS',
            id,
            data: {
              text: result.getText(),
              format: result.getBarcodeFormat(),
              resultPoints: result.getResultPoints()?.map(p => ({ x: p.getX(), y: p.getY() })) || []
            }
          });
        } catch (error) {
          postMessage({
            type: 'DECODE_ERROR',
            id, 
            error: error instanceof Error ? error.message : 'Canvas decode failed'
          });
        }
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
      error: error instanceof Error ? error.message : 'Worker error'
    });
  }
};

// Handle worker errors
self.onerror = (error) => {
  console.error('ZXing Worker Error:', error);
  postMessage({
    type: 'WORKER_ERROR',
    error: typeof error === 'string' ? error : (error as ErrorEvent).message || 'Unknown worker error'
  });
};