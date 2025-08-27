import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useChatHistory } from "@/hooks/useChatHistory";
import { Download, Mail, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const ChatHistoryExport = () => {
  const { exportChatHistory, sessions } = useChatHistory();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");

  const handleDownloadExport = () => {
    try {
      const historyData = exportChatHistory();
      const blob = new Blob([historyData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Your chat history has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export chat history. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmailExport = async () => {
    if (!emailAddress) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send the export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const historyData = exportChatHistory();
      
      // Create a readable HTML format for email
      const htmlContent = generateHtmlExport();
      
      const { error } = await supabase.functions.invoke('send-chat-export', {
        body: {
          email: emailAddress,
          htmlContent,
          jsonData: historyData,
        },
      });

      if (error) throw error;

      toast({
        title: "Export Sent",
        description: `Your chat history has been sent to ${emailAddress}.`,
      });
      
      setEmailAddress("");
    } catch (error) {
      console.error('Email export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to send chat history via email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const generateHtmlExport = () => {
    const html = `
      <html>
        <head>
          <title>Accountant AI - Chat History Export</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
            .session { margin-bottom: 40px; border-left: 4px solid #007bff; padding-left: 20px; }
            .session-title { color: #007bff; font-size: 1.2em; font-weight: bold; }
            .message { margin: 15px 0; padding: 10px; border-radius: 5px; }
            .user-message { background-color: #e3f2fd; }
            .assistant-message { background-color: #f5f5f5; }
            .timestamp { font-size: 0.8em; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Accountant AI - Chat History Export</h1>
            <p>Export Date: ${new Date().toLocaleDateString()}</p>
            <p>Total Sessions: ${sessions.length}</p>
          </div>
          ${sessions.map(session => `
            <div class="session">
              <h2 class="session-title">${session.title}</h2>
              <p class="timestamp">Created: ${new Date(session.createdAt).toLocaleString()}</p>
              ${session.messages.map(message => `
                <div class="message ${message.role === 'user' ? 'user-message' : 'assistant-message'}">
                  <strong>${message.role === 'user' ? 'You' : 'Assistant'}:</strong>
                  <p>${message.content}</p>
                  <p class="timestamp">${new Date(message.timestamp).toLocaleString()}</p>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </body>
      </html>
    `;
    return html;
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>Chat History Export</CardTitle>
        </div>
        <CardDescription>
          Export your AI assistant conversations for backup or sharing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{sessions.length}</p>
            <p className="text-sm text-muted-foreground">Total Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {sessions.reduce((total, session) => total + session.messages.length, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total Messages</p>
          </div>
        </div>

        {/* Download Option */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Export
          </h3>
          <p className="text-sm text-muted-foreground">
            Download your chat history as a JSON file for offline storage.
          </p>
          <Button
            onClick={handleDownloadExport}
            variant="outline"
            className="w-full"
            disabled={sessions.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Download JSON Export
          </Button>
        </div>

        <Separator />

        {/* Email Option */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Export
          </h3>
          <p className="text-sm text-muted-foreground">
            Send a formatted copy of your chat history to your email address.
          </p>
          <div className="space-y-2">
            <Label htmlFor="export-email">Email Address</Label>
            <Input
              id="export-email"
              type="email"
              placeholder="your@email.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
            />
          </div>
          <Button
            onClick={handleEmailExport}
            className="w-full"
            disabled={isExporting || sessions.length === 0}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send via Email
              </>
            )}
          </Button>
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No chat history available to export.</p>
            <p className="text-sm">Start a conversation with the AI assistant to build your history.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};