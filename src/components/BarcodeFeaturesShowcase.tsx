import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  Camera, 
  Upload, 
  Receipt, 
  Package, 
  Smartphone, 
  Table, 
  Download, 
  Zap, 
  CheckCircle,
  Eye,
  Layers,
  Scan,
  FileText,
  CreditCard
} from 'lucide-react';

const BarcodeFeaturesShowcase = () => {
  const features = [
    {
      icon: QrCode,
      title: "QR Code Scanning",
      description: "Scan QR codes for websites, text, and UPI payments",
      items: [
        "Website URLs with auto-redirect",
        "Plain text extraction",
        "Contact information (vCard)",
        "Wi-Fi network credentials",
        "Social media profiles"
      ],
      status: "implemented"
    },
    {
      icon: Package,
      title: "Product Barcodes",
      description: "1D & 2D barcode scanning with product lookup",
      items: [
        "EAN-13, UPC-A, Code 128 support",
        "Product information lookup",
        "Price and availability check",
        "Nutritional information",
        "Brand and category detection"
      ],
      status: "implemented"
    },
    {
      icon: Receipt,
      title: "Receipt OCR",
      description: "Advanced OCR for receipt text extraction",
      items: [
        "Merchant name detection",
        "Date and time extraction",
        "Total amount calculation",
        "Item-wise breakdown",
        "Auto-categorization"
      ],
      status: "implemented"
    },
    {
      icon: Smartphone,
      title: "UPI Payments",
      description: "UPI QR code processing with payment intent",
      items: [
        "VPA extraction",
        "Amount detection",
        "Merchant information",
        "Payment note parsing",
        "Deep link activation"
      ],
      status: "implemented"
    },
    {
      icon: Table,
      title: "Spreadsheet Export",
      description: "Data export to CSV and Excel formats",
      items: [
        "CSV file generation",
        "Excel (XLSX) export",
        "Structured data formatting",
        "History management",
        "Batch processing"
      ],
      status: "implemented"
    },
    {
      icon: Camera,
      title: "Camera Integration",
      description: "Real-time camera scanning with live preview",
      items: [
        "Continuous scanning mode",
        "Permission management",
        "Auto-focus and zoom",
        "Multiple device support",
        "Scanning frame overlay"
      ],
      status: "implemented"
    }
  ];

  const technicalFeatures = [
    {
      icon: Zap,
      title: "AI-Powered Processing",
      items: [
        "Tesseract.js OCR engine",
        "ZXing barcode library",
        "Pattern recognition",
        "Confidence scoring",
        "Auto-format detection"
      ]
    },
    {
      icon: Eye,
      title: "Format Support",
      items: [
        "QR Code, Data Matrix",
        "EAN-8/13, UPC-A/E",
        "Code 39/93/128",
        "PDF417, Aztec",
        "ITF, Codabar"
      ]
    },
    {
      icon: Layers,
      title: "Processing Modes",
      items: [
        "Real-time camera scan",
        "Image file upload",
        "Batch processing",
        "Background analysis",
        "Cross-platform support"
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Scan className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">AI Barcode & QR Scanner</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Comprehensive scanning solution with OCR, product lookup, UPI payments, 
          and advanced data processing capabilities.
        </p>
      </div>

      {/* Core Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-center">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <feature.icon className="h-8 w-8 text-primary" />
                  <Badge 
                    variant={feature.status === 'implemented' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {feature.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-center">Technical Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {technicalFeatures.map((tech, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <tech.icon className="h-6 w-6 text-primary" />
                  <CardTitle className="text-lg">{tech.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tech.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Usage Examples */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-center">Usage Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Receipt Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                <div className="text-green-600 mb-2">✓ Extracted Data:</div>
                <div className="space-y-1">
                  <div>Merchant: "TAJ HOTEL"</div>
                  <div>Date: "2024-01-15"</div>
                  <div>Total: "₹1,300.00"</div>
                  <div>Items: 4 detected</div>
                  <div>Confidence: 87%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                UPI Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                <div className="text-blue-600 mb-2">✓ UPI Data:</div>
                <div className="space-y-1">
                  <div>VPA: "merchant@paytm"</div>
                  <div>Name: "Merchant Store"</div>
                  <div>Amount: "₹250.00"</div>
                  <div>Note: "Order #12345"</div>
                  <div>🔗 Intent triggered</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Lookup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                <div className="text-purple-600 mb-2">✓ Product Info:</div>
                <div className="space-y-1">
                  <div>Name: "Maggi Noodles"</div>
                  <div>Brand: "Nestlé"</div>
                  <div>Category: "Food"</div>
                  <div>Price: "₹12.00"</div>
                  <div>Status: In Stock</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-orange-600 mb-2 font-semibold">📊 Available Formats:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV Export
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Excel (XLSX)
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Transaction Data
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Product Lists
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance & Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Scan Speed:</span>
              <Badge variant="outline">~500ms</Badge>
            </div>
            <div className="flex justify-between">
              <span>OCR Processing:</span>
              <Badge variant="outline">1-3 seconds</Badge>
            </div>
            <div className="flex justify-between">
              <span>Format Support:</span>
              <Badge variant="outline">15+ types</Badge>
            </div>
            <div className="flex justify-between">
              <span>Accuracy:</span>
              <Badge variant="outline">85-95%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Security & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Local processing (OCR)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Encrypted data storage</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">No external API dependency</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">User permission controls</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BarcodeFeaturesShowcase;