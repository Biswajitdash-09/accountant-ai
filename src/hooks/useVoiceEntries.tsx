
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
        .from('voice_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as VoiceEntry[];
    },
    enabled: !!user,
  });

  const uploadVoiceEntry = useMutation({
    mutationFn: async ({ audioBlob, fileName }: { audioBlob: Blob; fileName: string }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Starting voice upload for user:', user.id);
      console.log('File size:', audioBlob.size, 'bytes');
      console.log('File type:', audioBlob.type);

      // Upload audio file to Supabase Storage with correct path structure
      const storagePath = `${user.id}/${Date.now()}-${fileName}`;
      console.log('Storage path:', storagePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice')
        .upload(storagePath, audioBlob, {
          contentType: audioBlob.type || 'audio/webm',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('Storage upload successful:', uploadData);

      // Create voice entry record
      const { data: voiceEntry, error: insertError } = await supabase
        .from('voice_entries')
        .insert([{
          user_id: user.id,
          storage_path: uploadData.path,
          status: 'uploaded'
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }

      console.log('Voice entry created:', voiceEntry);

      // Trigger processing Edge Function
      const { error: processError } = await supabase.functions.invoke('process-voice', {
        body: { entry_id: voiceEntry.id }
      });

      if (processError) {
        console.warn('Processing trigger failed:', processError);
      }

      return voiceEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-entries'] });
      toast({
        title: "Success",
        description: "Voice recording uploaded and processing started",
      });
    },
    onError: (error) => {
      console.error('Upload voice entry error:', error);
      toast({
        title: "Error", 
        description: `Failed to upload voice recording: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteVoiceEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
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
