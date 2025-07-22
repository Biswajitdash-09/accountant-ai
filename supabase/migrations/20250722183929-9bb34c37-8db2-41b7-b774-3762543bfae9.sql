
-- Create a profiles table to store user information
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'guest')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up Row Level Security for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to view their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Create a policy that allows users to update their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create accounts table
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  balance DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up Row Level Security for the accounts table
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to view their own accounts
CREATE POLICY "Users can view their own accounts" 
  ON public.accounts 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create a policy that allows users to create their own accounts
CREATE POLICY "Users can create their own accounts" 
  ON public.accounts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to update their own accounts
CREATE POLICY "Users can update their own accounts" 
  ON public.accounts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create a policy that allows users to delete their own accounts
CREATE POLICY "Users can delete their own accounts" 
  ON public.accounts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  account_id UUID REFERENCES public.accounts,
  amount DECIMAL NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT,
  type TEXT CHECK (type IN ('income', 'expense')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up Row Level Security for the transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to view their own transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create a policy that allows users to create their own transactions
CREATE POLICY "Users can create their own transactions" 
  ON public.transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to update their own transactions
CREATE POLICY "Users can update their own transactions" 
  ON public.transactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create a policy that allows users to delete their own transactions
CREATE POLICY "Users can delete their own transactions" 
  ON public.transactions 
  FOR DELETE 
  USING (auth.uid() = user_id);
