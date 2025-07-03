import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

export interface RealtimeSubscription {
  id: string;
  channel: string;
  table: string;
  filter?: string;
  userId: string;
  inboxId?: string;
  callback?: (payload: any) => void;
}

@Injectable()
export class RealtimeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RealtimeService.name);
  private subscriptions = new Map<string, any>();

  constructor(private readonly supabaseService: SupabaseService) {}

  onModuleInit() {
    this.logger.log('Realtime service initialized');
  }

  onModuleDestroy() {
    this.logger.log('Cleaning up realtime subscriptions');
    this.subscriptions.forEach((subscription) => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        this.logger.error('Error unsubscribing from channel:', error);
      }
    });
    this.subscriptions.clear();
  }

  getRealtimeConfig(userId: string, inboxIds: string[] = []) {
    return {
      url: process.env.SUPABASE_URL,
      apikey: process.env.SUPABASE_ANON_KEY,
      userId,
      channels: {
        conversations: {
          table: 'conversations',
          filter: inboxIds.length > 0 ? `inbox_id=in.(${inboxIds.join(',')})` : undefined,
          events: ['INSERT', 'UPDATE', 'DELETE'],
        },
        messages: {
          table: 'messages',
          filter: undefined, // Will be filtered by conversation_id on frontend
          events: ['INSERT', 'UPDATE', 'DELETE'],
        },
        inbox_agents: {
          table: 'inbox_agents',
          filter: `user_id=eq.${userId}`,
          events: ['INSERT', 'DELETE'],
        },
      },
    };
  }

  async getUserAccessibleInboxes(userId: string): Promise<string[]> {
    const supabase = this.supabaseService.getClient();

    try {
      const { data, error } = await supabase
        .from('inbox_agents')
        .select('inbox_id')
        .eq('user_id', userId);

      if (error) {
        this.logger.error('Error fetching user accessible inboxes:', error);
        return [];
      }

      return data?.map(item => item.inbox_id) || [];
    } catch (error) {
      this.logger.error('Unexpected error fetching accessible inboxes:', error);
      return [];
    }
  }

  async subscribeToConversationUpdates(
    inboxId: string,
    userId: string,
    callback?: (payload: any) => void,
  ): Promise<string> {
    const supabase = this.supabaseService.getClient();
    const subscriptionId = `conversations_${inboxId}_${userId}_${Date.now()}`;

    try {
      const channel = supabase
        .channel(subscriptionId)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations',
            filter: `inbox_id=eq.${inboxId}`,
          },
          (payload) => {
            this.logger.debug(`Conversation update for inbox ${inboxId}:`, payload);
            if (callback) {
              callback(payload);
            }
          },
        )
        .subscribe((status) => {
          this.logger.log(`Conversation subscription status for ${subscriptionId}:`, status);
        });

      this.subscriptions.set(subscriptionId, channel);
      return subscriptionId;
    } catch (error) {
      this.logger.error('Error creating conversation subscription:', error);
      throw error;
    }
  }

  async subscribeToMessageUpdates(
    conversationId: string,
    userId: string,
    callback?: (payload: any) => void,
  ): Promise<string> {
    const supabase = this.supabaseService.getClient();
    const subscriptionId = `messages_${conversationId}_${userId}_${Date.now()}`;

    try {
      const channel = supabase
        .channel(subscriptionId)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            this.logger.debug(`Message update for conversation ${conversationId}:`, payload);
            if (callback) {
              callback(payload);
            }
          },
        )
        .subscribe((status) => {
          this.logger.log(`Message subscription status for ${subscriptionId}:`, status);
        });

      this.subscriptions.set(subscriptionId, channel);
      return subscriptionId;
    } catch (error) {
      this.logger.error('Error creating message subscription:', error);
      throw error;
    }
  }

  async subscribeToInboxAgentUpdates(
    userId: string,
    callback?: (payload: any) => void,
  ): Promise<string> {
    const supabase = this.supabaseService.getClient();
    const subscriptionId = `inbox_agents_${userId}_${Date.now()}`;

    try {
      const channel = supabase
        .channel(subscriptionId)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'inbox_agents',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            this.logger.debug(`Inbox agent update for user ${userId}:`, payload);
            if (callback) {
              callback(payload);
            }
          },
        )
        .subscribe((status) => {
          this.logger.log(`Inbox agent subscription status for ${subscriptionId}:`, status);
        });

      this.subscriptions.set(subscriptionId, channel);
      return subscriptionId;
    } catch (error) {
      this.logger.error('Error creating inbox agent subscription:', error);
      throw error;
    }
  }

  async unsubscribe(subscriptionId: string): Promise<boolean> {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (subscription) {
        await subscription.unsubscribe();
        this.subscriptions.delete(subscriptionId);
        this.logger.log(`Unsubscribed from ${subscriptionId}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Error unsubscribing from ${subscriptionId}:`, error);
      return false;
    }
  }

  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  async broadcastToInbox(inboxId: string, event: string, payload: any): Promise<boolean> {
    const supabase = this.supabaseService.getClient();

    try {
      const channel = supabase.channel(`inbox_${inboxId}`);
      await channel.send({
        type: 'broadcast',
        event,
        payload,
      });
      
      this.logger.debug(`Broadcasted ${event} to inbox ${inboxId}`, payload);
      return true;
    } catch (error) {
      this.logger.error(`Error broadcasting to inbox ${inboxId}:`, error);
      return false;
    }
  }

  async broadcastToConversation(conversationId: string, event: string, payload: any): Promise<boolean> {
    const supabase = this.supabaseService.getClient();

    try {
      const channel = supabase.channel(`conversation_${conversationId}`);
      await channel.send({
        type: 'broadcast',
        event,
        payload,
      });
      
      this.logger.debug(`Broadcasted ${event} to conversation ${conversationId}`, payload);
      return true;
    } catch (error) {
      this.logger.error(`Error broadcasting to conversation ${conversationId}:`, error);
      return false;
    }
  }

  async notifyAgents(inboxId: string, notification: {
    type: 'new_message' | 'conversation_assigned' | 'conversation_resolved';
    title: string;
    message: string;
    data?: any;
  }): Promise<boolean> {
    try {
      await this.broadcastToInbox(inboxId, 'notification', notification);
      return true;
    } catch (error) {
      this.logger.error(`Error notifying agents for inbox ${inboxId}:`, error);
      return false;
    }
  }
}