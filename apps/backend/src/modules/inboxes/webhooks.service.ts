import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { ConversationsService } from './conversations.service';
import { RealtimeService } from './realtime.service';

export interface Contact {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  external_id: string;
  platform: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  inbox_id: string;
  contact_id: string;
  status: string;
  assigned_agent_id?: string;
  priority: string;
  last_message_at: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
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
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly conversationsService: ConversationsService,
    private readonly realtimeService: RealtimeService,
  ) {}

  async processEvolutionWebhook(
    webhookData: any,
    inboxId: string,
  ): Promise<{ contact: Contact; conversation: Conversation; message?: Message }> {
    const supabase = this.supabaseService.getClient();

    try {
      this.logger.log(`Processing Evolution webhook for inbox ${inboxId}`, webhookData);

      const { event, instance, data } = webhookData;

      if (event !== 'messages.upsert') {
        this.logger.log(`Ignoring non-message event: ${event}`);
        return null;
      }

      if (!data || !data.key || !data.message) {
        throw new BadRequestException('Invalid webhook data structure');
      }

      const { key, message, pushName, messageTimestamp } = data;
      const { remoteJid, fromMe, id: messageId } = key;

      if (fromMe) {
        this.logger.log('Ignoring outgoing message');
        return null;
      }

      const phoneNumber = this.extractPhoneNumber(remoteJid);
      const messageContent = this.extractMessageContent(message);
      const messageType = this.getMessageType(message);

      const contact = await this.findOrCreateContact({
        external_id: remoteJid,
        platform: 'whatsapp',
        phone: phoneNumber,
        name: pushName,
        metadata: { instance },
      });

      const conversation = await this.findOrCreateConversation(inboxId, contact.id);

      const messageRecord = await this.createMessage({
        conversation_id: conversation.id,
        sender_type: 'contact',
        content: messageContent,
        message_type: messageType,
        external_id: messageId,
        metadata: {
          timestamp: messageTimestamp,
          instance,
          remoteJid,
          originalMessage: message,
        },
      });

      // Enviar notificação em tempo real para agentes da inbox
      await this.realtimeService.notifyAgents(inboxId, {
        type: 'new_message',
        title: 'Nova mensagem recebida',
        message: `${contact.name || contact.phone || 'Cliente'} enviou uma mensagem`,
        data: {
          conversationId: conversation.id,
          contactId: contact.id,
          messageId: messageRecord.id,
          content: messageContent.substring(0, 100), // Preview da mensagem
        },
      });

      return { contact, conversation, message: messageRecord };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      this.logger.error('Error processing Evolution webhook:', error);
      throw new InternalServerErrorException('Failed to process webhook');
    }
  }

  private async findOrCreateContact(contactData: {
    external_id: string;
    platform: string;
    phone?: string;
    name?: string;
    metadata?: Record<string, any>;
  }): Promise<Contact> {
    const supabase = this.supabaseService.getClient();

    try {
      const { data: existingContact, error: findError } = await supabase
        .from('contacts')
        .select('*')
        .eq('external_id', contactData.external_id)
        .eq('platform', contactData.platform)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        throw new InternalServerErrorException('Error searching for contact');
      }

      if (existingContact) {
        const shouldUpdate = 
          (contactData.name && contactData.name !== existingContact.name) ||
          (contactData.phone && contactData.phone !== existingContact.phone);

        if (shouldUpdate) {
          const { data: updatedContact, error: updateError } = await supabase
            .from('contacts')
            .update({
              ...(contactData.name && { name: contactData.name }),
              ...(contactData.phone && { phone: contactData.phone }),
              ...(contactData.metadata && { 
                metadata: { ...existingContact.metadata, ...contactData.metadata } 
              }),
            })
            .eq('id', existingContact.id)
            .select()
            .single();

          if (updateError) {
            this.logger.error('Error updating contact:', updateError);
            return existingContact;
          }
          return updatedContact;
        }
        return existingContact;
      }

      const { data: newContact, error: createError } = await supabase
        .from('contacts')
        .insert({
          external_id: contactData.external_id,
          platform: contactData.platform,
          phone: contactData.phone,
          name: contactData.name,
          metadata: contactData.metadata || {},
        })
        .select()
        .single();

      if (createError) {
        this.logger.error('Error creating contact:', createError);
        throw new InternalServerErrorException('Failed to create contact');
      }

      return newContact;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Unexpected error in findOrCreateContact:', error);
      throw new InternalServerErrorException('Contact operation failed');
    }
  }

  private async findOrCreateConversation(
    inboxId: string,
    contactId: string,
  ): Promise<Conversation> {
    const supabase = this.supabaseService.getClient();

    try {
      const { data: existingConversation, error: findError } = await supabase
        .from('conversations')
        .select('*')
        .eq('inbox_id', inboxId)
        .eq('contact_id', contactId)
        .in('status', ['open', 'pending', 'snoozed'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        throw new InternalServerErrorException('Error searching for conversation');
      }

      if (existingConversation) {
        return existingConversation;
      }

      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          inbox_id: inboxId,
          contact_id: contactId,
          status: 'open',
          priority: 'normal',
        })
        .select()
        .single();

      if (createError) {
        this.logger.error('Error creating conversation:', createError);
        throw new InternalServerErrorException('Failed to create conversation');
      }

      return newConversation;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Unexpected error in findOrCreateConversation:', error);
      throw new InternalServerErrorException('Conversation operation failed');
    }
  }

  private async createMessage(messageData: {
    conversation_id: string;
    sender_type: 'agent' | 'contact' | 'system';
    content: string;
    message_type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'system';
    external_id?: string;
    metadata?: Record<string, any>;
  }): Promise<Message> {
    const supabase = this.supabaseService.getClient();

    try {
      const { data: newMessage, error: createError } = await supabase
        .from('messages')
        .insert({
          conversation_id: messageData.conversation_id,
          sender_type: messageData.sender_type,
          content: messageData.content,
          message_type: messageData.message_type,
          external_id: messageData.external_id,
          metadata: messageData.metadata || {},
          is_private: false,
        })
        .select()
        .single();

      if (createError) {
        this.logger.error('Error creating message:', createError);
        throw new InternalServerErrorException('Failed to create message');
      }

      return newMessage;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Unexpected error in createMessage:', error);
      throw new InternalServerErrorException('Message creation failed');
    }
  }

  private extractPhoneNumber(remoteJid: string): string {
    return remoteJid.split('@')[0];
  }

  private extractMessageContent(message: any): string {
    if (message.conversation) {
      return message.conversation;
    }
    if (message.extendedTextMessage?.text) {
      return message.extendedTextMessage.text;
    }
    if (message.imageMessage?.caption) {
      return message.imageMessage.caption || '[Imagem]';
    }
    if (message.videoMessage?.caption) {
      return message.videoMessage.caption || '[Vídeo]';
    }
    if (message.audioMessage) {
      return '[Áudio]';
    }
    if (message.documentMessage) {
      return `[Documento: ${message.documentMessage.fileName || 'arquivo'}]`;
    }
    if (message.locationMessage) {
      return '[Localização]';
    }
    return '[Mensagem não suportada]';
  }

  private getMessageType(message: any): 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' {
    if (message.conversation || message.extendedTextMessage) {
      return 'text';
    }
    if (message.imageMessage) {
      return 'image';
    }
    if (message.videoMessage) {
      return 'video';
    }
    if (message.audioMessage) {
      return 'audio';
    }
    if (message.documentMessage) {
      return 'file';
    }
    if (message.locationMessage) {
      return 'location';
    }
    return 'text';
  }

  async validateWebhookToken(inboxId: string, providedToken?: string): Promise<boolean> {
    if (!providedToken) {
      return false;
    }

    const supabase = this.supabaseService.getClient();

    try {
      const { data: inbox, error } = await supabase
        .from('inboxes')
        .select('settings')
        .eq('id', inboxId)
        .single();

      if (error || !inbox) {
        return false;
      }

      const webhookToken = inbox.settings?.webhook_token;
      return webhookToken && webhookToken === providedToken;
    } catch (error) {
      this.logger.error('Error validating webhook token:', error);
      return false;
    }
  }
}