
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Mic, Search, Zap } from "lucide-react";
import DocumentSearch from "@/components/DocumentSearch";
import { useDocuments } from "@/hooks/useDocuments";
import { VoiceRecording } from "@/components/VoiceRecording";
import { VoiceEntriesList } from "@/components/VoiceEntriesList";
import { EnhancedDocumentUpload } from "@/components/EnhancedDocumentUpload";
import { DocumentManagement } from "@/components/DocumentManagement";

const Upload = () => {
  const { documents } = useDocuments();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Zap className="h-8 w-8 text-primary" />
          AI-Powered Document & Voice Processing
        </h1>
        <p className="text-muted-foreground">
          Upload documents for enhanced OCR processing with AI-powered data extraction, 
          or record voice entries for automatic transaction creation with confidence scoring.
        </p>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Enhanced OCR
          </TabsTrigger>
          <TabsTrigger value="voice" className="gap-2">
            <Mic className="h-4 w-4" />
            Voice AI
          </TabsTrigger>
          <TabsTrigger value="manage" className="gap-2">
            <Search className="h-4 w-4" />
            Manage & Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <EnhancedDocumentUpload />
          <DocumentManagement />
        </TabsContent>

        <TabsContent value="voice" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VoiceRecording />
            <VoiceEntriesList />
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <DocumentSearch 
            documents={documents}
            onSearchResults={() => {}}
          />
          <DocumentManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Upload;
