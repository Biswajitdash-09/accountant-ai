import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  History, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  QrCode,
  Receipt,
  Smartphone,
  Table,
  Trash2
} from 'lucide-react';
import { useBarcodeScans } from '@/hooks/useBarcodeScans';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

const ScanHistory = () => {
  const { scans, isLoading } = useBarcodeScans();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedScans, setSelectedScans] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<string>('all');

  // Filter and search scans
  const filteredScans = useMemo(() => {
    if (!scans) return [];

    return scans.filter(scan => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        scan.raw_content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scan.scan_type.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType = selectedType === 'all' || scan.scan_type === selectedType;

      // Date filter
      const scanDate = new Date(scan.created_at);
      const now = new Date();
      let matchesDate = true;

      switch (dateRange) {
        case 'today':
          matchesDate = scanDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = scanDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = scanDate >= monthAgo;
          break;
        default:
          matchesDate = true;
      }

      return matchesSearch && matchesType && matchesDate;
    });
  }, [scans, searchTerm, selectedType, dateRange]);

  // Get scan type icon
  const getScanTypeIcon = (type: string) => {
    switch (type) {
      case 'receipt': return <Receipt className="h-4 w-4" />;
      case 'upi': return <Smartphone className="h-4 w-4" />;
      case 'spreadsheet': return <Table className="h-4 w-4" />;
      default: return <QrCode className="h-4 w-4" />;
    }
  };

  // Handle select all/none
  const handleSelectAll = () => {
    if (selectedScans.size === filteredScans.length) {
      setSelectedScans(new Set());
    } else {
      setSelectedScans(new Set(filteredScans.map(scan => scan.id)));
    }
  };

  // Handle individual scan selection
  const handleScanSelect = (scanId: string) => {
    const newSelected = new Set(selectedScans);
    if (newSelected.has(scanId)) {
      newSelected.delete(scanId);
    } else {
      newSelected.add(scanId);
    }
    setSelectedScans(newSelected);
  };

  // Export functions
  const exportToCSV = () => {
    const selectedScanData = filteredScans.filter(scan => selectedScans.has(scan.id));
    
    const csvData = selectedScanData.map(scan => ({
      'Scan ID': scan.id,
      'Type': scan.scan_type.toUpperCase(),
      'Content': scan.raw_content,
      'Confidence': scan.confidence || 0,
      'Created At': format(new Date(scan.created_at), 'yyyy-MM-dd HH:mm:ss'),
      'Parsed Data': JSON.stringify(scan.parsed_data)
    }));

    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Scan History');
    XLSX.writeFile(wb, `scan-history-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const exportToExcel = () => {
    const selectedScanData = filteredScans.filter(scan => selectedScans.has(scan.id));
    
    const excelData = selectedScanData.map(scan => ({
      'Scan ID': scan.id,
      'Type': scan.scan_type.toUpperCase(),
      'Content': scan.raw_content,
      'Confidence': `${((scan.confidence || 0) * 100).toFixed(1)}%`,
      'Created At': format(new Date(scan.created_at), 'yyyy-MM-dd HH:mm:ss'),
      'Parsed Data': JSON.stringify(scan.parsed_data, null, 2)
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Scan History');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 40 }, // Scan ID
      { wch: 15 }, // Type
      { wch: 50 }, // Content
      { wch: 12 }, // Confidence
      { wch: 20 }, // Created At
      { wch: 30 }  // Parsed Data
    ];

    XLSX.writeFile(wb, `scan-history-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <History className="h-8 w-8 text-primary" />
            Scan History
          </h1>
          <p className="text-muted-foreground">
            View, search, and export your barcode and QR code scan history
          </p>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="receipt">Receipt</SelectItem>
                <SelectItem value="upi">UPI Payment</SelectItem>
                <SelectItem value="spreadsheet">Spreadsheet</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range */}
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
              </SelectContent>
            </Select>

            {/* Results Count */}
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              {filteredScans.length} result{filteredScans.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedScans.size === filteredScans.length && filteredScans.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm">
                Select All ({selectedScans.size} selected)
              </span>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={selectedScans.size === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
                disabled={selectedScans.size === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scan Results */}
      <div className="space-y-4">
        {filteredScans.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <History className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No scans found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedType !== 'all' || dateRange !== 'all' 
                  ? 'Try adjusting your filters to see more results'
                  : 'Start scanning barcodes and QR codes to see your history here'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredScans.map((scan) => (
            <Card key={scan.id} className="hover:shadow-medium transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedScans.has(scan.id)}
                    onCheckedChange={() => handleScanSelect(scan.id)}
                  />

                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getScanTypeIcon(scan.scan_type)}
                        <Badge variant="secondary">
                          {scan.scan_type.toUpperCase()}
                        </Badge>
                        {scan.confidence > 0 && (
                          <Badge variant="outline">
                            {(scan.confidence * 100).toFixed(1)}% confidence
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(scan.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>

                    {/* Content Preview */}
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-mono text-sm break-all">
                        {scan.raw_content.length > 200 
                          ? `${scan.raw_content.substring(0, 200)}...`
                          : scan.raw_content
                        }
                      </p>
                    </div>

                    {/* Parsed Data Preview */}
                    {scan.parsed_data && Object.keys(scan.parsed_data).length > 0 && (
                      <Tabs defaultValue="preview" className="w-full">
                        <TabsList>
                          <TabsTrigger value="preview">Parsed Data</TabsTrigger>
                          <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="preview" className="mt-3">
                          <div className="bg-background border rounded-lg p-3 space-y-2 text-sm">
                            {scan.scan_type === 'receipt' && scan.parsed_data.items && (
                              <div>
                                <p className="font-semibold">Items: {scan.parsed_data.items.length}</p>
                                <p>Total: ₹{scan.parsed_data.total || 0}</p>
                              </div>
                            )}
                            {scan.scan_type === 'upi' && scan.parsed_data.upiId && (
                              <div>
                                <p><span className="font-semibold">UPI ID:</span> {scan.parsed_data.upiId}</p>
                                <p><span className="font-semibold">Amount:</span> {scan.parsed_data.amount || 'N/A'}</p>
                              </div>
                            )}
                            {scan.scan_type === 'spreadsheet' && scan.parsed_data.rows && (
                              <div>
                                <p><span className="font-semibold">Rows:</span> {scan.parsed_data.rows.length}</p>
                                <p><span className="font-semibold">Columns:</span> {scan.parsed_data.headers?.length || 0}</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="raw" className="mt-3">
                          <pre className="bg-background border rounded-lg p-3 text-xs overflow-auto">
                            {JSON.stringify(scan.parsed_data, null, 2)}
                          </pre>
                        </TabsContent>
                      </Tabs>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ScanHistory;