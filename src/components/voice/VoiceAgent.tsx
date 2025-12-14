import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Phone, PhoneOff, Send, 
  Volume2, VolumeX, Trash2, Bot, User, Loader2,
  Sparkles, Wifi, WifiOff, AlertCircle, RefreshCw,
  Shield, Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceAgent, VoiceAgentStatus } from '@/hooks/useVoiceAgent';
import { useVoicePreferences } from '@/hooks/useVoicePreferences';
import { VoiceWaveform } from './VoiceWaveform';
import { VoiceSettings } from './VoiceSettings';
import { Avatar } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  error: { label: 'Error', color: 'bg-destructive', icon: <AlertCircle className="h-3 w-3" /> }
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
    connectionQuality,
    micPermission,
    executingTool,
    isPushToTalkActive,
    connect,
    disconnect,
    sendTextMessage,
    toggleMute,
    startPushToTalk,
    stopPushToTalk,
    clearMessages,
    retryConnection,
    requestMicrophoneAccess
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

  // Push-to-talk handlers
  const handlePushToTalkStart = useCallback(() => {
    if (preferences.inputMode === 'push-to-talk') {
      startPushToTalk();
    }
  }, [preferences.inputMode, startPushToTalk]);

  const handlePushToTalkEnd = useCallback(() => {
    if (preferences.inputMode === 'push-to-talk') {
      stopPushToTalk();
    }
  }, [preferences.inputMode, stopPushToTalk]);

  const renderMessage = (message: typeof messages[0]) => {
    // System messages (tool execution, reconnection)
    if (message.role === 'system') {
      return (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex justify-center"
        >
          <div className={cn(
            "inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full",
            message.isToolExecution 
              ? "bg-primary/10 text-primary" 
              : "bg-muted text-muted-foreground"
          )}>
            {message.isToolExecution && (
              <Wrench className="h-3 w-3" />
            )}
            {message.content}
          </div>
        </motion.div>
      );
    }

    return (
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
    );
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
                
                {/* Connection quality indicator */}
                {isConnected && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      connectionQuality === 'good' ? 'border-green-500 text-green-500' :
                      connectionQuality === 'poor' ? 'border-yellow-500 text-yellow-500' :
                      'border-destructive text-destructive'
                    )}
                  >
                    <Wifi className="h-3 w-3 mr-1" />
                    {connectionQuality === 'good' ? 'Good' : connectionQuality === 'poor' ? 'Poor' : 'Lost'}
                  </Badge>
                )}
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
                aria-label="Clear conversation"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Microphone Permission Alert */}
      {micPermission === 'denied' && (
        <Alert variant="destructive" className="m-4 mb-0">
          <Shield className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Microphone access is required for voice features.</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={requestMicrophoneAccess}
              className="ml-2"
            >
              Grant Access
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Recovery Alert */}
      {status === 'error' && (
        <Alert variant="destructive" className="m-4 mb-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Connection error occurred.</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={retryConnection}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Tool Execution Indicator */}
      {executingTool && (
        <div className="mx-4 mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium">Executing: {executingTool}</span>
          </div>
        </div>
      )}

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
                {preferences.inputMode === 'push-to-talk' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Push-to-talk mode: Hold the microphone button while speaking
                  </p>
                )}
              </div>
              <Button 
                onClick={() => connect()} 
                size="lg" 
                className="min-h-[48px]"
                disabled={status === 'connecting'}
              >
                {status === 'connecting' ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="h-5 w-5 mr-2" />
                    Start Conversation
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map(renderMessage)}
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
            {/* Mute Button */}
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted 
                ? <MicOff className="h-5 w-5 text-destructive" />
                : <Mic className="h-5 w-5" />
              }
            </Button>

            {/* Push-to-Talk or End Call Button */}
            {preferences.inputMode === 'push-to-talk' ? (
              <Button
                variant={isPushToTalkActive ? 'default' : 'outline'}
                size="icon"
                className={cn(
                  "h-14 w-14 rounded-full transition-all",
                  isPushToTalkActive && "bg-primary scale-110"
                )}
                onMouseDown={handlePushToTalkStart}
                onMouseUp={handlePushToTalkEnd}
                onMouseLeave={handlePushToTalkEnd}
                onTouchStart={handlePushToTalkStart}
                onTouchEnd={handlePushToTalkEnd}
                aria-label="Hold to talk"
              >
                <Mic className={cn(
                  "h-6 w-6",
                  isPushToTalkActive && "animate-pulse"
                )} />
              </Button>
            ) : null}

            <Button
              variant="destructive"
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={disconnect}
              aria-label="End conversation"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>

            {/* Volume Button */}
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={toggleMute}
              aria-label={isMuted ? 'Enable audio' : 'Disable audio'}
            >
              {isMuted 
                ? <VolumeX className="h-5 w-5 text-destructive" />
                : <Volume2 className="h-5 w-5" />
              }
            </Button>
          </div>

          {/* Push-to-talk indicator */}
          {preferences.inputMode === 'push-to-talk' && (
            <p className="text-center text-xs text-muted-foreground">
              {isPushToTalkActive ? 'Release to send' : 'Hold the mic button to speak'}
            </p>
          )}

          {/* Text Input Fallback */}
          <form onSubmit={handleSendText} className="flex gap-2">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type a message..."
              className="flex-1 min-h-[44px]"
              aria-label="Type a message"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-11 w-11"
              disabled={!textInput.trim()}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      {/* Connect Button when disconnected but has messages */}
      {!isConnected && messages.length > 0 && status !== 'error' && (
        <div className="border-t p-4">
          <Button 
            onClick={() => connect()} 
            className="w-full min-h-[48px]"
            disabled={status === 'connecting'}
          >
            {status === 'connecting' ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Reconnecting...
              </>
            ) : (
              <>
                <Phone className="h-5 w-5 mr-2" />
                Reconnect
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
};
