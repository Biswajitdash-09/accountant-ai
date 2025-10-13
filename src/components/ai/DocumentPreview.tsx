import { FileText, Image, FileCheck, Loader2, AlertCircle, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentPreviewProps {
  fileName: string;
  fileType: string;
  fileSize: number;
  extractedText?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  thumbnailUrl?: string;
}

export const DocumentPreview = ({
  fileName,
  fileType,
  fileSize,
  extractedText,
  processingStatus,
  thumbnailUrl
}: DocumentPreviewProps) => {
  const getStatusIcon = () => {
    switch (processingStatus) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'completed':
        return <FileCheck className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (processingStatus) {
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Processed';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending...';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = () => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  return (
    <Card className="p-3 max-w-sm">
      <div className="flex items-start gap-3">
        {/* Thumbnail or Icon */}
        <div className="shrink-0">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={fileName}
              className="w-16 h-16 object-cover rounded"
            />
          ) : (
            <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
              {getFileIcon()}
            </div>
          )}
        </div>

        {/* File Details */}
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <p className="text-sm font-medium truncate">{fileName}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(fileSize)}
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant={processingStatus === 'completed' ? 'default' : 'secondary'} className="text-xs">
              {getStatusText()}
            </Badge>
          </div>

          {/* Extracted Text Preview */}
          {extractedText && processingStatus === 'completed' && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {extractedText.substring(0, 100)}...
              </p>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    View full text
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>{fileName}</DialogTitle>
                    <DialogDescription>
                      Extracted text from document
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] rounded border p-4">
                    <pre className="text-xs whitespace-pre-wrap">{extractedText}</pre>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
