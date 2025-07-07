-- Fix RLS policies to allow service role full access to conversations, messages, and contacts
-- This migration adds policies that give the service role complete access to all conversation-related tables

-- Add service role policies for contacts table
CREATE POLICY "Service role has full access to contacts" ON public.contacts
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Add service role policies for conversations table  
CREATE POLICY "Service role has full access to conversations" ON public.conversations
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Add service role policies for messages table
CREATE POLICY "Service role has full access to messages" ON public.messages
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Update existing admin policies to include service role access
-- Drop and recreate the admin policy for contacts
DROP POLICY IF EXISTS "Admins can manage all contacts" ON public.contacts;
CREATE POLICY "Admins can manage all contacts" ON public.contacts
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Drop and recreate the admin policy for conversations
DROP POLICY IF EXISTS "Admins can manage all conversations" ON public.conversations;
CREATE POLICY "Admins can manage all conversations" ON public.conversations
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Drop and recreate the admin policy for messages
DROP POLICY IF EXISTS "Admins can manage all messages" ON public.messages;
CREATE POLICY "Admins can manage all messages" ON public.messages
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'service_role' OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );