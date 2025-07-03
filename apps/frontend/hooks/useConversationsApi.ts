import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthApi } from '@/hooks/useAuthApi';

export interface Contact {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  platform: string;
}

export interface AssignedAgent {
  id: string;
  full_name: string;
  email: string;
}

export interface LastMessage {
  id: string;
  content: string;
  sender_type: string;
  message_type: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  inbox_id: string;
  contact_id: string;
  status: 'open' | 'resolved' | 'pending' | 'snoozed';
  assigned_agent_id?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  last_message_at: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  contact: Contact;
  assigned_agent?: AssignedAgent;
  unread_count?: number;
  last_message?: LastMessage;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id?: string;
  sender_type: 'agent' | 'contact' | 'system';
  content: string;
  message_type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'system';
  metadata: Record<string, any>;
  external_id?: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    name?: string;
    full_name?: string;
    email?: string;
  };
}

export interface ConversationStats {
  total: number;
  open: number;
  resolved: number;
  pending: number;
  snoozed: number;
  unassigned: number;
}

export const useConversationsApi = () => {
  const { user } = useAuth();
  const { getAuthToken } = useAuthApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async (url: string, options: RequestInit = {}) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    const token = getAuthToken();
    
    console.log('API Call:', `${API_BASE_URL}${url}`, 'Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }, [getAuthToken]);

  const getConversations = useCallback(async (
    inboxId: string,
    options: {
      status?: 'open' | 'resolved' | 'pending' | 'snoozed';
      assigned_agent_id?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Conversation[]> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.status) params.append('status', options.status);
      if (options.assigned_agent_id) params.append('assigned_agent_id', options.assigned_agent_id);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());

      const queryString = params.toString();
      const url = `/api/v1/inboxes/${inboxId}/conversations${queryString ? `?${queryString}` : ''}`;
      
      return await apiCall(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar conversas';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const getConversationStats = useCallback(async (inboxId: string): Promise<ConversationStats> => {
    setLoading(true);
    setError(null);

    try {
      return await apiCall(`/api/v1/inboxes/${inboxId}/conversations/stats`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar estatísticas';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const getConversationById = useCallback(async (
    inboxId: string,
    conversationId: string
  ): Promise<Conversation> => {
    setLoading(true);
    setError(null);

    try {
      return await apiCall(`/api/v1/inboxes/${inboxId}/conversations/${conversationId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar conversa';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const getMessages = useCallback(async (
    inboxId: string,
    conversationId: string,
    options: {
      limit?: number;
      offset?: number;
      include_private?: boolean;
    } = {}
  ): Promise<Message[]> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.include_private) params.append('include_private', 'true');

      const queryString = params.toString();
      const url = `/api/v1/inboxes/${inboxId}/conversations/${conversationId}/messages${queryString ? `?${queryString}` : ''}`;
      
      return await apiCall(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar mensagens';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const updateConversationStatus = useCallback(async (
    inboxId: string,
    conversationId: string,
    status: 'open' | 'resolved' | 'pending' | 'snoozed'
  ): Promise<Conversation> => {
    setLoading(true);
    setError(null);

    try {
      return await apiCall(`/api/v1/inboxes/${inboxId}/conversations/${conversationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const assignConversation = useCallback(async (
    inboxId: string,
    conversationId: string,
    agentId: string
  ): Promise<Conversation> => {
    setLoading(true);
    setError(null);

    try {
      return await apiCall(`/api/v1/inboxes/${inboxId}/conversations/${conversationId}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ agent_id: agentId }),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atribuir conversa';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const sendMessage = useCallback(async (
    inboxId: string,
    conversationId: string,
    message: {
      content: string;
      message_type?: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location';
      metadata?: Record<string, any>;
      is_private?: boolean;
    }
  ): Promise<Message> => {
    setLoading(true);
    setError(null);

    try {
      return await apiCall(`/api/v1/inboxes/${inboxId}/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify(message),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  return {
    loading,
    error,
    getConversations,
    getConversationStats,
    getConversationById,
    getMessages,
    updateConversationStatus,
    assignConversation,
    sendMessage,
  };
};