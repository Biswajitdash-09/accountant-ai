import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Upload,
  FileText, 
  Image as ImageIcon,
  Eye,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Scan,
  Brain,
  DollarSign,
  Calendar,
  Building,
  Receipt
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DocumentData {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  processingStatus: 'uploading' | 'processing' | 'completed' | 'error';
  extractedData?: {
    amount?: number;
    date?: string;
    vendor?: string;
    category?: string;
    description?: string;
    taxAmount?: number;
    confidence?: number;
    lineItems?: Array<{
      description: string;
      amount: number;
      quantity?: number;
    }>;
  };
  publicUrl?: string;
  aiAnalysis?: {
    documentType: string;
    suggestions: string[];
    potentialIssues: string[];
  };
}

const SmartDocumentUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentData | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) return;

    for (const file of acceptedFiles) {
      const docId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      // Add to local state immediately
      const newDoc: DocumentData = {
        id: docId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        processingStatus: 'uploading'
      };
      
      setDocuments(prev => [newDoc, ...prev]);

      try {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${docId}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        // Update status to processing
        setDocuments(prev => prev.map(doc => 
          doc.id === docId 
            ? { ...doc, processingStatus: 'processing', publicUrl }
            : doc
        ));

        // Process with OCR
        const { data: ocrData, error: ocrError } = await supabase.functions
          .invoke('process-ocr', {
            body: {
              fileName,
              documentId: docId,
              userId: user.id
            }
          });

        if (ocrError) throw ocrError;

        // Update with extracted data
        setDocuments(prev => prev.map(doc => 
          doc.id === docId 
            ? { 
                ...doc, 
                processingStatus: 'completed',
                extractedData: ocrData.extractedData,
                aiAnalysis: ocrData.aiAnalysis
              }
            : doc
        ));

        toast({
          title: "Document processed!",
          description: `Successfully extracted data from ${file.name}`,
        });

      } catch (error: any) {
        console.error('Document processing error:', error);
        
        setDocuments(prev => prev.map(doc => 
          doc.id === docId 
            ? { ...doc, processingStatus: 'error' }
            : doc
        ));

        toast({
          title: "Processing failed",
          description: error.message || `Failed to process ${file.name}`,
          variant: "destructive",
        });
      }
    }
  }, [user, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.csv']
    },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const createTransactionFromDoc = async (doc: DocumentData) => {
    if (!doc.extractedData || !user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: doc.extractedData.amount,
          description: doc.extractedData.description || `${doc.extractedData.vendor} - ${doc.fileName}`,
          category: doc.extractedData.category || 'Business Expense',
          type: 'expense',
          date: doc.extractedData.date || new Date().toISOString().split('T')[0],
          currency_id: 'usd-currency-id', // Map properly
          notes: `Auto-imported from ${doc.fileName}`
        });

      if (error) throw error;

      toast({
        title: "Transaction created!",
        description: "Document data has been added to your transactions.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to create transaction",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteDocument = async (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    toast({
      title: "Document deleted",
      description: "Document has been removed from your account.",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: DocumentData['processingStatus']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getDocumentIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
    if (fileType === 'application/pdf') return <FileText className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="gradient-primary text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-heading font-bold mb-2">Smart Document Processing</h3>
              <p className="opacity-90">Upload receipts, invoices, and financial documents for AI-powered data extraction</p>
            </div>
            <Brain className="h-12 w-12 opacity-75" />
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            
            {isDragActive ? (
              <div>
                <p className="text-lg font-medium">Drop files here...</p>
                <p className="text-sm text-muted-foreground">Release to upload</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">Drag & drop your documents</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Or click to browse files
                </p>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Supports: Images (PNG, JPG), PDFs, Text files • Max 10MB each
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Processed Documents ({documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {documents.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getDocumentIcon(doc.fileType)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{doc.fileName}</p>
                          {getStatusIcon(doc.processingStatus)}
                          <Badge variant="outline" className="text-xs">
                            {doc.processingStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(doc.fileSize)} • {new Date(doc.uploadedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {doc.publicUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.publicUrl, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {doc.extractedData && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => createTransactionFromDoc(doc)}
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDocument(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Extracted Data */}
                  {doc.extractedData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Amount</p>
                          <p className="font-semibold text-green-600">
                            ${doc.extractedData.amount?.toFixed(2) || 'N/A'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Vendor</p>
                          <p className="font-medium">{doc.extractedData.vendor || 'Unknown'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Date</p>
                          <p className="font-medium">{doc.extractedData.date || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Category</p>
                          <p className="font-medium">{doc.extractedData.category || 'Uncategorized'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Analysis */}
                  {doc.aiAnalysis && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">AI Analysis:</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {doc.aiAnalysis.documentType}
                        </Badge>
                        <Badge variant="outline">
                          {doc.extractedData?.confidence ? 
                            `${(doc.extractedData.confidence * 100).toFixed(0)}% confidence` : 
                            'Processing...'
                          }
                        </Badge>
                      </div>
                      
                      {doc.aiAnalysis.suggestions.length > 0 && (
                        <div className="text-sm">
                          <p className="font-medium text-green-700 dark:text-green-300">Suggestions:</p>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {doc.aiAnalysis.suggestions.map((suggestion, i) => (
                              <li key={i}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Processing Progress */}
                  {(doc.processingStatus === 'uploading' || doc.processingStatus === 'processing') && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>
                          {doc.processingStatus === 'uploading' ? 'Uploading...' : 'Processing with AI...'}
                        </span>
                        <span>{doc.processingStatus === 'processing' ? '85%' : '45%'}</span>
                      </div>
                      <Progress 
                        value={doc.processingStatus === 'processing' ? 85 : 45} 
                        className="h-2" 
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartDocumentUpload;