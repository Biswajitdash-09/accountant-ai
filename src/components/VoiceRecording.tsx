
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Play, Pause, Trash2 } from 'lucide-react';
import { useVoiceEntries } from '@/hooks/useVoiceEntries';
import { Progress } from '@/components/ui/progress';

export const VoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { uploadVoiceEntry } = useVoiceEntries();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const playRecording = () => {
    if (audioBlob && !isPlaying) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play();
      setIsPlaying(true);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    } else if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleUpload = async () => {
    if (audioBlob) {
      const fileName = `voice-${Date.now()}.webm`;
      await uploadVoiceEntry.mutateAsync({ audioBlob, fileName });
      clearRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice Recording
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-mono mb-2">
            {formatTime(recordingTime)}
          </div>
          {isRecording && (
            <Progress value={(recordingTime % 60) * (100 / 60)} className="w-full mb-4" />
          )}
        </div>

        <div className="flex justify-center gap-2">
          {!isRecording && !audioBlob && (
            <Button onClick={startRecording} size="lg" className="gap-2">
              <Mic className="h-4 w-4" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <Button onClick={stopRecording} variant="destructive" size="lg" className="gap-2">
              <MicOff className="h-4 w-4" />
              Stop Recording
            </Button>
          )}

          {audioBlob && !isRecording && (
            <div className="flex gap-2">
              <Button onClick={playRecording} variant="outline" className="gap-2">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button onClick={clearRecording} variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {audioBlob && !isRecording && (
          <div className="space-y-2">
            <Button 
              onClick={handleUpload} 
              className="w-full" 
              disabled={uploadVoiceEntry.isPending}
            >
              {uploadVoiceEntry.isPending ? 'Processing...' : 'Process & Add Transaction'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              AI will extract transaction details from your voice recording
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
