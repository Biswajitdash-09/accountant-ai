-- Ensure RLS policies for documents and document_ai_analysis to fix insert errors

-- Enable RLS on documents
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='documents' AND policyname='Users can select own documents'
  ) THEN
    CREATE POLICY "Users can select own documents" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='documents' AND policyname='Users can insert own documents'
  ) THEN
    CREATE POLICY "Users can insert own documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='documents' AND policyname='Users can update own documents'
  ) THEN
    CREATE POLICY "Users can update own documents" ON public.documents
    FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='documents' AND policyname='Users can delete own documents'
  ) THEN
    CREATE POLICY "Users can delete own documents" ON public.documents
    FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Enable RLS and add policies for document_ai_analysis (used alongside documents)
ALTER TABLE IF EXISTS public.document_ai_analysis ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='document_ai_analysis' AND policyname='Users can select own analyses'
  ) THEN
    CREATE POLICY "Users can select own analyses" ON public.document_ai_analysis
    FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='document_ai_analysis' AND policyname='Users can insert own analyses'
  ) THEN
    CREATE POLICY "Users can insert own analyses" ON public.document_ai_analysis
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='document_ai_analysis' AND policyname='Users can update own analyses'
  ) THEN
    CREATE POLICY "Users can update own analyses" ON public.document_ai_analysis
    FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='document_ai_analysis' AND policyname='Users can delete own analyses'
  ) THEN
    CREATE POLICY "Users can delete own analyses" ON public.document_ai_analysis
    FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
