-- HMRC Integration Database Schema

-- Create enum for connection status
CREATE TYPE hmrc_connection_status AS ENUM ('active', 'expired', 'disconnected', 'pending');

-- Create enum for sync status
CREATE TYPE hmrc_sync_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');

-- Create enum for HMRC data types
CREATE TYPE hmrc_data_type AS ENUM ('self_assessment', 'vat_return', 'income', 'obligations', 'payment_history');

-- Table: hmrc_connections
CREATE TABLE public.hmrc_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    connection_status hmrc_connection_status NOT NULL DEFAULT 'pending',
    hmrc_account_id TEXT,
    scopes TEXT[] NOT NULL DEFAULT '{}',
    connected_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Table: hmrc_tokens (encrypted storage)
CREATE TABLE public.hmrc_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    connection_id UUID NOT NULL REFERENCES public.hmrc_connections(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_type TEXT NOT NULL DEFAULT 'Bearer',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scopes TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Table: hmrc_data_sync
CREATE TABLE public.hmrc_data_sync (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    connection_id UUID NOT NULL REFERENCES public.hmrc_connections(id) ON DELETE CASCADE,
    data_type hmrc_data_type NOT NULL,
    sync_status hmrc_sync_status NOT NULL DEFAULT 'pending',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    next_sync_at TIMESTAMP WITH TIME ZONE,
    records_synced INTEGER DEFAULT 0,
    error_message TEXT,
    error_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: hmrc_tax_data
CREATE TABLE public.hmrc_tax_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    connection_id UUID NOT NULL REFERENCES public.hmrc_connections(id) ON DELETE CASCADE,
    data_type hmrc_data_type NOT NULL,
    tax_year TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hmrc_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hmrc_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hmrc_data_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hmrc_tax_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hmrc_connections
CREATE POLICY "Users can view their own HMRC connections"
    ON public.hmrc_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own HMRC connections"
    ON public.hmrc_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own HMRC connections"
    ON public.hmrc_connections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own HMRC connections"
    ON public.hmrc_connections FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for hmrc_tokens (strict security)
CREATE POLICY "Service role can manage tokens"
    ON public.hmrc_tokens FOR ALL
    USING (true)
    WITH CHECK (true);

-- RLS Policies for hmrc_data_sync
CREATE POLICY "Users can view their own sync status"
    ON public.hmrc_data_sync FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync records"
    ON public.hmrc_data_sync FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync records"
    ON public.hmrc_data_sync FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for hmrc_tax_data
CREATE POLICY "Users can view their own tax data"
    ON public.hmrc_tax_data FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tax data"
    ON public.hmrc_tax_data FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax data"
    ON public.hmrc_tax_data FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax data"
    ON public.hmrc_tax_data FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_hmrc_connections_user_id ON public.hmrc_connections(user_id);
CREATE INDEX idx_hmrc_connections_status ON public.hmrc_connections(connection_status);
CREATE INDEX idx_hmrc_tokens_user_id ON public.hmrc_tokens(user_id);
CREATE INDEX idx_hmrc_tokens_expires_at ON public.hmrc_tokens(expires_at);
CREATE INDEX idx_hmrc_data_sync_user_id ON public.hmrc_data_sync(user_id);
CREATE INDEX idx_hmrc_data_sync_status ON public.hmrc_data_sync(sync_status);
CREATE INDEX idx_hmrc_tax_data_user_id ON public.hmrc_tax_data(user_id);
CREATE INDEX idx_hmrc_tax_data_type ON public.hmrc_tax_data(data_type);
CREATE INDEX idx_hmrc_tax_data_tax_year ON public.hmrc_tax_data(tax_year);

-- Create trigger for updated_at
CREATE TRIGGER update_hmrc_connections_updated_at
    BEFORE UPDATE ON public.hmrc_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hmrc_tokens_updated_at
    BEFORE UPDATE ON public.hmrc_tokens
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hmrc_data_sync_updated_at
    BEFORE UPDATE ON public.hmrc_data_sync
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hmrc_tax_data_updated_at
    BEFORE UPDATE ON public.hmrc_tax_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();