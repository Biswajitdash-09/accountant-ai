import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useDemoMode } from "@/hooks/useDemoMode";
import { Download, Mail, UserPlus } from "lucide-react";

interface SaveExportPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  exportType: string;
}

const SaveExportPrompt = ({ isOpen, onClose, onExport, exportType }: SaveExportPromptProps) => {
  const { isDemo, exitDemoMode } = useDemoMode();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport();
      toast({
        title: "Export Successful",
        description: `Your ${exportType} has been downloaded. Remember, demo data won't be saved permanently.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  if (!isDemo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Demo Data
          </DialogTitle>
          <DialogDescription>
            You're in demo mode. Your {exportType} will be exported, but remember that demo data isn't saved permanently.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full justify-start"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : `Export ${exportType}`}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Save your work permanently
                </span>
              </div>
            </div>
            
            <Button
              onClick={exitDemoMode}
              className="w-full justify-start"
              variant="default"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Sign Up to Keep Data
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Sign up to save your actual financial data and access all features permanently.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveExportPrompt;