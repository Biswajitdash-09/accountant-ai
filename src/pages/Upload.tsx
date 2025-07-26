import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react";

const Upload = () => {
  const { createDocument } = useDocuments();
  const { toast } = useToast();
  const [extractedText, setExtractedText] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setIsUploading(true);

    try {
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
        toast({
          title: "Upload Error",
          description: "Failed to upload file.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      const publicUrl = supabase.storage.from('documents').getPublicUrl(filePath).data.publicUrl;

      // 2. Call the Cloud Function to extract text
      const response = await fetch('/api/extract-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicUrl }),
      });

      const result = await response.json();

      if (result.error) {
        console.error("Text extraction error:", result.error);
        toast({
          title: "Extraction Error",
          description: "Failed to extract text from document.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      setExtractedText(result.text);
      setConfidence(result.confidence);

      // 3. Create a document record in the database
      const documentData = {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: filePath,
        public_url: publicUrl,
        extracted_text: extractedText,
        category: 'general',
        tags: [],
        ai_confidence: confidence,
        processing_status: 'completed',
        processed_at: new Date().toISOString(),
        version: 1, // Add the missing version field
      };

      await createDocument.mutateAsync(documentData);

    } catch (error: any) {
      console.error("Error during upload and processing:", error);
      toast({
        title: "Processing Error",
        description: "An error occurred during file upload and processing.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }

  }, [createDocument, toast, extractedText, confidence]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Documents</h1>

      <div {...getRootProps()} className="relative border-2 border-dashed rounded-md p-6 cursor-pointer">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-center text-gray-500">Drop the files here ...</p>
        ) : (
          <p className="text-center text-gray-500">
            Drag 'n' drop some files here, or click to select files
          </p>
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <span className="text-xl font-semibold">Uploading...</span>
          </div>
        )}
      </div>

      {extractedText && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Extracted Text:</h2>
          <div className="rounded-md border p-4 bg-gray-50">
            <pre className="whitespace-pre-wrap text-gray-800">{extractedText}</pre>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            AI Confidence: {confidence.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  )
}

export default Upload;
