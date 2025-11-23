import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { QrCode, History } from "lucide-react";
import EnhancedBarcodeScanner from "@/components/EnhancedBarcodeScanner";
import { useBarcodeScans } from "@/hooks/useBarcodeScans";
import { useBarcodeSpreadsheets } from "@/hooks/useBarcodeSpreadsheets";
import SpreadsheetViewer from "@/components/SpreadsheetViewer";

const Scanner = () => {
  const [activeTab, setActiveTab] = useState("scan");
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<string | null>(null);
  const { scans, isLoading, createScan } = useBarcodeScans();
  const { spreadsheets } = useBarcodeSpreadsheets();

  const recentScans = scans?.slice(0, 10) || [];
  const selectedSpreadsheetData = spreadsheets?.find(s => s.id === selectedSpreadsheet);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Scanner</h1>
        <p className="text-muted-foreground">
          Scan barcodes, QR codes, receipts, and UPI payments
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scan" className="gap-2">
            <QrCode className="h-4 w-4" />
            Scan
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="space-y-6">
          <EnhancedBarcodeScanner
            onScanComplete={(result) => {
              // Map scanner types to database types
              const scanTypeMap: Record<string, "receipt" | "upi" | "spreadsheet" | "other"> = {
                qr: "other",
                barcode: "other",
                receipt: "receipt",
                upi: "upi",
              };
              
              createScan.mutate({
                raw_content: result.rawContent,
                scan_type: scanTypeMap[result.type] || "other",
                confidence: result.confidence,
                parsed_data: result.processedData,
              });
            }}
          />

          {selectedSpreadsheetData && (
            <Card className="p-6">
              <SpreadsheetViewer
                spreadsheet={selectedSpreadsheetData}
                onUpdate={() => setSelectedSpreadsheet(null)}
              />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {isLoading ? (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">Loading scan history...</p>
            </Card>
          ) : recentScans.length === 0 ? (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                No scans yet. Start scanning to see your history here.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recentScans.map((scan) => (
                <Card key={scan.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium capitalize">{scan.scan_type}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(scan.created_at || "").toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {scan.raw_content}
                      </p>
                      {scan.confidence && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Confidence: {(scan.confidence * 100).toFixed(0)}%
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Scanner;
