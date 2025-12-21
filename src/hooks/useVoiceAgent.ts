import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AudioQueue, decodeAudioFromAPI } from '@/utils/VoiceAgentAudio';
import { executeVoiceAction } from '@/lib/voiceActionHandler';

export type VoiceAgentStatus = 'idle' | 'connecting' | 'listening' | 'processing' | 'speaking' | 'error';
export type InputMode = 'push-to-talk' | 'continuous';

export interface VoiceMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  audioPlayed?: boolean;
  isToolExecution?: boolean;
  toolName?: string;
}

export interface VoiceAgentOptions {
  voice?: string;
  inputMode?: InputMode;
  onStatusChange?: (status: VoiceAgentStatus) => void;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onMessage?: (message: VoiceMessage) => void;
  onToolCall?: (toolName: string, args: any, result: any) => void;
}

// Connection configuration
const CONNECTION_TIMEOUT_MS = 30000;
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_BASE_DELAY_MS = 1000;

export const useVoiceAgent = (options: VoiceAgentOptions = {}) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<VoiceAgentStatus>('idle');
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'disconnected'>('disconnected');
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [executingTool, setExecutingTool] = useState<string | null>(null);
  const [isPushToTalkActive, setIsPushToTalkActive] = useState(false);
  const [fallbackMode, setFallbackMode] = useState<'realtime' | 'lovable_text'>('realtime');

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const sessionCreatedRef = useRef(false);
  const pendingToolCallsRef = useRef<Map<string, any>>(new Map());
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isReconnectingRef = useRef(false);

  const updateStatus = useCallback((newStatus: VoiceAgentStatus) => {
    setStatus(newStatus);
    options.onStatusChange?.(newStatus);
  }, [options]);

  const addMessage = useCallback((role: 'user' | 'assistant' | 'system', content: string, extra?: Partial<VoiceMessage>) => {
    const message: VoiceMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      ...extra
    };
    setMessages(prev => [...prev, message]);
    options.onMessage?.(message);
    return message;
  }, [options]);

  // Check microphone permission
  const checkMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setMicPermission(result.state as 'granted' | 'denied' | 'prompt');
      
      if (result.state === 'denied') {
        toast({
          title: 'Microphone Access Required',
          description: 'Please enable microphone access in your browser settings to use voice features.',
          variant: 'destructive'
        });
        return false;
      }
      return true;
    } catch {
      // Fallback for browsers that don't support permissions API
      return true;
    }
  }, [toast]);

  // Request microphone access
  const requestMicrophoneAccess = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      setMicPermission('granted');
      return stream;
    } catch (error) {
      setMicPermission('denied');
      toast({
        title: 'Microphone Access Denied',
        description: 'Voice features require microphone access. Please allow access and try again.',
        variant: 'destructive'
      });
      return null;
    }
  }, [toast]);

  const handleDataChannelMessage = useCallback(async (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      console.log('[VoiceAgent] Received event:', data.type, data);

      switch (data.type) {
        case 'session.created':
          console.log('[VoiceAgent] Session created successfully');
          sessionCreatedRef.current = true;
          setConnectionQuality('good');
          break;

        case 'session.updated':
          console.log('[VoiceAgent] Session updated, now listening');
          updateStatus('listening');
          break;

        case 'input_audio_buffer.speech_started':
          console.log('[VoiceAgent] Speech started');
          updateStatus('listening');
          setCurrentTranscript('');
          break;

        case 'input_audio_buffer.speech_stopped':
          console.log('[VoiceAgent] Speech stopped, processing');
          updateStatus('processing');
          break;

        case 'conversation.item.input_audio_transcription.completed':
          if (data.transcript) {
            console.log('[VoiceAgent] User transcript:', data.transcript);
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
            console.log('[VoiceAgent] Assistant response:', data.transcript);
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
          console.log('[VoiceAgent] Audio response complete');
          break;

        case 'response.text.delta':
          // Handle text delta for text-only responses
          if (data.delta) {
            setCurrentTranscript(prev => prev + data.delta);
          }
          break;

        case 'response.text.done':
          // Handle text response completion
          if (data.text) {
            console.log('[VoiceAgent] Text response:', data.text);
            addMessage('assistant', data.text);
            setCurrentTranscript('');
            updateStatus('listening');
          }
          break;

        case 'response.function_call_arguments.delta':
          const callId = data.call_id;
          if (!pendingToolCallsRef.current.has(callId)) {
            pendingToolCallsRef.current.set(callId, {
              name: data.name || '',
              arguments: ''
            });
            setExecutingTool(data.name || 'Processing');
            addMessage('system', `Executing: ${data.name || 'tool'}...`, { 
              isToolExecution: true, 
              toolName: data.name 
            });
          }
          const pending = pendingToolCallsRef.current.get(callId);
          pending.arguments += data.delta || '';
          break;

        case 'response.function_call_arguments.done':
          const toolCallId = data.call_id;
          const toolCall = pendingToolCallsRef.current.get(toolCallId) || {
            name: data.name,
            arguments: data.arguments
          };
          
          try {
            console.log('[VoiceAgent] Executing tool:', data.name, toolCall.arguments || data.arguments);
            const args = JSON.parse(toolCall.arguments || data.arguments);
            
            const result = await executeVoiceAction(data.name, args);
            console.log('[VoiceAgent] Tool result:', result);
            options.onToolCall?.(data.name, args, result);

            setMessages(prev => prev.map(msg => 
              msg.isToolExecution && msg.toolName === data.name
                ? { ...msg, content: result.success ? `✓ ${result.message || 'Completed'}` : `✗ ${result.error || 'Failed'}` }
                : msg
            ));

            if (dcRef.current?.readyState === 'open') {
              dcRef.current.send(JSON.stringify({
                type: 'conversation.item.create',
                item: {
                  type: 'function_call_output',
                  call_id: toolCallId,
                  output: JSON.stringify(result)
                }
              }));
              
              dcRef.current.send(JSON.stringify({ type: 'response.create' }));
            }
          } catch (error) {
            console.error('[VoiceAgent] Tool execution error:', error);
            setMessages(prev => prev.map(msg => 
              msg.isToolExecution && msg.toolName === data.name
                ? { ...msg, content: `✗ Error executing ${data.name}` }
                : msg
            ));
          }
          
          setExecutingTool(null);
          pendingToolCallsRef.current.delete(toolCallId);
          break;

        case 'response.done': {
          console.log('[VoiceAgent] Response done');

          const resp = data.response;
          const failed = resp?.status === 'failed';
          const err = resp?.status_details?.error;

          if (failed && err?.code === 'insufficient_quota') {
            console.error('[VoiceAgent] OpenAI quota exhausted:', err);

            // Prevent repeated failures from microphone-triggered responses
            const track = mediaStreamRef.current?.getAudioTracks?.()[0];
            if (track) track.enabled = false;
            setIsMuted(true);

            setFallbackMode('lovable_text');
            addMessage('system', 'Voice is temporarily unavailable due to OpenAI quota limits. Switching to text mode.');

            toast({
              title: 'Voice temporarily unavailable',
              description: 'OpenAI quota exhausted. Using text mode instead.',
              variant: 'destructive'
            });

            updateStatus('listening');
            break;
          }

          if (failed && err?.message) {
            console.error('[VoiceAgent] Response failed:', err);
            toast({
              title: 'Voice error',
              description: err.message,
              variant: 'destructive'
            });
            updateStatus('error');
            break;
          }

          if (!audioQueueRef.current?.playing) {
            updateStatus('listening');
          }
          break;
        }

        case 'response.created':
          console.log('[VoiceAgent] Response started');
          updateStatus('processing');
          break;

        case 'error':
          const errorMsg = data.error?.message || 'An error occurred';
          console.error('[VoiceAgent] Error:', data.error);
          
          if (data.error?.code === 'rate_limit_exceeded') {
            toast({
              title: 'Rate Limit Reached',
              description: 'Please wait a moment before speaking again.',
              variant: 'destructive'
            });
          } else {
            toast({
              title: 'Voice Error',
              description: errorMsg,
              variant: 'destructive'
            });
          }
          updateStatus('error');
          break;

        default:
          console.log('[VoiceAgent] Unhandled event type:', data.type);
      }
    } catch (error) {
      console.error('[VoiceAgent] Error parsing message:', error);
    }
  }, [updateStatus, addMessage, options, toast]);

  const cleanupConnection = useCallback(() => {
    // Clear connection timeout
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    dcRef.current?.close();
    pcRef.current?.close();
    audioContextRef.current?.close();
    
    dcRef.current = null;
    pcRef.current = null;
    audioContextRef.current = null;
    audioQueueRef.current = null;
    sessionCreatedRef.current = false;
    
    setConnectionQuality('disconnected');
  }, []);

  const connect = useCallback(async (isReconnect = false) => {
    try {
      // Check microphone permission first
      const hasPermission = await checkMicrophonePermission();
      if (!hasPermission && micPermission === 'denied') {
        updateStatus('error');
        return;
      }

      updateStatus('connecting');
      
      if (!isReconnect) {
        reconnectAttemptsRef.current = 0;
      }

      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (status === 'connecting') {
          toast({
            title: 'Connection Timeout',
            description: 'Unable to connect. Please check your internet connection and try again.',
            variant: 'destructive'
          });
          cleanupConnection();
          updateStatus('error');
        }
      }, CONNECTION_TIMEOUT_MS);

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

      // Request microphone access
      const mediaStream = await requestMicrophoneAccess();
      if (!mediaStream) {
        cleanupConnection();
        updateStatus('error');
        return;
      }
      mediaStreamRef.current = mediaStream;

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

      // Create peer connection with ICE handling
      pcRef.current = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      // Monitor connection state
      pcRef.current.onconnectionstatechange = () => {
        const state = pcRef.current?.connectionState;
        
        if (state === 'disconnected' || state === 'failed') {
          setConnectionQuality('poor');
          
          if (state === 'failed' && !isReconnectingRef.current) {
            handleReconnect();
          }
        } else if (state === 'connected') {
          setConnectionQuality('good');
          reconnectAttemptsRef.current = 0;
        }
      };

      // Set up audio element for remote audio
      audioElRef.current = document.createElement('audio');
      audioElRef.current.autoplay = true;
      pcRef.current.ontrack = (e) => {
        if (audioElRef.current) {
          audioElRef.current.srcObject = e.streams[0];
        }
      };

      // Add local audio track
      pcRef.current.addTrack(mediaStream.getTracks()[0]);

      // Set up data channel for events
      dcRef.current = pcRef.current.createDataChannel('oai-events');
      dcRef.current.addEventListener('message', handleDataChannelMessage);
      dcRef.current.addEventListener('open', () => {
        // Clear connection timeout on successful connection
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
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
        const errorText = await sdpResponse.text();
        throw new Error(`API connection failed: ${sdpResponse.status}`);
      }

      const answer: RTCSessionDescriptionInit = {
        type: 'answer',
        sdp: await sdpResponse.text()
      };

      await pcRef.current.setRemoteDescription(answer);
      
      setIsConnected(true);
      updateStatus('listening');
      isReconnectingRef.current = false;
      
      toast({
        title: 'Voice Agent Connected',
        description: 'Arnold is now listening'
      });

    } catch (error) {
      cleanupConnection();
      updateStatus('error');
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect';
      
      // Attempt reconnection for recoverable errors
      if (!isReconnect && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        handleReconnect();
      } else {
        toast({
          title: 'Connection Failed',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }
  }, [options.voice, updateStatus, handleDataChannelMessage, toast, isConnected, checkMicrophonePermission, requestMicrophoneAccess, cleanupConnection, micPermission, status]);

  const handleReconnect = useCallback(() => {
    if (isReconnectingRef.current || reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      return;
    }

    isReconnectingRef.current = true;
    reconnectAttemptsRef.current++;

    const delay = RECONNECT_BASE_DELAY_MS * Math.pow(2, reconnectAttemptsRef.current - 1);
    
    addMessage('system', `Connection lost. Reconnecting (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);

    setTimeout(() => {
      cleanupConnection();
      connect(true);
    }, delay);
  }, [addMessage, cleanupConnection, connect]);

  const disconnect = useCallback(() => {
    cleanupConnection();
    setIsConnected(false);
    updateStatus('idle');
    setCurrentTranscript('');
    isReconnectingRef.current = false;
    reconnectAttemptsRef.current = 0;
  }, [updateStatus, cleanupConnection]);

  const sendTextMessage = useCallback(async (text: string) => {
    if (!isConnected) {
      toast({
        title: 'Not Connected',
        description: 'Please connect first',
        variant: 'destructive'
      });
      return;
    }

    addMessage('user', text);
    updateStatus('processing');

    // Fallback: if OpenAI realtime is unavailable (quota), respond via Lovable AI (ai-generate)
    if (fallbackMode === 'lovable_text') {
      const { data, error } = await supabase.functions.invoke('ai-generate', {
        body: { message: text }
      });

      if (error || !data?.text) {
        toast({
          title: 'AI Error',
          description: error?.message || 'Failed to generate response',
          variant: 'destructive'
        });
        updateStatus('error');
        return;
      }

      addMessage('assistant', data.text);
      updateStatus('listening');
      return;
    }

    if (!dcRef.current || dcRef.current.readyState !== 'open') {
      toast({
        title: 'Not Connected',
        description: 'Please reconnect and try again',
        variant: 'destructive'
      });
      updateStatus('error');
      return;
    }

    dcRef.current.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }]
      }
    }));

    dcRef.current.send(JSON.stringify({ type: 'response.create' }));
  }, [addMessage, toast, updateStatus, fallbackMode, isConnected]);

  const toggleMute = useCallback(() => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  }, [isMuted]);

  // Push-to-talk handlers
  const startPushToTalk = useCallback(() => {
    if (options.inputMode === 'push-to-talk' && mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = true;
        setIsPushToTalkActive(true);
      }
    }
  }, [options.inputMode]);

  const stopPushToTalk = useCallback(() => {
    if (options.inputMode === 'push-to-talk' && mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = false;
        setIsPushToTalkActive(false);
      }
    }
  }, [options.inputMode]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const retryConnection = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupConnection();
    };
  }, [cleanupConnection]);

  // Initialize push-to-talk mode
  useEffect(() => {
    if (isConnected && options.inputMode === 'push-to-talk' && mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = false;
      }
    }
  }, [isConnected, options.inputMode]);

  return {
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
  };
};
