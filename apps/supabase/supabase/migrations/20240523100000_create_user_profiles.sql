-- Create a custom type for user status
CREATE TYPE public.user_status AS ENUM ('ACTIVE', 'INACTIVE');

-- Create the profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  first_name text NULL,
  last_name text NULL,
  avatar_url text NULL,
  status public.user_status NOT NULL DEFAULT 'ACTIVE'::public.user_status,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add comments to the table and columns
COMMENT ON TABLE public.profiles IS 'Profile data for each user.';
COMMENT ON COLUMN public.profiles.id IS 'References the user in auth.users.';

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- 1. Allow public access to profiles, but only for reading.
CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT
USING (true);

-- 2. Allow users to insert their own profile.
CREATE POLICY "Users can insert their own profile."
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 3. Allow users to update their own profile.
CREATE POLICY "Users can update their own profile."
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at timestamp before any update
CREATE TRIGGER on_profiles_updated
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at(); 