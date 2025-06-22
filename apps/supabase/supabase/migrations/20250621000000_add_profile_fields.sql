-- Add new fields to the profiles table for complete user registration
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'USER',
ADD COLUMN IF NOT EXISTS tipo_pessoa text,
ADD COLUMN IF NOT EXISTS data_nascimento date,
ADD COLUMN IF NOT EXISTS cpf_cnpj text,
ADD COLUMN IF NOT EXISTS cep text,
ADD COLUMN IF NOT EXISTS cidade text,
ADD COLUMN IF NOT EXISTS estado text,
ADD COLUMN IF NOT EXISTS endereco text,
ADD COLUMN IF NOT EXISTS numero text,
ADD COLUMN IF NOT EXISTS complemento text;

-- Add comments to the new columns
COMMENT ON COLUMN public.profiles.full_name IS 'Full name of the user';
COMMENT ON COLUMN public.profiles.email IS 'Email address of the user';
COMMENT ON COLUMN public.profiles.role IS 'User role (ADMIN, MANAGER, AGENT, USER)';
COMMENT ON COLUMN public.profiles.tipo_pessoa IS 'Type of person: F (Physical) or J (Legal)';
COMMENT ON COLUMN public.profiles.data_nascimento IS 'Date of birth';
COMMENT ON COLUMN public.profiles.cpf_cnpj IS 'CPF or CNPJ document number';
COMMENT ON COLUMN public.profiles.cep IS 'Postal code';
COMMENT ON COLUMN public.profiles.cidade IS 'City';
COMMENT ON COLUMN public.profiles.estado IS 'State/Province';
COMMENT ON COLUMN public.profiles.endereco IS 'Street address';
COMMENT ON COLUMN public.profiles.numero IS 'Address number';
COMMENT ON COLUMN public.profiles.complemento IS 'Address complement';

-- Create an index on email for faster queries
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- Create an index on role for faster role-based queries
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);