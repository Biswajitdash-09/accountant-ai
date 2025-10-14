import { useState, useRef, useCallback } from "react";
import { Camera, Upload, FileImage, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDropzone } from "react-dropzone";

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  status: 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  documentId?: string;
  extractedText?: string;
}

interface EnhancedDocumentUploadProps {
  onUploadComplete?: (documents: Array<{ id: string; fileName: string; extractedText?: string }>) => void;
  maxFiles?: number;
}

export const EnhancedDocumentUpload = ({ 
  onUploadComplete,
  maxFiles = 10 
}: EnhancedDocumentUploadProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      });
      return;
    }

    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'uploading',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
    uploadFiles(newFiles);
  }, [files.length, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 20 * 1024 * 1024, // 20MB
    multiple: true
  });

  const uploadFiles = async (filesToUpload: UploadedFile[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload documents",
        variant: "destructive"
      });
      return;
    }

    const uploadedDocuments: Array<{ id: string; fileName: string; extractedText?: string }> = [];

    for (const fileItem of filesToUpload) {
      try {
        // Upload to storage
        const fileName = `${user.id}/${Date.now()}-${fileItem.file.name}`;
        const { data: storageData, error: storageError } = await supabase.storage
          .from('documents')
          .upload(fileName, fileItem.file);

        if (storageError) throw storageError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        // Create document record
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            file_name: fileItem.file.name,
            file_type: fileItem.file.type,
            file_size: fileItem.file.size,
            storage_path: fileName,
            public_url: publicUrl,
            processing_status: 'pending'
          })
          .select()
          .single();

        if (docError) throw docError;

        // Update status to processing
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'processing', progress: 50, documentId: docData.id }
            : f
        ));

        // Call OCR processing edge function
        const { data: ocrData, error: ocrError } = await supabase.functions.invoke('process-ocr', {
          body: { document_id: docData.id }
        });

        if (ocrError) {
          console.error('OCR processing error:', ocrError);
          throw new Error('Failed to process document with OCR');
        }

        // Fetch the updated document with extracted text
        const { data: updatedDoc, error: fetchError } = await supabase
          .from('documents')
          .select('extracted_text')
          .eq('id', docData.id)
          .single();

        const extractedText = updatedDoc?.extracted_text || '';

        uploadedDocuments.push({
          id: docData.id,
          fileName: fileItem.file.name,
          extractedText
        });

        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'success', progress: 100, documentId: docData.id, extractedText }
            : f
        ));

      } catch (error) {
        console.error('Upload error:', error);
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'error', progress: 0 }
            : f
        ));
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Failed to upload document",
          variant: "destructive"
        });
      }
    }

    if (uploadedDocuments.length > 0 && onUploadComplete) {
      onUploadComplete(uploadedDocuments);
    }

    if (uploadedDocuments.length === filesToUpload.length) {
      toast({
        title: "Success",
        description: `${uploadedDocuments.length} document(s) uploaded and processed successfully`
      });
    }
  };

  const openCamera = async () => {
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Camera not supported",
          description: "Your browser doesn't support camera access",
          variant: "destructive"
        });
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready before showing camera
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraOpen(true);
          toast({
            title: "Camera ready",
            description: "Position your document in the frame"
          });
        };
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      let errorMessage = "Please allow camera access to capture photos";
      
      if (error.name === 'NotAllowedError') {
        errorMessage = "Camera permission denied. Please enable camera in browser settings.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "No camera found on this device.";
      } else if (error.name === 'NotReadableError') {
        errorMessage = "Camera is already in use by another application.";
      }
      
      toast({
        title: "Camera access failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      toast({
        title: "Camera not ready",
        description: "Please wait for camera to initialize",
        variant: "destructive"
      });
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob with high quality
      canvas.toBlob((blob) => {
        if (blob) {
          const timestamp = Date.now();
          const file = new File([blob], `camera-capture-${timestamp}.jpg`, { 
            type: 'image/jpeg',
            lastModified: timestamp
          });
          
          toast({
            title: "Photo captured",
            description: "Processing your photo..."
          });
          
          onDrop([file]);
          closeCamera();
        } else {
          throw new Error('Failed to create image blob');
        }
      }, 'image/jpeg', 0.95);
      
    } catch (error) {
      console.error('Capture error:', error);
      toast({
        title: "Capture failed",
        description: "Failed to capture photo. Please try again.",
        variant: "destructive"
      });
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Upload Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Desktop camera */}
        <Button
          variant="outline"
          className="h-24 flex-col gap-2 hidden sm:flex"
          onClick={openCamera}
        >
          <Camera className="h-8 w-8" />
          <span className="text-sm">Take Photo</span>
        </Button>

        {/* Mobile camera - native input */}
        <label className="cursor-pointer sm:hidden">
          <Button
            variant="outline"
            className="h-24 w-full flex flex-col gap-2"
            asChild
          >
            <div>
              <Camera className="h-8 w-8" />
              <span className="text-sm">Take Photo</span>
            </div>
          </Button>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onDrop([e.target.files[0]]);
              }
            }}
          />
        </label>

        <label className="cursor-pointer">
          <Button
            variant="outline"
            className="h-24 w-full flex flex-col gap-2"
            asChild
          >
            <div>
              <FileImage className="h-8 w-8" />
              <span className="text-sm">Choose Files</span>
            </div>
          </Button>
          <input
            type="file"
            multiple
            accept="image/*,application/pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                onDrop(Array.from(e.target.files));
              }
            }}
          />
        </label>

        <div {...getRootProps()} className="h-24">
          <input {...getInputProps()} />
          <Button
            variant="outline"
            className="h-full w-full flex flex-col gap-2"
          >
            <Upload className="h-8 w-8" />
            <span className="text-sm">
              {isDragActive ? "Drop here" : "Drag & Drop"}
            </span>
          </Button>
        </div>
      </div>

      {/* Camera View */}
      {isCameraOpen && (
        <Card className="p-4 space-y-3">
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 right-4 pointer-events-none">
              <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm inline-block">
                Position document in frame
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={capturePhoto} className="flex-1" size="lg">
              <Camera className="mr-2 h-5 w-5" />
              Capture Photo
            </Button>
            <Button onClick={closeCamera} variant="outline" size="lg">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Make sure the document is well-lit and in focus
          </p>
        </Card>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Uploaded Files</h3>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                {file.preview && (
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {file.status === 'uploading' && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  {file.status === 'processing' && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                  {file.status === 'success' && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};