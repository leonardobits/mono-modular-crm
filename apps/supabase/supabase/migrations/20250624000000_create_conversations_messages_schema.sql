-- Create contacts table to store customer/contact information
CREATE TABLE public.contacts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text,
    email text,
    phone text,
    external_id text, -- ID from external platform (WhatsApp, Messenger, etc.)
    platform text NOT NULL, -- whatsapp, messenger, email, etc.
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(external_id, platform)
);

-- Create conversations table to manage conversation threads
CREATE TABLE public.conversations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    inbox_id uuid REFERENCES public.inboxes(id) ON DELETE CASCADE NOT NULL,
    contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
    status text DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'pending', 'snoozed')),
    assigned_agent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    last_message_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create messages table to store individual messages
CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id uuid, -- Can be user_id (agent) or contact_id (customer)
    sender_type text NOT NULL CHECK (sender_type IN ('agent', 'contact', 'system')),
    content text NOT NULL,
    message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'audio', 'video', 'location', 'system')),
    metadata jsonb DEFAULT '{}'::jsonb, -- Store additional data like file URLs, etc.
    external_id text, -- ID from external platform if applicable
    is_private boolean DEFAULT false, -- Internal notes visible only to agents
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_contacts_external_id_platform ON public.contacts(external_id, platform);
CREATE INDEX idx_contacts_phone ON public.contacts(phone);
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_platform ON public.contacts(platform);

CREATE INDEX idx_conversations_inbox_id ON public.conversations(inbox_id);
CREATE INDEX idx_conversations_contact_id ON public.conversations(contact_id);
CREATE INDEX idx_conversations_assigned_agent_id ON public.conversations(assigned_agent_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
CREATE INDEX idx_conversations_created_at ON public.conversations(created_at DESC);

CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_type ON public.messages(sender_type);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_external_id ON public.messages(external_id);
CREATE INDEX idx_messages_is_private ON public.messages(is_private);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contacts
-- Users can only see contacts from conversations in inboxes they are assigned to
CREATE POLICY "Users can view contacts from their assigned inboxes" ON public.contacts
    FOR SELECT USING (
        id IN (
            SELECT DISTINCT c.contact_id 
            FROM public.conversations c
            INNER JOIN public.inbox_agents ia ON c.inbox_id = ia.inbox_id
            WHERE ia.user_id = auth.uid()
        )
    );

-- Admin users can manage all contacts
CREATE POLICY "Admins can manage all contacts" ON public.contacts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- RLS Policies for conversations
-- Users can only see conversations from inboxes they are assigned to
CREATE POLICY "Users can view conversations from their assigned inboxes" ON public.conversations
    FOR SELECT USING (
        inbox_id IN (
            SELECT inbox_id FROM public.inbox_agents 
            WHERE user_id = auth.uid()
        )
    );

-- Users can update conversations they have access to (assign themselves, change status)
CREATE POLICY "Users can update conversations from their assigned inboxes" ON public.conversations
    FOR UPDATE USING (
        inbox_id IN (
            SELECT inbox_id FROM public.inbox_agents 
            WHERE user_id = auth.uid()
        )
    );

-- System can create conversations (for webhook processing)
CREATE POLICY "System can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (true);

-- Admin users can manage all conversations
CREATE POLICY "Admins can manage all conversations" ON public.conversations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- RLS Policies for messages
-- Users can only see messages from conversations in inboxes they are assigned to
CREATE POLICY "Users can view messages from their assigned inboxes" ON public.messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT c.id 
            FROM public.conversations c
            INNER JOIN public.inbox_agents ia ON c.inbox_id = ia.inbox_id
            WHERE ia.user_id = auth.uid()
        )
    );

-- Users can create messages in conversations they have access to
CREATE POLICY "Users can create messages in their assigned conversations" ON public.messages
    FOR INSERT WITH CHECK (
        conversation_id IN (
            SELECT c.id 
            FROM public.conversations c
            INNER JOIN public.inbox_agents ia ON c.inbox_id = ia.inbox_id
            WHERE ia.user_id = auth.uid()
        )
    );

-- System can create messages (for webhook processing)
CREATE POLICY "System can create messages" ON public.messages
    FOR INSERT WITH CHECK (true);

-- Admin users can manage all messages
CREATE POLICY "Admins can manage all messages" ON public.messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Create function to update conversation's last_message_at when a new message is added
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET last_message_at = NEW.created_at,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update conversation's last_message_at
CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();

-- Create triggers for updated_at timestamps
CREATE TRIGGER handle_contacts_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();