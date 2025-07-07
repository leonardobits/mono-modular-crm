-- Add foreign key relationships to allow PostgREST to properly join conversations with profiles
-- This migration creates the missing relationships that PostgREST expects

-- Add foreign key constraint for conversations.assigned_agent_id to profiles
-- Since both profiles.id and conversations.assigned_agent_id reference auth.users(id),
-- we can safely add this constraint
ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_assigned_agent_profiles_fkey 
FOREIGN KEY (assigned_agent_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add indexes to improve performance
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_agent_profiles 
ON public.conversations(assigned_agent_id) WHERE assigned_agent_id IS NOT NULL;

-- Add comment to explain the relationship
COMMENT ON CONSTRAINT conversations_assigned_agent_profiles_fkey ON public.conversations 
IS 'Links conversations to agent profiles for PostgREST relationship detection';