
import { useState, useRef, useEffect } from "react";
import { Upload as UploadIcon, File, X, FileText, Image, CheckCircle, AlertCircle, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDocuments } from "@/hooks/useDocuments";
import { useOCR } from "@/hooks/useOCR";
import DocumentSearch from "@/components/DocumentSearch";

interface UploadedFile {
  name: string;
  size: string;
  type: string;
  status: 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  url?: string;
  id?: string;
  category?: string;
  tags?: string[];
}

const Upload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { documents, createDocument, deleteDocument } = useDocuments();
  const { processDocument, isProcessing } = useOCR();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [searchResults, setSearchResults] = useState(documents);
  const [showSearch, setShowSearch] = useState(false);

  // Load existing documents on mount
  useEffect(() => {
    if (documents.length > 0) {
      const existingFiles: UploadedFile[] = documents.map(doc => ({
        name: doc.file_name,
        size: formatFileSize(doc.file_size),
        type: doc.file_type,
        status: 'success' as const,
        progress: 100,
        url: doc.public_url,
        id: doc.id,
        category: doc.category,
        tags: doc.tags,
      }));
      setFiles(existingFiles);
    }
  }, [documents]);

  useEffect(() => {
    setSearchResults(documents);
  }, [documents]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileUpload(droppedFiles);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFileUpload(selectedFiles);
    }
  };

  const handleFileUpload = async (fileList: File[]) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload files",
        variant: "destructive",
      });
      return;
    }

    const newFiles: UploadedFile[] = fileList.map(file => ({
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      status: 'uploading',
      progress: 0,
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Upload files to Supabase Storage
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileIndex = files.length + i;
      
      try {
        // Create a unique file path
        const filePath = `${user.id}/${Date.now()}-${file.name}`;
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map((f, idx) => 
            idx === fileIndex && f.status === 'uploading'
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          ));
        }, 200);

        const { data, error } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        clearInterval(progressInterval);

        if (error) {
          throw error;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        // Update status to processing
        setFiles(prev => prev.map((f, idx) => 
          idx === fileIndex
            ? { ...f, status: 'processing', progress: 95 }
            : f
        ));

        // Process document with OCR and AI categorization
        const processedData = await processDocument(file);

        // Save document metadata to database
        await createDocument.mutateAsync({
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: filePath,
          public_url: urlData.publicUrl,
          extracted_text: processedData.extractedText,
          category: processedData.category,
          tags: processedData.tags,
          ai_confidence: processedData.confidence,
          processing_status: 'completed',
          processed_at: new Date().toISOString(),
        });

        setFiles(prev => prev.map((f, idx) => 
          idx === fileIndex
            ? { 
                ...f, 
                status: 'success', 
                progress: 100, 
                url: urlData.publicUrl,
                category: processedData.category,
                tags: processedData.tags
              }
            : f
        ));

        toast({
          title: "Success",
          description: `${file.name} uploaded and processed successfully`,
        });

      } catch (error) {
        setFiles(prev => prev.map((f, idx) => 
          idx === fileIndex
            ? { ...f, status: 'error', progress: 0 }
            : f
        ));

        toast({
          title: "Upload Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });

        console.error('Upload error:', error);
      }
    }
  };

  const removeFile = async (index: number) => {
    const file = files[index];
    
    if (file.id) {
      // Delete from database
      await deleteDocument.mutateAsync(file.id);
    }
    
    // Remove from local state
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Upload Documents</h1>
          <p className="text-muted-foreground">
            Upload your invoices, receipts, and financial documents for AI processing
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          {showSearch ? 'Hide Search' : 'Search Documents'}
        </Button>
      </div>

      {showSearch && (
        <DocumentSearch
          documents={documents}
          onSearchResults={setSearchResults}
        />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>
                Drag and drop your files or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
              >
                <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  Drag and drop your files here
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse from your computer
                </p>
                <Button type="button" onClick={handleBrowseClick} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Browse Files'}
                </Button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  multiple 
                  className="hidden" 
                  onChange={handleFileInput}
                  accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv"
                />
                <p className="text-xs text-muted-foreground mt-4">
                  Supports PDFs, images (JPG, PNG), Excel files, and CSVs
                </p>
              </div>
            </CardContent>
          </Card>

          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {showSearch ? `Search Results (${searchResults.length})` : `Uploaded Files (${files.length})`}
                </CardTitle>
                <CardDescription>
                  {showSearch ? 'Filtered documents' : 'Track the progress of your file uploads'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(showSearch ? searchResults : documents).map((doc, index) => {
                    const file = files.find(f => f.id === doc.id);
                    return (
                      <div 
                        key={doc.id} 
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          {getFileIcon(doc.file_type)}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{doc.file_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatFileSize(doc.file_size)}
                              {doc.category && (
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {doc.category}
                                </span>
                              )}
                            </div>
                            {doc.tags && doc.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {doc.tags.map(tag => (
                                  <span key={tag} className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            {file?.status === 'uploading' && (
                              <Progress value={file.progress} className="mt-2 h-2" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(file?.status || 'success')}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeFile(index)}
                            disabled={file?.status === 'uploading' || file?.status === 'processing'}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Document Processing</CardTitle>
              <CardDescription>
                Our AI automatically extracts and categorizes data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="font-medium">Enhanced Features:</div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    OCR text extraction
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Smart categorization
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Auto-tagging
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Full-text search
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Version control
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Invoices
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  Receipts
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-500" />
                  Tax Documents
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-500" />
                  Bank Statements
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-red-500" />
                  Contracts
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Upload;
