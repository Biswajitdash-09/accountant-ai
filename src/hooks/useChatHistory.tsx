import { useState, useEffect } from 'react';

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

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setSessions(parsedHistory);
      } catch (error) {
        console.error('Failed to parse chat history:', error);
      }
    }
  }, []);

  // Save chat history to localStorage whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(sessions));
    }
  }, [sessions]);

  const createNewSession = (title?: string): string => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: title || `Chat ${sessions.length + 1}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  };

  const addMessageToSession = (sessionId: string, message: ChatMessage) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? {
            ...session,
            messages: [...session.messages, message],
            updatedAt: new Date()
          }
        : session
    ));
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  };

  const getCurrentSession = (): ChatSession | null => {
    return sessions.find(session => session.id === currentSessionId) || null;
  };

  const exportChatHistory = (): string => {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      totalSessions: sessions.length,
      sessions: sessions
    }, null, 2);
  };

  const clearAllHistory = () => {
    setSessions([]);
    setCurrentSessionId(null);
    localStorage.removeItem('chatHistory');
  };

  return {
    sessions,
    currentSessionId,
    createNewSession,
    addMessageToSession,
    deleteSession,
    getCurrentSession,
    exportChatHistory,
    clearAllHistory,
    setCurrentSessionId
  };
};