import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Phone, PhoneOff, Send, Settings, 
  Volume2, VolumeX, Trash2, Bot, User, Loader2,
  Sparkles, Wifi, WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceAgent, VoiceAgentStatus } from '@/hooks/useVoiceAgent';
import { useVoicePreferences } from '@/hooks/useVoicePreferences';
import { VoiceWaveform } from './VoiceWaveform';
import { VoiceSettings } from './VoiceSettings';
import { Avatar } from '@/components/ui/avatar';

interface VoiceAgentProps {
  className?: string;
  onClose?: () => void;
}

const statusConfig: Record<VoiceAgentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  idle: { label: 'Ready', color: 'bg-muted', icon: <WifiOff className="h-3 w-3" /> },
  connecting: { label: 'Connecting...', color: 'bg-yellow-500', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  listening: { label: 'Listening', color: 'bg-green-500', icon: <Mic className="h-3 w-3" /> },
  processing: { label: 'Thinking...', color: 'bg-blue-500', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  speaking: { label: 'Speaking', color: 'bg-primary', icon: <Volume2 className="h-3 w-3" /> },
  error: { label: 'Error', color: 'bg-destructive', icon: <WifiOff className="h-3 w-3" /> }
};

export const VoiceAgent: React.FC<VoiceAgentProps> = ({ className, onClose }) => {
  const { preferences } = useVoicePreferences();
  const [textInput, setTextInput] = useState('');
  
  const {
    status,
    isConnected,
    messages,
    currentTranscript,
    isMuted,
    connect,
    disconnect,
    sendTextMessage,
    toggleMute,
    clearMessages
  } = useVoiceAgent({
    voice: preferences.voice,
    inputMode: preferences.inputMode
  });

  const statusInfo = statusConfig[status];

  // Auto-connect if preference is set
  useEffect(() => {
    if (preferences.autoConnect && !isConnected && status === 'idle') {
      connect();
    }
  }, [preferences.autoConnect]);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && isConnected) {
      sendTextMessage(textInput.trim());
      setTextInput('');
    }
  };

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <CardHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-primary/10">
              <Bot className="h-6 w-6 text-primary" />
            </Avatar>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Arnold Voice
                <Sparkles className="h-4 w-4 text-primary" />
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs", statusInfo.color, "text-white")}
                >
                  {statusInfo.icon}
                  <span className="ml-1">{statusInfo.label}</span>
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <VoiceSettings />
            
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={clearMessages}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          {messages.length === 0 && !isConnected ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-6 rounded-full bg-primary/10"
              >
                <Mic className="h-12 w-12 text-primary" />
              </motion.div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-lg font-semibold">Voice Assistant</h3>
                <p className="text-sm text-muted-foreground">
                  Talk to Arnold using your voice. Ask about your finances, 
                  create transactions, or get insights.
                </p>
              </div>
              <Button onClick={connect} size="lg" className="min-h-[48px]">
                <Phone className="h-5 w-5 mr-2" />
                Start Conversation
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    )}
                  >
                    <Avatar className={cn(
                      "h-8 w-8 shrink-0",
                      message.role === 'assistant' ? 'bg-primary/10' : 'bg-muted'
                    )}>
                      {message.role === 'assistant' 
                        ? <Bot className="h-5 w-5 text-primary" />
                        : <User className="h-5 w-5" />
                      }
                    </Avatar>
                    <div className={cn(
                      "rounded-lg px-4 py-2 max-w-[80%]",
                      message.role === 'assistant' 
                        ? 'bg-muted' 
                        : 'bg-primary text-primary-foreground'
                    )}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Current Transcript */}
              {currentTranscript && preferences.showTranscript && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <Avatar className="h-8 w-8 shrink-0 bg-muted">
                    <User className="h-5 w-5" />
                  </Avatar>
                  <div className="rounded-lg px-4 py-2 bg-muted/50 border border-dashed">
                    <p className="text-sm text-muted-foreground italic">
                      {currentTranscript}...
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Voice Controls */}
      {isConnected && (
        <div className="border-t p-4 space-y-4">
          {/* Waveform */}
          <VoiceWaveform 
            isActive={status === 'listening' || status === 'speaking'} 
            isSpeaking={status === 'speaking'}
          />

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={toggleMute}
            >
              {isMuted 
                ? <MicOff className="h-5 w-5 text-destructive" />
                : <Mic className="h-5 w-5" />
              }
            </Button>

            <Button
              variant="destructive"
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={disconnect}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={toggleMute}
            >
              {isMuted 
                ? <VolumeX className="h-5 w-5 text-destructive" />
                : <Volume2 className="h-5 w-5" />
              }
            </Button>
          </div>

          {/* Text Input Fallback */}
          <form onSubmit={handleSendText} className="flex gap-2">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type a message..."
              className="flex-1 min-h-[44px]"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-11 w-11"
              disabled={!textInput.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      {/* Connect Button when disconnected but has messages */}
      {!isConnected && messages.length > 0 && (
        <div className="border-t p-4">
          <Button onClick={connect} className="w-full min-h-[48px]">
            <Phone className="h-5 w-5 mr-2" />
            Reconnect
          </Button>
        </div>
      )}
    </Card>
  );
};
