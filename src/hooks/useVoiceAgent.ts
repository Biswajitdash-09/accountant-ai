import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AudioRecorder, AudioQueue, encodeAudioForAPI, decodeAudioFromAPI } from '@/utils/VoiceAgentAudio';
import { executeVoiceAction } from '@/lib/voiceActionHandler';

export type VoiceAgentStatus = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'error';
export type InputMode = 'push-to-talk' | 'continuous';

export interface VoiceMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioPlayed?: boolean;
}

export interface VoiceAgentOptions {
  voice?: string;
  inputMode?: InputMode;
  onStatusChange?: (status: VoiceAgentStatus) => void;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onMessage?: (message: VoiceMessage) => void;
  onToolCall?: (toolName: string, args: any, result: any) => void;
}

export const useVoiceAgent = (options: VoiceAgentOptions = {}) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<VoiceAgentStatus>('idle');
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const sessionCreatedRef = useRef(false);
  const pendingToolCallsRef = useRef<Map<string, any>>(new Map());

  const updateStatus = useCallback((newStatus: VoiceAgentStatus) => {
    setStatus(newStatus);
    options.onStatusChange?.(newStatus);
  }, [options]);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const message: VoiceMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
    options.onMessage?.(message);
    return message;
  }, [options]);

  const handleDataChannelMessage = useCallback(async (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Voice Agent received:', data.type);

      switch (data.type) {
        case 'session.created':
          console.log('Session created, sending session.update');
          sessionCreatedRef.current = true;
          break;

        case 'session.updated':
          console.log('Session updated successfully');
          updateStatus('listening');
          break;

        case 'input_audio_buffer.speech_started':
          updateStatus('listening');
          setCurrentTranscript('');
          break;

        case 'input_audio_buffer.speech_stopped':
          updateStatus('processing');
          break;

        case 'conversation.item.input_audio_transcription.completed':
          if (data.transcript) {
            setCurrentTranscript(data.transcript);
            options.onTranscript?.(data.transcript, true);
            addMessage('user', data.transcript);
          }
          break;

        case 'response.audio_transcript.delta':
          if (data.delta) {
            setCurrentTranscript(prev => prev + data.delta);
            options.onTranscript?.(data.delta, false);
          }
          break;

        case 'response.audio_transcript.done':
          if (data.transcript) {
            addMessage('assistant', data.transcript);
            setCurrentTranscript('');
          }
          break;

        case 'response.audio.delta':
          updateStatus('speaking');
          if (data.delta && audioQueueRef.current) {
            const audioData = decodeAudioFromAPI(data.delta);
            await audioQueueRef.current.addToQueue(audioData);
          }
          break;

        case 'response.audio.done':
          // Audio playback will trigger status change via AudioQueue callbacks
          break;

        case 'response.function_call_arguments.delta':
          // Accumulate function call arguments
          const callId = data.call_id;
          if (!pendingToolCallsRef.current.has(callId)) {
            pendingToolCallsRef.current.set(callId, {
              name: data.name || '',
              arguments: ''
            });
          }
          const pending = pendingToolCallsRef.current.get(callId);
          pending.arguments += data.delta || '';
          break;

        case 'response.function_call_arguments.done':
          // Execute the function call
          const toolCallId = data.call_id;
          const toolCall = pendingToolCallsRef.current.get(toolCallId) || {
            name: data.name,
            arguments: data.arguments
          };
          
          try {
            const args = JSON.parse(toolCall.arguments || data.arguments);
            console.log(`Executing tool: ${data.name}`, args);
            
            const result = await executeVoiceAction(data.name, args);
            options.onToolCall?.(data.name, args, result);

            // Send tool result back to the model
            if (dcRef.current?.readyState === 'open') {
              dcRef.current.send(JSON.stringify({
                type: 'conversation.item.create',
                item: {
                  type: 'function_call_output',
                  call_id: toolCallId,
                  output: JSON.stringify(result)
                }
              }));
              
              // Request a response based on the tool result
              dcRef.current.send(JSON.stringify({ type: 'response.create' }));
            }
          } catch (error) {
            console.error('Tool execution error:', error);
          }
          
          pendingToolCallsRef.current.delete(toolCallId);
          break;

        case 'response.done':
          if (!audioQueueRef.current?.playing) {
            updateStatus('listening');
          }
          break;

        case 'error':
          console.error('Voice Agent error:', data.error);
          toast({
            title: 'Voice Error',
            description: data.error?.message || 'An error occurred',
            variant: 'destructive'
          });
          updateStatus('error');
          break;
      }
    } catch (error) {
      console.error('Error parsing data channel message:', error);
    }
  }, [updateStatus, addMessage, options, toast]);

  const connect = useCallback(async () => {
    try {
      updateStatus('connecting');

      // Get ephemeral token from edge function
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke(
        'voice-realtime-session',
        {
          body: { voice: options.voice || 'alloy' }
        }
      );

      if (sessionError || !sessionData?.client_secret?.value) {
        throw new Error(sessionError?.message || 'Failed to get session token');
      }

      const EPHEMERAL_KEY = sessionData.client_secret.value;

      // Initialize audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      audioQueueRef.current = new AudioQueue(audioContextRef.current, {
        onPlaybackStart: () => updateStatus('speaking'),
        onPlaybackEnd: () => {
          if (isConnected) {
            updateStatus('listening');
          }
        }
      });

      // Create peer connection
      pcRef.current = new RTCPeerConnection();

      // Set up audio element for remote audio
      audioElRef.current = document.createElement('audio');
      audioElRef.current.autoplay = true;
      pcRef.current.ontrack = (e) => {
        if (audioElRef.current) {
          audioElRef.current.srcObject = e.streams[0];
        }
      };

      // Add local audio track
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      pcRef.current.addTrack(mediaStream.getTracks()[0]);

      // Set up data channel for events
      dcRef.current = pcRef.current.createDataChannel('oai-events');
      dcRef.current.addEventListener('message', handleDataChannelMessage);
      dcRef.current.addEventListener('open', () => {
        console.log('Data channel opened');
      });

      // Create and set local description
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);

      // Connect to OpenAI's Realtime API
      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview-2024-12-17';
      
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          'Content-Type': 'application/sdp'
        }
      });

      if (!sdpResponse.ok) {
        throw new Error('Failed to connect to OpenAI Realtime API');
      }

      const answer: RTCSessionDescriptionInit = {
        type: 'answer',
        sdp: await sdpResponse.text()
      };

      await pcRef.current.setRemoteDescription(answer);
      
      setIsConnected(true);
      updateStatus('listening');
      
      toast({
        title: 'Voice Agent Connected',
        description: 'Arnold is now listening'
      });

    } catch (error) {
      console.error('Connection error:', error);
      updateStatus('error');
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect',
        variant: 'destructive'
      });
    }
  }, [options.voice, updateStatus, handleDataChannelMessage, toast, isConnected]);

  const disconnect = useCallback(() => {
    recorderRef.current?.stop();
    dcRef.current?.close();
    pcRef.current?.close();
    audioContextRef.current?.close();
    
    recorderRef.current = null;
    dcRef.current = null;
    pcRef.current = null;
    audioContextRef.current = null;
    audioQueueRef.current = null;
    sessionCreatedRef.current = false;
    
    setIsConnected(false);
    updateStatus('idle');
    setCurrentTranscript('');
    
    console.log('Voice Agent disconnected');
  }, [updateStatus]);

  const sendTextMessage = useCallback((text: string) => {
    if (!dcRef.current || dcRef.current.readyState !== 'open') {
      toast({
        title: 'Not Connected',
        description: 'Please connect first',
        variant: 'destructive'
      });
      return;
    }

    addMessage('user', text);

    dcRef.current.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }]
      }
    }));

    dcRef.current.send(JSON.stringify({ type: 'response.create' }));
    updateStatus('processing');
  }, [addMessage, toast, updateStatus]);

  const toggleMute = useCallback(() => {
    if (recorderRef.current) {
      if (isMuted) {
        recorderRef.current.resume();
      } else {
        recorderRef.current.pause();
      }
    }
    setIsMuted(!isMuted);
  }, [isMuted]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
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
  };
};
