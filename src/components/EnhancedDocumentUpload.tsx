
import { useState, useCallback } from "react";
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  documentId?: string;
  error?: string;
  extractedData?: any;
  confidence?: number;
}

export const EnhancedDocumentUpload = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending',
      progress: 0
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const processFiles = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const pendingFiles = files.filter(f => f.status === 'pending');

    for (const fileItem of pendingFiles) {
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'uploading' as const, progress: 10 }
            : f
        ));

        // Upload to Supabase Storage
        const storagePath = `documents/${user.id}/${Date.now()}-${fileItem.file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(storagePath, fileItem.file, {
            contentType: fileItem.file.type,
          });

        if (uploadError) throw uploadError;

        // Update progress
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, progress: 50 }
            : f
        ));

        // Create document record
        const { data: document, error: docError } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            file_name: fileItem.file.name,
            file_type: fileItem.file.type,
            file_size: fileItem.file.size,
            storage_path: storagePath,
            processing_status: 'pending',
            version: 1,
          })
          .select()
          .single();

        if (docError) throw docError;

        // Update status to processing
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'processing' as const, progress: 75, documentId: document.id }
            : f
        ));

        // Trigger OCR processing
        const { data: processResult, error: processError } = await supabase.functions.invoke('process-ocr', {
          body: { document_id: document.id }
        });

        if (processError) {
          console.error('OCR processing trigger failed:', processError);
          console.error('Error details:', {
            message: processError.message,
            context: processError.context,
            details: processError.details
          });
          throw new Error(`Processing failed: ${processError.message || 'Unknown error'}`);
        }

        console.log('OCR processing result:', processResult);

        // Update status to completed
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { 
                ...f, 
                status: 'completed' as const, 
                progress: 100,
                extractedData: processResult?.extractedData,
                confidence: processResult?.aiConfidence
              }
            : f
        ));

        toast({
          title: "Document Processed",
          description: `${fileItem.file.name} has been processed successfully`,
        });

      } catch (error: any) {
        console.error('File processing error:', error);
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'failed' as const, error: error.message }
            : f
        ));

        toast({
          title: "Processing Failed",
          description: `Failed to process ${fileItem.file.name}`,
          variant: "destructive",
        });
      }
    }

    setIsProcessing(false);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
      case 'uploading':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
      case 'uploading':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingFilesCount = files.filter(f => f.status === 'pending').length;
  const completedFilesCount = files.filter(f => f.status === 'completed').length;
  const failedFilesCount = files.filter(f => f.status === 'failed').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Enhanced Document Upload & Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <p className="text-lg">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Drag & drop documents here, or click to select</p>
                <p className="text-sm text-muted-foreground">
                  Supports: PDF, JPG, PNG, WebP (Max 10MB each)
                </p>
              </div>
            )}
          </div>

          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm">
                  <span>Total: {files.length}</span>
                  <span className="text-green-600">Completed: {completedFilesCount}</span>
                  <span className="text-yellow-600">Pending: {pendingFilesCount}</span>
                  {failedFilesCount > 0 && (
                    <span className="text-red-600">Failed: {failedFilesCount}</span>
                  )}
                </div>
                {pendingFilesCount > 0 && (
                  <Button 
                    onClick={processFiles} 
                    disabled={isProcessing}
                    className="gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Clock className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Process All ({pendingFilesCount})
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {files.map((fileItem) => (
                  <div key={fileItem.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(fileItem.status)}
                        <div>
                          <p className="font-medium text-sm">{fileItem.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(fileItem.status)}>
                          {fileItem.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(fileItem.id)}
                          disabled={fileItem.status === 'uploading' || fileItem.status === 'processing'}
                        >
                          ×
                        </Button>
                      </div>
                    </div>

                    {(fileItem.status === 'uploading' || fileItem.status === 'processing') && (
                      <Progress value={fileItem.progress} className="w-full" />
                    )}

                    {fileItem.error && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                        <AlertTriangle className="h-4 w-4" />
                        {fileItem.error}
                      </div>
                    )}

                    {fileItem.status === 'completed' && fileItem.extractedData && (
                      <div className="text-sm space-y-2 bg-green-50 p-3 rounded">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">AI Extraction Results</span>
                          {fileItem.confidence && (
                            <Badge variant="outline">
                              {Math.round(fileItem.confidence * 100)}% confidence
                            </Badge>
                          )}
                        </div>
                        {fileItem.extractedData.vendorName && (
                          <p><strong>Vendor:</strong> {fileItem.extractedData.vendorName}</p>
                        )}
                        {fileItem.extractedData.totalAmount && (
                          <p><strong>Amount:</strong> ₹{fileItem.extractedData.totalAmount}</p>
                        )}
                        {fileItem.extractedData.documentType && (
                          <p><strong>Type:</strong> {fileItem.extractedData.documentType}</p>
                        )}
                        {fileItem.extractedData.transactions?.length > 0 && (
                          <p className="text-green-600">
                            ✓ {fileItem.extractedData.transactions.length} transaction(s) created
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
