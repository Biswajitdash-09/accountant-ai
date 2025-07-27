import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload as UploadIcon, FileText, Mic, Image } from "lucide-react";
import { DocumentSearch } from "@/components/DocumentSearch";
import { useDocuments } from "@/hooks/useDocuments";
import { VoiceRecording } from "@/components/VoiceRecording";
import { VoiceEntriesList } from "@/components/VoiceEntriesList";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDropzone } from 'react-dropzone';

const DocumentUploadZone = () => {
  const { toast } = useToast();
  const { createDocument } = useDocuments();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const onDrop = async (acceptedFiles: File[]) => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    for (const file of acceptedFiles) {
      const file_name = file.name;
      const file_type = file.type;
      const file_size = file.size;

      // Upload file to Supabase storage
      const storagePath = `documents/${user.id}/${Date.now()}-${file_name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, file, {
          contentType: file_type,
        });

      if (uploadError) {
        toast({
          title: "Error",
          description: `Failed to upload ${file_name}`,
          variant: "destructive",
        });
        console.error('File upload error:', uploadError);
        continue; // Skip to the next file
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(storagePath);
      const public_url = publicUrlData.publicUrl;

      // Create document record in Supabase
      try {
        await createDocument.mutateAsync({
          file_name,
          file_type,
          file_size,
          storage_path: storagePath,
          public_url: public_url,
          processing_status: 'pending',
          version: 1,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to create document record for ${file_name}`,
          variant: "destructive",
        });
        console.error('Create document record error:', error);

        // Optionally, delete the file from storage if record creation fails
        await supabase.storage
          .from('documents')
          .remove([storagePath]);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadIcon className="h-5 w-5" />
          Upload Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div {...getRootProps()} className="border-2 border-dashed rounded-md p-6 text-center">
          <input {...getInputProps()} />
          {
            isDragActive ?
              <p>Drop the files here ...</p> :
              <>
                <p>Drag 'n' drop some files here, or click to select files</p>
                <p className="text-muted-foreground text-sm mt-2">Supported formats: PDF, DOCX, TXT, JPG, PNG</p>
              </>
          }
        </div>
      </CardContent>
    </Card>
  );
};

const DocumentsList = () => {
  const { documents, isLoading, error } = useDocuments();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading documents...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">Error: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">No documents uploaded yet</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Uploaded Documents ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between border rounded-md p-3">
            <div>
              <p className="font-medium">{doc.file_name}</p>
              <p className="text-sm text-muted-foreground">
                {doc.file_type} - {Math.round(doc.file_size / 1024)} KB
              </p>
            </div>
            <a href={doc.public_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              View
            </a>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const Upload = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Document & Voice Processing</h1>
        <p className="text-muted-foreground">
          Upload documents for OCR processing or record voice entries for automatic transaction creation
        </p>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="voice" className="gap-2">
            <Mic className="h-4 w-4" />
            Voice Recording
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-2">
            <Image className="h-4 w-4" />
            Search & Manage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <DocumentUploadZone />
          <DocumentsList />
        </TabsContent>

        <TabsContent value="voice" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VoiceRecording />
            <VoiceEntriesList />
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <DocumentSearch />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Upload;
