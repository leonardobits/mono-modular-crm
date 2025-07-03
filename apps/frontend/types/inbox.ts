export interface Channel {
  id: string;
  name: string;
  type: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inbox {
  id: string;
  name: string;
  channel_id: string;
  settings: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  channel?: Channel;
}

export interface CreateInboxData {
  name: string;
  channel_id: string;
  settings?: Record<string, any>;
}

export interface UpdateInboxData {
  name?: string;
  channel_id?: string;
  settings?: Record<string, any>;
  is_active?: boolean;
}

export interface InboxAgent {
  inbox_id: string;
  user_id: string;
  role: string;
  created_at: string;
} 