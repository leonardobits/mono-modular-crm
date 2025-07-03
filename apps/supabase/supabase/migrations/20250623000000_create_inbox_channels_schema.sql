-- Create channels table to define available communication channels
CREATE TABLE public.channels (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    type text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create inboxes table to manage grouped conversations by channel
CREATE TABLE public.inboxes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    channel_id uuid REFERENCES public.channels(id) ON DELETE CASCADE,
    settings jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create junction table for inbox-agent associations
CREATE TABLE public.inbox_agents (
    inbox_id uuid REFERENCES public.inboxes(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role text DEFAULT 'AGENT',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (inbox_id, user_id)
);

-- Insert initial channel types
INSERT INTO public.channels (name, type, description) VALUES
    ('Website', 'website', 'Website chat widget integration'),
    ('Messenger', 'messenger', 'Facebook Messenger integration'),
    ('WhatsApp', 'whatsapp', 'WhatsApp Business API integration'),
    ('SMS', 'sms', 'SMS messaging service'),
    ('E-mail', 'email', 'Email support integration'),
    ('API', 'api', 'Direct API integration for custom channels'),
    ('Telegram', 'telegram', 'Telegram Bot API integration'),
    ('Line', 'line', 'LINE Messaging API integration');

-- Create indexes for better performance
CREATE INDEX idx_inboxes_channel_id ON public.inboxes(channel_id);
CREATE INDEX idx_inboxes_is_active ON public.inboxes(is_active);
CREATE INDEX idx_inbox_agents_user_id ON public.inbox_agents(user_id);
CREATE INDEX idx_inbox_agents_inbox_id ON public.inbox_agents(inbox_id);
CREATE INDEX idx_channels_type ON public.channels(type);
CREATE INDEX idx_channels_is_active ON public.channels(is_active);

-- Enable Row Level Security
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_agents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for channels (readable by all authenticated users)
CREATE POLICY "Channels are viewable by authenticated users" ON public.channels
    FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for inboxes (users can only see inboxes they are assigned to)
CREATE POLICY "Users can view their assigned inboxes" ON public.inboxes
    FOR SELECT USING (
        id IN (
            SELECT inbox_id FROM public.inbox_agents 
            WHERE user_id = auth.uid()
        )
    );

-- Admin users can manage all inboxes
CREATE POLICY "Admins can manage all inboxes" ON public.inboxes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- RLS Policies for inbox_agents (users can only see their own assignments)
CREATE POLICY "Users can view their inbox assignments" ON public.inbox_agents
    FOR SELECT USING (user_id = auth.uid());

-- Admin users can manage all inbox assignments
CREATE POLICY "Admins can manage all inbox assignments" ON public.inbox_agents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER handle_channels_updated_at
    BEFORE UPDATE ON public.channels
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_inboxes_updated_at
    BEFORE UPDATE ON public.inboxes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();