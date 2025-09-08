import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat } from '@zxing/library';
import { useDropzone } from 'react-dropzone';
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = false;

type ScanType = 'receipt' | 'upi' | 'spreadsheet';

interface ParsedReceipt {
  type: 'receipt';
  items: { description: string; amount: number }[];
  total: number;
  raw_text: string;
}

interface ParsedUPI {
  type: 'upi';
  name: string | null;
  upiId: string | null;
  amount: string | null;
  note: string | null;
  currency: string;
}

interface ParsedSpreadsheet {
  type: 'spreadsheet';
  headers: string[];
  rows: string[][];
  raw_text: string;
}

type ParsedData = ParsedReceipt | ParsedUPI | ParsedSpreadsheet | { raw: string };

interface ScanHistory {
  type: ScanType;
  raw: string;
  parsed: ParsedData;
  timestamp: string;
}

const BarcodeScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');
  const [scanType, setScanType] = useState<ScanType>('receipt');
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader(undefined, {
      delayBetweenScanAttempts: 300,
    });

    const stored = localStorage.getItem('scan_history');
    if (stored) {
      setHistory(JSON.parse(stored));
    }

    return () => stopScanning();
  }, []);

  const startScanning = async () => {
    if (!readerRef.current || !videoRef.current) return;

    try {
      setIsScanning(true);
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (devices.length === 0) {
        alert('No video devices found.');
        setIsScanning(false);
        return;
      }

      const selectedDeviceId = devices[0].deviceId;

      controlsRef.current = await readerRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            const text = result.getText();
            setLastResult(text);
            processResult(text);
            stopScanning();
          }

          if (error && error.name !== 'NotFoundException') {
            console.error('Decode error:', error);
          }
        }
      ) as unknown as { stop: () => void };
    } catch (err) {
      console.error('Failed to start scanner:', err);
      alert('Camera access failed.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setIsScanning(false);
  };

  const processResult = (raw: string) => {
    let parsed: ParsedData = { raw };

    if (scanType === 'receipt') parsed = parseReceipt(raw);
    else if (scanType === 'upi') parsed = parseUPI(raw);
    else if (scanType === 'spreadsheet') parsed = parseSpreadsheet(raw);

    const scan: ScanHistory = {
      type: scanType,
      raw,
      parsed,
      timestamp: new Date().toISOString(),
    };

    const updated = [scan, ...history];
    setHistory(updated);
    localStorage.setItem('scan_history', JSON.stringify(updated));

    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      const shouldRedirect = window.confirm(`Open this link in a new tab?\n\n${raw}`);
      if (shouldRedirect) {
        window.open(raw, '_blank');
      }
    }
  };

  const parseReceipt = (text: string): ParsedReceipt => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const items: { description: string; amount: number }[] = [];
    let total = 0;

    for (const line of lines) {
      const match = line.match(/([^\d]*)(\d+\.?\d*)/);
      if (match) {
        const amount = parseFloat(match[2]);
        if (amount > 0) {
          items.push({ description: match[1].trim(), amount });
          total += amount;
        }
      }
    }

    return { type: 'receipt', items, total, raw_text: text };
  };

  const parseUPI = (text: string): ParsedUPI | { raw: string } => {
    const match = text.match(/upi:\/\/pay\?(.+)/i);
    if (match) {
      const params = new URLSearchParams(match[1]);
      return {
        type: 'upi',
        name: params.get('pn'),
        upiId: params.get('pa'),
        amount: params.get('am'),
        note: params.get('tn'),
        currency: params.get('cu') || 'INR',
      };
    }
    return { raw: text };
  };

  const parseSpreadsheet = (text: string): ParsedSpreadsheet | { raw: string } => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) return { raw: text };

    const rows = lines.map(line => line.split(/[,|\t;]/).map(cell => cell.trim()));
    const headers = rows[0];
    const dataRows = rows.slice(1);

    return {
      type: 'spreadsheet',
      headers,
      rows: dataRows,
      raw_text: text
    };
  };

  // Image processing functions
  const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
    try {
      console.log('Starting background removal process...');
      const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
        device: 'webgpu',
      });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Could not get canvas context');
      
      const MAX_IMAGE_DIMENSION = 1024;
      let width = imageElement.naturalWidth;
      let height = imageElement.naturalHeight;

      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
          width = MAX_IMAGE_DIMENSION;
        } else {
          width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
          height = MAX_IMAGE_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(imageElement, 0, 0, width, height);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      console.log('Processing with segmentation model...');
      const result = await segmenter(imageData);
      
      if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
        throw new Error('Invalid segmentation result');
      }
      
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = canvas.width;
      outputCanvas.height = canvas.height;
      const outputCtx = outputCanvas.getContext('2d');
      
      if (!outputCtx) throw new Error('Could not get output canvas context');
      
      outputCtx.drawImage(canvas, 0, 0);
      
      const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
      const data = outputImageData.data;
      
      for (let i = 0; i < result[0].mask.data.length; i++) {
        const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
        data[i * 4 + 3] = alpha;
      }
      
      outputCtx.putImageData(outputImageData, 0, 0);
      
      return new Promise((resolve, reject) => {
        outputCanvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/png',
          1.0
        );
      });
    } catch (error) {
      console.error('Error removing background:', error);
      throw error;
    }
  };

  const loadImage = (file: Blob): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const processUploadedImage = async (file: File) => {
    setIsProcessing(true);
    try {
      console.log('Processing uploaded file:', file.name);
      
      // Load the image
      const imageElement = await loadImage(file);
      setProcessedImage(imageElement.src);
      
      // Try to scan the original image first
      let scanResult = await scanImageWithZXing(imageElement);
      
      // If no result, try with background removal
      if (!scanResult) {
        console.log('No QR code found, trying background removal...');
        try {
          const processedBlob = await removeBackground(imageElement);
          const processedImageElement = await loadImage(processedBlob);
          scanResult = await scanImageWithZXing(processedImageElement);
          
          // Update processed image preview
          setProcessedImage(processedImageElement.src);
        } catch (bgError) {
          console.log('Background removal failed, using original image');
        }
      }
      
      if (scanResult) {
        setLastResult(scanResult);
        processResult(scanResult);
      } else {
        alert('No QR code or barcode found in the image. Please try a clearer image.');
      }
    } catch (error) {
      console.error('Error processing uploaded image:', error);
      alert('Failed to process the image. Please try another image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const scanImageWithZXing = async (imageElement: HTMLImageElement): Promise<string | null> => {
    return new Promise((resolve) => {
      if (readerRef.current) {
        try {
          // Convert image to canvas and then to ImageData for ZXing
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve(null);
            return;
          }
          
          canvas.width = imageElement.naturalWidth;
          canvas.height = imageElement.naturalHeight;
          ctx.drawImage(imageElement, 0, 0);
          
          // Use decodeFromImageUrl with the canvas data URL
          const dataUrl = canvas.toDataURL();
          readerRef.current.decodeFromImageUrl(dataUrl)
            .then(result => {
              resolve(result ? result.getText() : null);
            })
            .catch(() => {
              resolve(null);
            });
        } catch (error) {
          console.log('ZXing scan failed:', error);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  };

  // File drop zone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      processUploadedImage(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false
  });

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
      <h2>AI Barcode & QR Scanner</h2>

      <div style={{ marginBottom: 20 }}>
        <label><strong>Select Scan Type:</strong></label><br />
        <select value={scanType} onChange={e => setScanType(e.target.value as ScanType)} style={{ padding: 8, marginBottom: 15 }}>
          <option value="receipt">Receipt</option>
          <option value="upi">UPI Payment</option>
          <option value="spreadsheet">Spreadsheet</option>
        </select>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', marginBottom: 20, borderBottom: '2px solid #eee' }}>
        <button
          onClick={() => setActiveTab('camera')}
          style={{
            ...tabStyle,
            backgroundColor: activeTab === 'camera' ? '#007bff' : 'transparent',
            color: activeTab === 'camera' ? '#fff' : '#007bff'
          }}
        >
          📷 Camera Scan
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          style={{
            ...tabStyle,
            backgroundColor: activeTab === 'upload' ? '#007bff' : 'transparent',
            color: activeTab === 'upload' ? '#fff' : '#007bff'
          }}
        >
          📁 Upload Image
        </button>
      </div>

      {/* Camera Tab */}
      {activeTab === 'camera' && (
        <div>
          <div style={{ margin: '20px 0' }}>
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '300px',
                background: '#eee',
                borderRadius: 8,
                display: isScanning ? 'block' : 'none',
              }}
              muted
              playsInline
            />
            {!isScanning && (
              <div
                style={{
                  width: '100%',
                  height: '300px',
                  background: '#eee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  color: '#999',
                }}
              >
                📷 Camera preview will appear here
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {!isScanning ? (
              <button onClick={startScanning} style={buttonStyle}>Start Camera Scan</button>
            ) : (
              <button onClick={stopScanning} style={{ ...buttonStyle, background: '#dc3545' }}>Stop Scanning</button>
            )}
          </div>
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div>
          <div
            {...getRootProps()}
            style={{
              ...dropZoneStyle,
              borderColor: isDragActive ? '#007bff' : '#ccc',
              backgroundColor: isDragActive ? '#f0f8ff' : '#fafafa'
            }}
          >
            <input {...getInputProps()} />
            {isProcessing ? (
              <div style={{ textAlign: 'center' }}>
                <div style={spinnerStyle}></div>
                <p style={{ margin: '10px 0', color: '#666' }}>Processing image...</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                  Trying to detect QR codes and barcodes...
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
                <p style={{ margin: '10px 0', color: '#666', fontWeight: 'bold' }}>
                  {isDragActive ? 'Drop the image here!' : 'Drag & drop an image or click to browse'}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                  Supports JPG, PNG, GIF, BMP, WebP • AI background removal for better scanning
                </p>
              </div>
            )}
          </div>

          {processedImage && (
            <div style={{ marginTop: 20 }}>
              <h4>Preview:</h4>
              <img 
                src={processedImage} 
                alt="Processed scan" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '200px', 
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  objectFit: 'contain'
                }}
              />
            </div>
          )}
        </div>
      )}

      {lastResult && history[0] && (
        <div style={{ marginTop: 20 }}>
          <h4>Last Scan:</h4>
          {history[0].parsed && 'type' in history[0].parsed && history[0].parsed.type === 'spreadsheet' ? (
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  {(history[0].parsed as ParsedSpreadsheet).headers.map((h, i) => (
                    <th key={i} style={cellStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(history[0].parsed as ParsedSpreadsheet).rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} style={cellStyle}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <pre style={resultBox}>{JSON.stringify(history[0]?.parsed, null, 2)}</pre>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h4>Scan History</h4>
          <ul>
            {history.map((scan, idx) => (
              <li key={idx} style={{ marginBottom: 10 }}>
                <strong>{scan.type.toUpperCase()}</strong> - {new Date(scan.timestamp).toLocaleString()}
                <pre style={resultBox}>{JSON.stringify(scan.parsed, null, 2)}</pre>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
};

const resultBox: React.CSSProperties = {
  background: '#f5f5f5',
  padding: 10,
  borderRadius: 6,
  fontFamily: 'monospace',
  fontSize: 12,
  overflowX: 'auto',
};

const cellStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '6px 10px',
  textAlign: 'left',
};

const tabStyle: React.CSSProperties = {
  padding: '10px 20px',
  border: 'none',
  borderBottom: '2px solid transparent',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
};

const dropZoneStyle: React.CSSProperties = {
  border: '2px dashed #ccc',
  borderRadius: 8,
  padding: '40px 20px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  minHeight: '200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const spinnerStyle: React.CSSProperties = {
  border: '4px solid #f3f3f3',
  borderTop: '4px solid #007bff',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  animation: 'spin 1s linear infinite',
  margin: '0 auto',
};

export default BarcodeScanner;