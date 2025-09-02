import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Camera, 
  QrCode, 
  Receipt, 
  Table, 
  Smartphone, 
  X, 
  Upload, 
  Download, 
  Package, 
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/browser';
import Tesseract from 'tesseract.js';
import * as XLSX from 'xlsx';
import { useBarcodeScans } from '@/hooks/useBarcodeScans';
import { useBarcodeSpreadsheets } from '@/hooks/useBarcodeSpreadsheets';

interface ScanResult {
  id: string;
  type: 'qr' | 'barcode' | 'receipt' | 'upi';
  rawContent: string;
  processedData: any;
  confidence: number;
  timestamp: Date;
  error?: string;
}

interface EnhancedBarcodeScannerProps {
  onScanComplete?: (result: ScanResult) => void;
  mode?: 'camera' | 'upload';
}

const EnhancedBarcodeScanner: React.FC<EnhancedBarcodeScannerProps> = ({ 
  onScanComplete,
  mode = 'camera'
}) => {
  // State management
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState<'receipt' | 'spreadsheet' | 'upi' | 'product'>('receipt');
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [activeMode, setActiveMode] = useState<'camera' | 'upload'>(mode);
  const [progress, setProgress] = useState(0);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader>();
  const scanningControlsRef = useRef<any>();

  // Hooks
  const { toast } = useToast();
  const { user } = useAuth();
  const { createScan } = useBarcodeScans();
  const { createSpreadsheet } = useBarcodeSpreadsheets();

  // Initialize scanner
  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    
    // Set up supported formats
    const hints = new Map();
    hints.set(2, [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.AZTEC,
      BarcodeFormat.PDF_417,
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_93,
      BarcodeFormat.CODE_128,
      BarcodeFormat.EAN_8,
      BarcodeFormat.EAN_13,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.ITF,
      BarcodeFormat.CODABAR
    ]);
    
    readerRef.current.setHints(hints);

    // Check camera permissions
    navigator.permissions?.query({ name: 'camera' as PermissionName })
      .then(result => {
        setHasPermission(result.state === 'granted');
        result.onchange = () => setHasPermission(result.state === 'granted');
      })
      .catch(() => setHasPermission(null));

    return () => {
      if (scanningControlsRef.current) {
        scanningControlsRef.current.stop();
      }
    };
  }, []);

  // Camera scanning functions
  const startCameraScanning = async () => {
    try {
      if (!readerRef.current || !videoRef.current) return;

      setIsScanning(true);
      setProgress(0);

      // Start continuous scanning
      scanningControlsRef.current = await readerRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            const scannedText = result.getText();
            const format = result.getBarcodeFormat();
            console.log('Code detected:', { text: scannedText, format });
            
            handleScanResult(scannedText, format);
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
      
      if (error.name === 'NotAllowedError') {
        setHasPermission(false);
        toast({
          title: "Camera Permission Denied",
          description: "Please allow camera access to scan codes.",
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
    setProgress(0);
  };

  // File upload with dropzone
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      if (file.type.startsWith('image/')) {
        await processImageFile(file);
      }
    }
  }, [scanType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  // Process uploaded image
  const processImageFile = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Try barcode/QR detection first
      const imageUrl = URL.createObjectURL(file);
      
      try {
        setProgress(25);
        const result = await readerRef.current?.decodeFromImageUrl(imageUrl);
        
        if (result) {
          const text = result.getText();
          const format = result.getBarcodeFormat();
          await handleScanResult(text, format);
          setProgress(100);
          return;
        }
      } catch (barcodeError) {
        console.log('No barcode found, trying OCR...');
      }

      // If no barcode found, use OCR for receipt processing
      if (scanType === 'receipt') {
        setProgress(50);
        const ocrResult = await performOCR(file);
        setProgress(75);
        await handleOCRResult(ocrResult, file.name);
        setProgress(100);
      } else {
        throw new Error('No valid code found in image');
      }

    } catch (error) {
      console.error('Image processing error:', error);
      toast({
        title: "Processing Failed",
        description: "Could not process the uploaded image.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // OCR processing
  const performOCR = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      Tesseract.recognize(file, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(50 + (m.progress * 25));
          }
        }
      }).then(({ data: { text } }) => {
        resolve(text);
      }).catch(reject);
    });
  };

  // Handle scan results
  const handleScanResult = async (rawContent: string, format?: BarcodeFormat) => {
    try {
      setIsProcessing(true);
      
      const scanResult: ScanResult = {
        id: crypto.randomUUID(),
        type: detectCodeType(rawContent, format),
        rawContent,
        processedData: {},
        confidence: 0.8,
        timestamp: new Date()
      };

      // Process based on detected type
      switch (scanResult.type) {
        case 'upi':
          scanResult.processedData = await processUPICode(rawContent);
          break;
        case 'qr':
          scanResult.processedData = await processQRCode(rawContent);
          break;
        case 'barcode':
          scanResult.processedData = await processProductBarcode(rawContent, format);
          break;
        default:
          scanResult.processedData = await processGenericCode(rawContent);
      }

      // Save to database
      await saveScanResult(scanResult);
      
      // Add to local results
      setScanResults(prev => [scanResult, ...prev.slice(0, 9)]);
      
      onScanComplete?.(scanResult);
      
      toast({
        title: "Scan Successful",
        description: `${scanResult.type.toUpperCase()} code processed successfully.`,
      });

    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process scan result.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle OCR results
  const handleOCRResult = async (ocrText: string, fileName: string) => {
    const scanResult: ScanResult = {
      id: crypto.randomUUID(),
      type: 'receipt',
      rawContent: ocrText,
      processedData: await processReceiptOCR(ocrText),
      confidence: 0.7,
      timestamp: new Date()
    };

    await saveScanResult(scanResult);
    setScanResults(prev => [scanResult, ...prev.slice(0, 9)]);
    
    toast({
      title: "OCR Complete",
      description: `Receipt processed from ${fileName}`,
    });
  };

  // Code type detection
  const detectCodeType = (content: string, format?: BarcodeFormat): ScanResult['type'] => {
    if (content.startsWith('upi://pay')) return 'upi';
    if (content.startsWith('http') || content.includes('www.')) return 'qr';
    if (format && [BarcodeFormat.EAN_13, BarcodeFormat.UPC_A, BarcodeFormat.CODE_128].includes(format)) {
      return 'barcode';
    }
    return 'qr';
  };

  // Processing functions
  const processUPICode = async (content: string) => {
    const upiPattern = /upi:\/\/pay\?(.+)/i;
    const match = content.match(upiPattern);
    
    if (match) {
      const params = new URLSearchParams(match[1]);
      const upiData = {
        pa: params.get('pa'), // UPI ID
        pn: params.get('pn'), // Payee name
        am: params.get('am'), // Amount
        cu: params.get('cu') || 'INR', // Currency
        tn: params.get('tn'), // Transaction note
        mc: params.get('mc'), // Merchant code
        tr: params.get('tr'), // Transaction reference
      };

      // Trigger UPI intent
      if (typeof window !== 'undefined' && window.location) {
        const upiIntent = `upi://pay?${match[1]}`;
        window.open(upiIntent, '_blank');
      }

      return upiData;
    }

    return { raw: content };
  };

  const processQRCode = async (content: string) => {
    // URL detection
    if (content.startsWith('http')) {
      return {
        type: 'url',
        url: content,
        domain: new URL(content).hostname
      };
    }

    // Plain text
    return {
      type: 'text',
      content: content
    };
  };

  const processProductBarcode = async (content: string, format?: BarcodeFormat) => {
    // Mock product lookup - in production, integrate with product database
    const mockProducts: { [key: string]: any } = {
      '8901030895856': {
        name: 'Maggi 2-Minute Noodles',
        brand: 'Nestlé',
        category: 'Food & Beverages',
        price: '₹12.00'
      },
      '8901725111021': {
        name: 'Britannia Good Day Cookies',
        brand: 'Britannia',
        category: 'Biscuits & Cookies',
        price: '₹25.00'
      }
    };

    const productInfo = mockProducts[content] || {
      name: 'Product Not Found',
      brand: 'Unknown',
      category: 'General',
      price: 'N/A',
      barcode: content,
      format: format?.toString()
    };

    return {
      ...productInfo,
      barcode: content,
      format: format?.toString(),
      scannedAt: new Date().toISOString()
    };
  };

  const processGenericCode = async (content: string) => {
    return {
      type: 'generic',
      content: content,
      length: content.length
    };
  };

  const processReceiptOCR = async (ocrText: string) => {
    const lines = ocrText.split('\n').filter(line => line.trim());
    
    // Extract merchant name (usually first few lines)
    const merchantName = lines.slice(0, 3).find(line => 
      line.length > 3 && 
      !/^\d+$/.test(line) && 
      !line.includes('₹') &&
      !line.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/)
    ) || 'Unknown Merchant';

    // Extract amounts
    const amountMatches = ocrText.match(/₹[\d,]+\.?\d*/g) || [];
    const amounts = amountMatches.map(match => 
      parseFloat(match.replace('₹', '').replace(/,/g, ''))
    );
    
    const totalAmount = amounts.length > 0 ? Math.max(...amounts) : null;

    // Extract date
    const dateMatch = ocrText.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/);
    const date = dateMatch ? dateMatch[1] : new Date().toLocaleDateString();

    // Extract items
    const items = lines
      .filter(line => line.includes('₹') && line.length > 5)
      .map(line => {
        const priceMatch = line.match(/₹([\d,]+\.?\d*)/);
        const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
        const description = line.replace(/₹[\d,]+\.?\d*/, '').trim();
        
        return { description, price };
      });

    return {
      merchantName,
      date,
      totalAmount,
      items,
      itemCount: items.length,
      rawText: ocrText
    };
  };

  // Save scan result to database
  const saveScanResult = async (scanResult: ScanResult) => {
    if (!user) return;

    try {
      // Map scan result types to valid database types
      let dbScanType: 'receipt' | 'upi' | 'spreadsheet' | 'other';
      switch (scanResult.type) {
        case 'upi':
          dbScanType = 'upi';
          break;
        case 'receipt':
          dbScanType = 'receipt';
          break;
        case 'barcode':
        case 'qr':
        default:
          dbScanType = 'other';
          break;
      }

      await createScan.mutateAsync({
        scan_type: dbScanType,
        raw_content: scanResult.rawContent,
        parsed_data: scanResult.processedData,
        confidence: scanResult.confidence
      });

      // If it's a spreadsheet type, create spreadsheet record
      if (scanType === 'spreadsheet' && scanResult.processedData.headers) {
        await createSpreadsheet.mutateAsync({
          title: `Scan ${new Date().toLocaleDateString()}`,
          description: 'Created from barcode scan',
          headers: scanResult.processedData.headers,
          rows: scanResult.processedData.rows || []
        });
      }
    } catch (error) {
      console.error('Failed to save scan result:', error);
    }
  };

  // Export functions
  const exportToCSV = () => {
    if (scanResults.length === 0) return;

    const csvData = scanResults.map(result => ({
      timestamp: result.timestamp.toLocaleString(),
      type: result.type,
      content: result.rawContent.substring(0, 100),
      confidence: result.confidence,
      processed: JSON.stringify(result.processedData)
    }));

    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Scan Results');
    XLSX.writeFile(wb, `scan_results_${new Date().toISOString().split('T')[0]}.csv`);
    
    toast({
      title: "Export Complete",
      description: "Scan results exported to CSV file.",
    });
  };

  const exportToExcel = () => {
    if (scanResults.length === 0) return;

    const excelData = scanResults.map(result => ({
      'Timestamp': result.timestamp.toLocaleString(),
      'Type': result.type.toUpperCase(),
      'Raw Content': result.rawContent,
      'Confidence': `${(result.confidence * 100).toFixed(1)}%`,
      'Processed Data': JSON.stringify(result.processedData, null, 2)
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Scan Results');
    XLSX.writeFile(wb, `scan_results_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Export Complete",
      description: "Scan results exported to Excel file.",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            AI-Powered Barcode & QR Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Selection */}
          <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera" className="gap-2">
                <Camera className="h-4 w-4" />
                Camera
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="camera" className="space-y-4">
              {/* Scan Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Scan Type</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { type: 'receipt', icon: Receipt, label: 'Receipt/OCR' },
                    { type: 'product', icon: Package, label: 'Product Barcode' },
                    { type: 'upi', icon: Smartphone, label: 'UPI Payment' },
                    { type: 'spreadsheet', icon: Table, label: 'Spreadsheet' }
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
                  className="w-full h-80 bg-gray-100 dark:bg-gray-800 rounded-lg object-cover"
                  style={{ display: isScanning ? 'block' : 'none' }}
                  playsInline
                  muted
                />
                
                {!isScanning && (
                  <div className="w-full h-80 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Camera className="h-16 w-16 mx-auto text-gray-400" />
                      <div>
                        <p className="text-lg font-medium">Ready to Scan</p>
                        <p className="text-sm text-muted-foreground">
                          Camera preview will appear here
                        </p>
                      </div>
                      {hasPermission === false && (
                        <Alert className="max-w-sm mx-auto">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Camera permission required to scan codes.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                )}

                {/* Scanning Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-6 border-2 border-primary rounded-lg animate-pulse">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                    </div>
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Scanning for {scanType} codes...
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex gap-2">
                {!isScanning ? (
                  <Button 
                    onClick={startCameraScanning} 
                    className="flex-1 h-12"
                    disabled={hasPermission === false}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Start Scanning
                  </Button>
                ) : (
                  <Button 
                    onClick={stopScanning} 
                    variant="destructive" 
                    className="flex-1 h-12"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Stop Scanning
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              {/* File Upload Area */}
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                {isDragActive ? (
                  <p className="text-lg">Drop the images here...</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Upload Images to Scan</p>
                    <p className="text-sm text-muted-foreground">
                      Drag & drop images here, or click to select
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports: JPG, PNG, WebP, BMP, GIF (Max 10MB each)
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Processing Progress */}
          <AnimatePresence>
            {(isProcessing || progress > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Processing...</span>
                </div>
                <Progress value={progress} className="w-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Recent Results */}
      {scanResults.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Scans ({scanResults.length})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportToExcel}>
                <Download className="h-4 w-4 mr-1" />
                Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {scanResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {result.type === 'upi' && <Smartphone className="h-5 w-5 text-blue-500" />}
                          {result.type === 'barcode' && <Package className="h-5 w-5 text-green-500" />}
                          {result.type === 'receipt' && <Receipt className="h-5 w-5 text-orange-500" />}
                          {result.type === 'qr' && <QrCode className="h-5 w-5 text-purple-500" />}
                          <Badge variant="secondary" className="font-mono">
                            {result.type.toUpperCase()}
                          </Badge>
                        </div>
                        <Badge variant="outline">
                          {(result.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {result.timestamp.toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="text-sm">
                      <p className="font-medium mb-1">Raw Content:</p>
                      <p className="font-mono bg-muted p-2 rounded text-xs break-all">
                        {result.rawContent.substring(0, 150)}
                        {result.rawContent.length > 150 && '...'}
                      </p>
                    </div>

                    {/* Processed Data Display */}
                    {result.processedData && Object.keys(result.processedData).length > 0 && (
                      <div className="text-sm space-y-2 bg-green-50 dark:bg-green-900/20 p-3 rounded">
                        <p className="font-medium text-green-700 dark:text-green-300">
                          Extracted Data:
                        </p>
                        {result.type === 'upi' && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {result.processedData.pa && <p><strong>UPI ID:</strong> {result.processedData.pa}</p>}
                            {result.processedData.pn && <p><strong>Payee:</strong> {result.processedData.pn}</p>}
                            {result.processedData.am && <p><strong>Amount:</strong> ₹{result.processedData.am}</p>}
                          </div>
                        )}
                        {result.type === 'barcode' && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {result.processedData.name && <p><strong>Product:</strong> {result.processedData.name}</p>}
                            {result.processedData.brand && <p><strong>Brand:</strong> {result.processedData.brand}</p>}
                            {result.processedData.price && <p><strong>Price:</strong> {result.processedData.price}</p>}
                          </div>
                        )}
                        {result.type === 'receipt' && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {result.processedData.merchantName && <p><strong>Merchant:</strong> {result.processedData.merchantName}</p>}
                            {result.processedData.totalAmount && <p><strong>Total:</strong> ₹{result.processedData.totalAmount}</p>}
                            {result.processedData.date && <p><strong>Date:</strong> {result.processedData.date}</p>}
                            {result.processedData.itemCount && <p><strong>Items:</strong> {result.processedData.itemCount}</p>}
                          </div>
                        )}
                      </div>
                    )}

                    {result.error && (
                      <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedBarcodeScanner;