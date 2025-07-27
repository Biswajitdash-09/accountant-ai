
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface VoiceEntry {
  id: string;
  user_id: string;
  storage_path: string;
  status: 'uploaded' | 'processing' | 'done' | 'failed';
  transcript?: string;
  parsed?: any;
  error_message?: string;
  created_at: string;
  processed_at?: string;
}

export const useVoiceEntries = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: voiceEntries = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['voice-entries'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .rpc('get_voice_entries', { p_user_id: user.id });

      if (error) {
        // Fallback to direct query if RPC doesn't exist
        console.log('RPC not available, using direct query');
        const { data: directData, error: directError } = await (supabase as any)
          .from('voice_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (directError) throw directError;
        return (directData || []) as VoiceEntry[];
      }
      
      return (data || []) as VoiceEntry[];
    },
    enabled: !!user,
  });

  const uploadVoiceEntry = useMutation({
    mutationFn: async ({ audioBlob, fileName }: { audioBlob: Blob; fileName: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Upload audio file to Supabase Storage
      const storagePath = `voice/${user.id}/${Date.now()}-${fileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice')
        .upload(storagePath, audioBlob, {
          contentType: 'audio/webm',
        });

      if (uploadError) throw uploadError;

      // Create voice entry record using RPC or direct insert
      try {
        const { data: voiceEntry, error: insertError } = await (supabase as any)
          .from('voice_entries')
          .insert([{
            user_id: user.id,
            storage_path: uploadData.path,
            status: 'uploaded'
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        // Trigger processing Edge Function
        const { error: processError } = await supabase.functions.invoke('process-voice', {
          body: { entry_id: voiceEntry.id }
        });

        if (processError) console.warn('Processing trigger failed:', processError);

        return voiceEntry;
      } catch (dbError) {
        console.error('Database insert failed:', dbError);
        throw new Error('Failed to create voice entry record');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-entries'] });
      toast({
        title: "Success",
        description: "Voice recording uploaded and processing started",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload voice recording",
        variant: "destructive",
      });
      console.error('Upload voice entry error:', error);
    },
  });

  const deleteVoiceEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('voice_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-entries'] });
      toast({
        title: "Success",
        description: "Voice entry deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete voice entry",
        variant: "destructive",
      });
    },
  });

  return {
    voiceEntries,
    isLoading,
    error,
    uploadVoiceEntry,
    deleteVoiceEntry,
  };
};
