import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDocuments } from "@/hooks/useDocuments";
import { FileText, Clock, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DocumentHistoryProps {
  onSelectDocument?: (document: {
    id: string;
    fileName: string;
    extractedText?: string;
    fileType: string;
    fileSize: number;
    publicUrl?: string;
  }) => void;
}

export const DocumentHistory = ({ onSelectDocument }: DocumentHistoryProps) => {
  const { documents } = useDocuments();
  const { toast } = useToast();

  const recentDocuments = documents
    .filter(doc => doc.processing_status === 'completed')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Document deleted",
        description: "The document has been removed"
      });
      
      // Documents will be updated automatically by the query
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  const handleReuse = (doc: any) => {
    if (onSelectDocument) {
      onSelectDocument({
        id: doc.id,
        fileName: doc.file_name,
        extractedText: doc.extracted_text,
        fileType: doc.file_type,
        fileSize: doc.file_size,
        publicUrl: doc.public_url
      });
      
      toast({
        title: "Document selected",
        description: "Document added to chat"
      });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Documents
        </CardTitle>
        <CardDescription>
          Your last 10 processed documents
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="space-y-2 px-4 pb-4">
            {recentDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No documents yet. Upload some to get started!
              </p>
            ) : (
              recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <FileText className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-medium truncate">{doc.file_name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {(doc.file_size / 1024).toFixed(1)} KB
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {doc.extracted_text && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {doc.extracted_text.slice(0, 100)}...
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleReuse(doc)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-destructive/10"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};