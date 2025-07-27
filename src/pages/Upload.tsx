
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload as UploadIcon, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDemoMode } from "@/hooks/useDemoMode";
import DemoAccountBadge from "@/components/DemoAccountBadge";
import { MobileForm } from "@/components/ui/mobile-form";

const Upload = () => {
  const { createDocument } = useDocuments();
  const { toast } = useToast();
  const { isDemo } = useDemoMode();
  const [extractedText, setExtractedText] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    name: string;
    size: number;
    status: 'uploading' | 'success' | 'error';
    extractedText?: string;
  }>>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (isDemo) {
      // Demo mode simulation
      setIsUploading(true);
      setUploadProgress(0);
      
      const simulateUpload = () => {
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsUploading(false);
              setExtractedText("This is a demo extraction. In the full version, this would contain the actual extracted text from your document.");
              setConfidence(85.5);
              toast({
                title: "Demo Upload Complete",
                description: "Document processed successfully (demo mode)",
              });
              return 100;
            }
            return prev + 20;
          });
        }, 500);
      };
      
      simulateUpload();
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Add file to uploading list
      const newFile = {
        name: file.name,
        size: file.size,
        status: 'uploading' as const
      };
      setUploadedFiles(prev => [...prev, newFile]);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // 1. Upload file to Supabase storage
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `uploads/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("File upload error:", uploadError);
        throw new Error("Failed to upload file");
      }

      setUploadProgress(100);
      clearInterval(progressInterval);

      const publicUrl = supabase.storage.from('documents').getPublicUrl(filePath).data.publicUrl;

      // For now, simulate text extraction since we don't have the edge function
      const simulatedExtraction = {
        text: `Extracted text from ${file.name}:\n\nThis is a placeholder for the actual extracted text. In production, this would contain the real OCR results from your document.`,
        confidence: 85.5
      };

      setExtractedText(simulatedExtraction.text);
      setConfidence(simulatedExtraction.confidence);

      // 3. Create a document record in the database
      const documentData = {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: filePath,
        public_url: publicUrl,
        extracted_text: simulatedExtraction.text,
        category: 'general',
        tags: [],
        ai_confidence: simulatedExtraction.confidence,
        processing_status: 'completed',
        processed_at: new Date().toISOString(),
        version: 1,
      };

      await createDocument.mutateAsync(documentData);

      // Update file status
      setUploadedFiles(prev => 
        prev.map(f => 
          f.name === file.name 
            ? { ...f, status: 'success' as const, extractedText: simulatedExtraction.text }
            : f
        )
      );

      toast({
        title: "Upload Successful",
        description: `${file.name} has been processed successfully.`,
      });

    } catch (error: any) {
      console.error("Error during upload and processing:", error);
      
      setUploadedFiles(prev => 
        prev.map(f => 
          f.name === file.name 
            ? { ...f, status: 'error' as const }
            : f
        )
      );

      toast({
        title: "Upload Error",
        description: error.message || "An error occurred during file upload and processing.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [createDocument, toast, isDemo]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Upload Documents</h1>
          <p className="text-muted-foreground mt-2">
            Upload and process your financial documents with AI-powered text extraction
          </p>
        </div>

        <DemoAccountBadge />

        <MobileForm>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadIcon className="h-5 w-5" />
                Document Upload
              </CardTitle>
              <CardDescription>
                Drag and drop your documents or click to select files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                {...getRootProps()} 
                className={`
                  relative border-2 border-dashed rounded-lg p-8 sm:p-12 cursor-pointer transition-colors
                  ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
                  ${isUploading ? 'pointer-events-none' : ''}
                `}
              >
                <input {...getInputProps()} />
                
                <div className="text-center space-y-4">
                  <UploadIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                  
                  {isDragActive ? (
                    <p className="text-lg text-primary">Drop the files here...</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        Drag & drop files here, or click to select
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports PDF, images (JPEG, PNG, GIF), and text files
                      </p>
                    </div>
                  )}
                  
                  {!isUploading && (
                    <Button type="button" variant="outline" className="mt-4">
                      Choose Files
                    </Button>
                  )}
                </div>

                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                    <div className="text-center space-y-4 w-full max-w-xs mx-auto">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                      <div className="space-y-2">
                        <p className="font-medium">Uploading...</p>
                        <Progress value={uploadProgress} className="w-full" />
                        <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.status === 'uploading' && (
                          <Badge variant="secondary">
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Uploading
                          </Badge>
                        )}
                        {file.status === 'success' && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Success
                          </Badge>
                        )}
                        {file.status === 'error' && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Error
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {extractedText && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Extracted Text
                </CardTitle>
                <CardDescription>
                  AI-powered text extraction results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-mono text-foreground overflow-x-auto">
                      {extractedText}
                    </pre>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">AI Confidence:</span>
                      <Badge variant={confidence > 80 ? "default" : confidence > 60 ? "secondary" : "destructive"}>
                        {confidence.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(extractedText)}>
                      Copy Text
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </MobileForm>
      </div>
    </div>
  );
};

export default Upload;
