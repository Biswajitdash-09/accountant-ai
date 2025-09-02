
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, QrCode, Receipt, Table, Smartphone, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useBarcodeScans } from '@/hooks/useBarcodeScans';
import { useBarcodeSpreadsheets } from '@/hooks/useBarcodeSpreadsheets';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat } from '@zxing/library';

interface BarcodeScannerProps {
  onScanComplete?: (data: any) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState<'receipt' | 'spreadsheet' | 'upi'>('receipt');
  const [lastResult, setLastResult] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  const { createScan } = useBarcodeScans();
  const { createSpreadsheet } = useBarcodeSpreadsheets();
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader>();
  const scanningControlsRef = useRef<any>();

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    
    // Check camera permissions
    navigator.permissions?.query({ name: 'camera' as PermissionName })
      .then(result => {
        setHasPermission(result.state === 'granted');
        result.onchange = () => setHasPermission(result.state === 'granted');
      })
      .catch(() => {
        // Permissions API not supported, assume we need to request
        setHasPermission(null);
      });

    return () => {
      if (scanningControlsRef.current) {
        scanningControlsRef.current.stop();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      if (!readerRef.current || !videoRef.current) return;

      setIsScanning(true);
      setHasPermission(null);

      // Start continuous scanning
      scanningControlsRef.current = await readerRef.current.decodeFromVideoDevice(
        undefined, // Use default camera
        videoRef.current,
        (result, error) => {
          if (result) {
            const scannedText = result.getText();
            console.log('QR Code detected:', scannedText);
            setLastResult(scannedText);
            processScanResult(scannedText);
            
            // Stop scanning after successful read
            stopScanning();
          }
          
          if (error && error.name !== 'NotFoundException') {
            console.error('Scanning error:', error);
          }
        }
      );

      setHasPermission(true);
    } catch (error: any) {
      console.error('Failed to start scanning:', error);
      setIsScanning(false);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setHasPermission(false);
        toast({
          title: "Camera Permission Denied",
          description: "Please allow camera access to scan QR codes.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Camera Error",
          description: "Failed to access camera. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const stopScanning = () => {
    if (scanningControlsRef.current) {
      scanningControlsRef.current.stop();
      scanningControlsRef.current = null;
    }
    setIsScanning(false);
  };

  const processScanResult = async (rawContent: string) => {
    try {
      let parsedData = {};
      let confidence = 0.5;

      // Process based on scan type
      switch (scanType) {
        case 'receipt':
          parsedData = parseReceiptData(rawContent);
          confidence = 0.7;
          break;
        case 'spreadsheet':
          parsedData = parseSpreadsheetData(rawContent);
          confidence = 0.8;
          break;
        case 'upi':
          parsedData = parseUPIData(rawContent);
          confidence = 0.9;
          break;
      }

      // Save scan to database
      await createScan.mutateAsync({
        scan_type: scanType,
        raw_content: rawContent,
        parsed_data: parsedData,
        confidence
      });

      // If it's a spreadsheet, create the spreadsheet record
      if (scanType === 'spreadsheet' && parsedData) {
        const spreadsheetData = parsedData as any;
        if (spreadsheetData.headers && spreadsheetData.rows) {
          await createSpreadsheet.mutateAsync({
            title: `Scanned Spreadsheet ${new Date().toLocaleDateString()}`,
            description: 'Created from barcode scan',
            headers: spreadsheetData.headers,
            rows: spreadsheetData.rows
          });
        }
      }

      onScanComplete?.(parsedData);
      
      toast({
        title: "Scan Successful",
        description: `${scanType.charAt(0).toUpperCase() + scanType.slice(1)} scanned and processed successfully.`,
      });

    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process scan result.",
        variant: "destructive",
      });
    }
  };

  const parseReceiptData = (rawContent: string) => {
    // Simple receipt parsing - in production, use ML/OCR
    const lines = rawContent.split('\n');
    const items = [];
    let total = 0;
    let date = new Date().toISOString();

    for (const line of lines) {
      // Look for price patterns
      const priceMatch = line.match(/(\d+\.?\d*)/);
      if (priceMatch) {
        const amount = parseFloat(priceMatch[1]);
        if (amount > 0) {
          items.push({
            description: line.replace(priceMatch[0], '').trim(),
            amount: amount
          });
          total += amount;
        }
      }
    }

    return {
      type: 'receipt',
      items,
      total,
      date,
      raw_text: rawContent
    };
  };

  const parseSpreadsheetData = (rawContent: string) => {
    // Parse CSV-like data from barcode
    const lines = rawContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) return { headers: [], rows: [] };

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => 
      line.split(',').map(cell => cell.trim())
    );

    return {
      type: 'spreadsheet',
      headers,
      rows,
      row_count: rows.length,
      column_count: headers.length
    };
  };

  const parseUPIData = (rawContent: string) => {
    // Parse UPI QR code data
    const upiPattern = /upi:\/\/pay\?(.+)/i;
    const match = rawContent.match(upiPattern);
    
    if (match) {
      const params = new URLSearchParams(match[1]);
      return {
        type: 'upi',
        pa: params.get('pa'), // UPI ID
        pn: params.get('pn'), // Payee name
        am: params.get('am'), // Amount
        cu: params.get('cu') || 'INR', // Currency
        tn: params.get('tn'), // Transaction note
      };
    }

    return { type: 'upi', raw: rawContent };
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          AI Barcode & QR Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scan Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Scan Type</label>
          <div className="flex gap-2 flex-wrap">
            {[
              { type: 'receipt', icon: Receipt, label: 'Receipt' },
              { type: 'spreadsheet', icon: Table, label: 'Spreadsheet' },
              { type: 'upi', icon: Smartphone, label: 'UPI Payment' }
            ].map(({ type, icon: Icon, label }) => (
              <Button
                key={type}
                variant={scanType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScanType(type as any)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Camera View */}
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg"
            style={{ display: isScanning ? 'block' : 'none' }}
            playsInline
            muted
          />
          {!isScanning && (
            <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <Camera className="h-12 w-12 mx-auto text-gray-400" />
                <p className="text-sm text-gray-500">Camera preview will appear here</p>
                {hasPermission === false && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Camera permission is required to scan QR codes.
                      Please allow camera access and try again.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Scanning overlay */}
              <div className="absolute inset-4 border-2 border-primary rounded-lg">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded text-sm">
                Scanning for QR codes...
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex-1">
              <Camera className="h-4 w-4 mr-2" />
              Start Scanning
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="destructive" className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Stop Scanning
            </Button>
          )}
        </div>

        {/* Last Result */}
        {lastResult && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Last Scan Result</label>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Badge variant="secondary" className="mb-2">
                {scanType.toUpperCase()}
              </Badge>
              <p className="text-sm font-mono break-all">{lastResult}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BarcodeScanner;
