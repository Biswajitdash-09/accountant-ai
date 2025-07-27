
-- Create the voice_entries table
CREATE TABLE public.voice_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  storage_path text NOT NULL,
  status text CHECK (status IN ('uploaded', 'processing', 'done', 'failed')) DEFAULT 'uploaded',
  transcript text,
  parsed jsonb,
  error_message text,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Enable RLS
ALTER TABLE public.voice_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for voice_entries
CREATE POLICY "Users can view their own voice entries" 
  ON public.voice_entries 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice entries" 
  ON public.voice_entries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice entries" 
  ON public.voice_entries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice entries" 
  ON public.voice_entries 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create the voice storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('voice', 'voice', false);

-- Create storage policies for voice bucket
CREATE POLICY "Users can upload their own voice files" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'voice' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own voice files" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'voice' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own voice files" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'voice' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own voice files" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'voice' AND auth.uid()::text = (storage.foldername(name))[1]);
