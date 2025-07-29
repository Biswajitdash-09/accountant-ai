
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCredits } from "@/hooks/useCredits";

export interface ChatMessage {
  id: string;
  user_id: string;
  message_content: string;
  message_type: 'user' | 'assistant';
  conversation_id: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export const useChatHistory = (conversationId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { availableCredits, useCredit } = useCredits();

  const {
    data: chatHistory = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['chat_history', conversationId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (conversationId) {
        query = query.eq('conversation_id', conversationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!user,
  });

  const saveMessage = useMutation({
    mutationFn: async (messageData: {
      message_content: string;
      message_type: 'user' | 'assistant';
      conversation_id: string;
      metadata?: any;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Use credit for assistant messages (AI responses)
      if (messageData.message_type === 'assistant') {
        if (availableCredits <= 0) {
          throw new Error('Not enough credits for AI response');
        }
        
        await useCredit.mutateAsync(1);
      }

      const { data, error } = await supabase
        .from('chat_history')
        .insert({
          ...messageData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_history'] });
    },
    onError: (error) => {
      console.error('Error saving chat message:', error);
      toast({
        title: "Error",
        description: error instanceof Error && error.message === 'Not enough credits for AI response' 
          ? "Not enough credits for AI response. Please purchase more credits."
          : "Failed to save chat message.",
        variant: "destructive",
      });
    },
  });

  const deleteConversation = useMutation({
    mutationFn: async (convId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id)
        .eq('conversation_id', convId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_history'] });
      toast({
        title: "Success",
        description: "Conversation deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete conversation.",
        variant: "destructive",
      });
    },
  });

  const getConversations = useQuery({
    queryKey: ['chat_conversations'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('chat_history')
        .select('conversation_id, created_at, message_content')
        .eq('user_id', user.id)
        .eq('message_type', 'user')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Group by conversation_id and get the first message as title
      const conversations = data.reduce((acc: any[], msg) => {
        if (!acc.find(c => c.conversation_id === msg.conversation_id)) {
          acc.push({
            conversation_id: msg.conversation_id,
            title: msg.message_content.slice(0, 50) + (msg.message_content.length > 50 ? '...' : ''),
            created_at: msg.created_at
          });
        }
        return acc;
      }, []);

      return conversations;
    },
    enabled: !!user,
  });

  return {
    chatHistory,
    isLoading,
    error,
    saveMessage,
    deleteConversation,
    conversations: getConversations.data || [],
    isLoadingConversations: getConversations.isLoading,
    availableCredits,
  };
};
