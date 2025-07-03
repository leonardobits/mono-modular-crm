'use client';

import { useState, useEffect, useRef } from 'react';
import { useConversationsApi, type Conversation, type Message } from '@/hooks/useConversationsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  User, 
  Bot, 
  Settings, 
  Phone, 
  Mail, 
  MessageCircle,
  UserCheck,
  Clock,
  CheckCircle,
  FileText,
  Image,
  Paperclip,
  Mic
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConversationViewProps {
  inboxId: string;
  conversation: Conversation | null;
  onConversationUpdate?: (conversation: Conversation) => void;
}

export default function ConversationView({
  inboxId,
  conversation,
  onConversationUpdate,
}: ConversationViewProps) {
  const { 
    getMessages, 
    sendMessage, 
    updateConversationStatus, 
    assignConversation,
    loading, 
    error 
  } = useConversationsApi();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isPrivateNote, setIsPrivateNote] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!conversation) return;
    
    try {
      const data = await getMessages(inboxId, conversation.id, {
        include_private: true,
        limit: 100,
      });
      setMessages(data);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    }
  };

  useEffect(() => {
    if (conversation) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [conversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!conversation || !newMessage.trim()) return;

    try {
      const message = await sendMessage(inboxId, conversation.id, {
        content: newMessage,
        message_type: 'text',
        is_private: isPrivateNote,
      });

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setIsPrivateNote(false);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!conversation) return;

    try {
      const updatedConversation = await updateConversationStatus(
        inboxId, 
        conversation.id, 
        status as any
      );
      onConversationUpdate?.(updatedConversation);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const getMessageIcon = (message: Message) => {
    if (message.sender_type === 'system') {
      return <Settings className="w-4 h-4 text-gray-500" />;
    }
    
    if (message.sender_type === 'contact') {
      return <User className="w-4 h-4 text-blue-500" />;
    }
    
    return <Bot className="w-4 h-4 text-green-500" />;
  };

  const getMessageTypeIcon = (messageType: string) => {
    switch (messageType) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'file':
        return <Paperclip className="w-4 h-4" />;
      case 'audio':
        return <Mic className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'snoozed':
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  if (!conversation) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
            <p>Escolha uma conversa da lista para visualizar as mensagens</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(conversation.status)}
              {conversation.contact.name || conversation.contact.phone || 'Cliente'}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              {conversation.contact.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {conversation.contact.phone}
                </div>
              )}
              {conversation.contact.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {conversation.contact.email}
                </div>
              )}
              <div className="flex items-center gap-1">
                <span>{conversation.contact.platform}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {conversation.assigned_agent && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <UserCheck className="w-4 h-4" />
                {conversation.assigned_agent.full_name}
              </div>
            )}
            
            <Select value={conversation.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Aberta</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="resolved">Resolvida</SelectItem>
                <SelectItem value="snoozed">Adiada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[calc(100vh-20rem)]">
          <div className="p-4 space-y-4">
            {loading ? (
              <div className="text-center text-gray-500">
                Carregando mensagens...
              </div>
            ) : error ? (
              <div className="text-center text-red-500">
                Erro: {error}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma mensagem ainda</p>
                <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isFromContact = message.sender_type === 'contact';
                const isSystem = message.sender_type === 'system';
                const isPrivate = message.is_private;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isFromContact ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isSystem
                          ? 'bg-gray-100 text-gray-700 mx-auto text-center text-sm'
                          : isPrivate
                          ? 'bg-amber-50 border border-amber-200 text-amber-800'
                          : isFromContact
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      {!isSystem && (
                        <div className="flex items-center gap-2 mb-1">
                          {getMessageIcon(message)}
                          <span className="text-xs font-medium">
                            {isPrivate && '🔒 '}
                            {message.sender?.full_name || 
                             message.sender?.name || 
                             (isFromContact ? conversation.contact.name || 'Cliente' : 'Agente')}
                          </span>
                          {message.message_type !== 'text' && (
                            <div className="flex items-center gap-1">
                              {getMessageTypeIcon(message.message_type)}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className={isSystem ? 'font-medium' : ''}>
                        {message.content}
                      </div>
                      
                      <div className={`text-xs mt-1 ${
                        isSystem 
                          ? 'text-gray-500' 
                          : isPrivate
                          ? 'text-amber-600'
                          : isFromContact 
                          ? 'text-gray-500' 
                          : 'text-blue-100'
                      }`}>
                        {format(new Date(message.created_at), 'HH:mm', { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2 mb-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPrivateNote}
              onChange={(e) => setIsPrivateNote(e.target.checked)}
              className="rounded"
            />
            <FileText className="w-4 h-4" />
            Nota privada
          </label>
        </div>
        
        <div className="flex gap-2">
          <Textarea
            placeholder={isPrivateNote ? 'Escreva uma nota privada...' : 'Digite sua mensagem...'}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 min-h-[60px] resize-none"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || loading}
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}