import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Trash2, 
  Download,
  FileAudio,
  Activity,
  CheckCircle,
  Loader2,
  DollarSign,
  Calculator
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceEntry {
  id: string;
  transcript: string;
  audioUrl?: string;
  extractedData?: {
    amount?: number;
    category?: string;
    description?: string;
    date?: string;
    confidence?: number;
  };
  createdAt: string;
  processingStatus: 'processing' | 'completed' | 'error';
}

const VoiceExpenseEntry = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentEntries, setRecentEntries] = useState<VoiceEntry[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak clearly about your expense...",
      });
    } catch (error) {
      toast({
        title: "Microphone access required",
        description: "Please allow microphone access to record expenses.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceEntry = async () => {
    if (!audioBlob || !user) return;

    setIsProcessing(true);
    
    try {
      // Create form data for audio upload
      const formData = new FormData();
      formData.append('audio', audioBlob, 'expense-entry.wav');
      formData.append('userId', user.id);

      // Process voice through edge function
      const { data, error } = await supabase.functions.invoke('process-voice', {
        body: formData
      });

      if (error) throw error;

      const newEntry: VoiceEntry = {
        id: Date.now().toString(),
        transcript: data.transcript || "Processing...",
        extractedData: data.extractedData,
        createdAt: new Date().toISOString(),
        processingStatus: data.transcript ? 'completed' : 'processing'
      };

      setRecentEntries(prev => [newEntry, ...prev.slice(0, 4)]);
      setTranscript(data.transcript || "");
      
      if (data.extractedData) {
        toast({
          title: "Expense extracted!",
          description: `Found: $${data.extractedData.amount} for ${data.extractedData.category}`,
        });
      }
    } catch (error: any) {
      console.error('Voice processing error:', error);
      toast({
        title: "Processing failed",
        description: error.message || "Failed to process voice entry",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setAudioBlob(null);
    }
  };

  const playAudio = (entryId: string, audioUrl?: string) => {
    if (playingId === entryId) {
      audioPlayerRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (audioUrl) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = audioUrl;
        audioPlayerRef.current.play();
        setPlayingId(entryId);
        
        audioPlayerRef.current.onended = () => setPlayingId(null);
      }
    } else if (audioBlob && entryId === 'current') {
      const url = URL.createObjectURL(audioBlob);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = url;
        audioPlayerRef.current.play();
        setPlayingId(entryId);
        
        audioPlayerRef.current.onended = () => {
          setPlayingId(null);
          URL.revokeObjectURL(url);
        };
      }
    }
  };

  const deleteEntry = (entryId: string) => {
    setRecentEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  const createTransaction = async (entry: VoiceEntry) => {
    if (!entry.extractedData || !user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: entry.extractedData.amount,
          description: entry.extractedData.description || entry.transcript,
          category: entry.extractedData.category,
          type: 'expense',
          date: entry.extractedData.date || new Date().toISOString().split('T')[0],
          currency_id: 'usd-currency-id' // You'll need to map this properly
        });

      if (error) throw error;

      toast({
        title: "Transaction created!",
        description: "Voice expense has been added to your records.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to create transaction",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <audio ref={audioPlayerRef} style={{ display: 'none' }} />
      
      {/* Header */}
      <Card className="gradient-primary text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-heading font-bold mb-2">Voice Expense Entry</h3>
              <p className="opacity-90">Speak naturally about your expenses and let AI extract the details</p>
            </div>
            <Mic className="h-12 w-12 opacity-75" />
          </div>
        </CardContent>
      </Card>

      {/* Recording Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Record Expense
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              animate={isRecording ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ repeat: isRecording ? Infinity : 0, duration: 1 }}
            >
              <Button
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-20 h-20 rounded-full ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {isRecording ? (
                  <MicOff className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>
            </motion.div>
            
            <div className="text-center">
              <p className="font-medium">
                {isRecording ? "Recording..." : "Click to start recording"}
              </p>
              <p className="text-sm text-muted-foreground">
                Say something like: "I spent $15 on lunch at McDonald's today"
              </p>
            </div>
          </div>

          {/* Audio Preview */}
          <AnimatePresence>
            {audioBlob && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="border rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileAudio className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Recorded Audio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => playAudio('current')}
                    >
                      {playingId === 'current' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAudioBlob(null)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <Button
                  onClick={processVoiceEntry}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Extract Expense Data
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Processing Status */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing audio...</span>
                <span>Please wait</span>
              </div>
              <Progress value={undefined} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Recent Voice Entries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        entry.processingStatus === 'completed' ? 'default' :
                        entry.processingStatus === 'processing' ? 'secondary' : 'destructive'
                      }>
                        {entry.processingStatus}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <p className="text-sm">{entry.transcript}</p>
                    
                    {entry.extractedData && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/50 rounded">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Amount</p>
                          <p className="font-semibold text-green-600">
                            ${entry.extractedData.amount?.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Category</p>
                          <p className="font-medium">{entry.extractedData.category}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Date</p>
                          <p className="font-medium">{entry.extractedData.date}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Confidence</p>
                          <p className="font-medium">
                            {(entry.extractedData.confidence || 0.95 * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    {entry.audioUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playAudio(entry.id, entry.audioUrl)}
                      >
                        {playingId === entry.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    
                    {entry.extractedData && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => createTransaction(entry)}
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceExpenseEntry;