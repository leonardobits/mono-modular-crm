-- Fix RLS policies to allow service role full access
-- This migration adds policies that give the service role complete access to all tables

-- Add service role policies for channels table
CREATE POLICY "Service role has full access to channels" ON public.channels
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Add service role policies for inboxes table
CREATE POLICY "Service role has full access to inboxes" ON public.inboxes
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Add service role policies for inbox_agents table
CREATE POLICY "Service role has full access to inbox_agents" ON public.inbox_agents
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Update the existing admin policies to be more flexible
-- Drop and recreate the admin policy for inboxes to ensure it works correctly
DROP POLICY IF EXISTS "Admins can manage all inboxes" ON public.inboxes;
CREATE POLICY "Admins can manage all inboxes" ON public.inboxes
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Drop and recreate the admin policy for inbox_agents to ensure it works correctly
DROP POLICY IF EXISTS "Admins can manage all inbox assignments" ON public.inbox_agents;
CREATE POLICY "Admins can manage all inbox assignments" ON public.inbox_agents
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );