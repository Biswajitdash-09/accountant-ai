
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Table, History, Smartphone } from 'lucide-react';
import BarcodeScanner from '@/components/BarcodeScanner';
import SpreadsheetViewer from '@/components/SpreadsheetViewer';
import { useBarcodeScans } from '@/hooks/useBarcodeScans';
import { useBarcodeSpreadsheets } from '@/hooks/useBarcodeSpreadsheets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const BarcodeManager = () => {
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState(null);
  const { scans, isLoading: scansLoading } = useBarcodeScans();
  const { spreadsheets, isLoading: spreadsheetsLoading } = useBarcodeSpreadsheets();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <QrCode className="h-8 w-8 text-primary" />
          Barcode & QR Manager
        </h1>
        <p className="text-muted-foreground">
          Scan barcodes and QR codes to automatically extract receipt data, create spreadsheets, and process UPI payments.
        </p>
      </div>

      <Tabs defaultValue="scanner" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scanner" className="gap-2">
            <QrCode className="h-4 w-4" />
            Scanner
          </TabsTrigger>
          <TabsTrigger value="spreadsheets" className="gap-2">
            <Table className="h-4 w-4" />
            Spreadsheets
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Scan History
          </TabsTrigger>
          <TabsTrigger value="upi" className="gap-2">
            <Smartphone className="h-4 w-4" />
            UPI Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="space-y-6">
          <BarcodeScanner 
            onScanComplete={(data) => {
              console.log('Scan completed:', data);
            }}
          />
        </TabsContent>

        <TabsContent value="spreadsheets" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your Spreadsheets</h2>
              {spreadsheetsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : spreadsheets.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Table className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No spreadsheets yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Scan a barcode with spreadsheet data to get started
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {spreadsheets.map((sheet) => (
                    <Card 
                      key={sheet.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedSpreadsheet?.id === sheet.id ? 'border-primary' : ''
                      }`}
                      onClick={() => setSelectedSpreadsheet(sheet)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-medium truncate">{sheet.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {sheet.rows.length} rows
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            v{sheet.version}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(sheet.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <SpreadsheetViewer 
                spreadsheet={selectedSpreadsheet}
                onUpdate={(updated) => setSelectedSpreadsheet(updated)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
            </CardHeader>
            <CardContent>
              {scansLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : scans.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No scans yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Start scanning barcodes to see your history here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scans.map((scan) => (
                    <div key={scan.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">
                          {scan.scan_type.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(scan.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-mono bg-muted p-2 rounded break-all">
                        {scan.raw_content.substring(0, 100)}
                        {scan.raw_content.length > 100 && '...'}
                      </p>
                      {scan.confidence > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-muted-foreground">
                            Confidence: {(scan.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upi" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>UPI Payment Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Smartphone className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">UPI Payments Ready</h3>
                <p className="text-muted-foreground mb-4">
                  UPI payment integration is now available throughout the application.
                  You can use UPI to purchase credits and make payments.
                </p>
                <Button onClick={() => window.location.href = '/pricing'}>
                  Go to Pricing Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BarcodeManager;
