import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export const useChatHistory = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load chat history from database on mount
  useEffect(() => {
    if (!user) return;
    
    const loadChatHistory = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Group messages by conversation_id
        const sessionsMap = new Map<string, ChatSession>();
        
        data?.forEach((msg) => {
          const convId = msg.conversation_id;
          if (!sessionsMap.has(convId)) {
            sessionsMap.set(convId, {
              id: convId,
              title: `Chat ${sessionsMap.size + 1}`,
              messages: [],
              createdAt: new Date(msg.created_at),
              updatedAt: new Date(msg.updated_at),
            });
          }
          
          const session = sessionsMap.get(convId)!;
          session.messages.push({
            id: msg.id,
            content: msg.message_content,
            role: msg.message_type as 'user' | 'assistant',
            timestamp: new Date(msg.created_at),
          });
          
          // Update title from metadata if available
          if (msg.metadata && typeof msg.metadata === 'object' && 'title' in msg.metadata) {
            session.title = (msg.metadata as { title?: string }).title || session.title;
          }
          
          // Update timestamps
          const msgDate = new Date(msg.updated_at);
          if (msgDate > session.updatedAt) {
            session.updatedAt = msgDate;
          }
        });

        // Sort messages within each session by timestamp
        sessionsMap.forEach((session) => {
          session.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        });

        setSessions(Array.from(sessionsMap.values()));
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatHistory();
  }, [user]);

  const createNewSession = useCallback(async (title?: string): Promise<string> => {
    const newSessionId = crypto.randomUUID();
    const newSession: ChatSession = {
      id: newSessionId,
      title: title || `Chat ${sessions.length + 1}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
    return newSessionId;
  }, [sessions.length]);

  const addMessageToSession = useCallback(async (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (!user) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: message.content,
      role: message.role,
      timestamp: new Date(),
    };

    // Update local state immediately
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? {
            ...session,
            messages: [...session.messages, newMessage],
            updatedAt: new Date()
          }
        : session
    ));

    // Persist to database
    try {
      const { error } = await supabase
        .from('chat_history')
        .insert({
          id: newMessage.id,
          user_id: user.id,
          conversation_id: sessionId,
          message_content: message.content,
          message_type: message.role,
          metadata: { title: sessions.find(s => s.id === sessionId)?.title },
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  }, [user, sessions]);

  const deleteSession = useCallback(async (sessionId: string) => {
    if (!user) return;

    setSessions(prev => prev.filter(session => session.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }

    // Delete from database
    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id)
        .eq('conversation_id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete chat session',
        variant: 'destructive',
      });
    }
  }, [user, currentSessionId, toast]);

  const getCurrentSession = useCallback((): ChatSession | null => {
    return sessions.find(session => session.id === currentSessionId) || null;
  }, [sessions, currentSessionId]);

  const exportChatHistory = useCallback((): string => {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      totalSessions: sessions.length,
      sessions: sessions
    }, null, 2);
  }, [sessions]);

  const clearAllHistory = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setSessions([]);
      setCurrentSessionId(null);
    } catch (error) {
      console.error('Failed to clear history:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear chat history',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  return {
    sessions,
    currentSessionId,
    isLoading,
    createNewSession,
    addMessageToSession,
    deleteSession,
    getCurrentSession,
    exportChatHistory,
    clearAllHistory,
    setCurrentSessionId
  };
};
