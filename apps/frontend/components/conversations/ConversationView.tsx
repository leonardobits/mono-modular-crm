'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  Mic,
  MicOff,
  X,
  Plus,
  Upload
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConversationViewProps {
  inboxId: string;
  conversation: Conversation | null;
  onConversationUpdate?: (conversation: Conversation) => void;
  isMobile?: boolean;
}

export default function ConversationView({
  inboxId,
  conversation,
  onConversationUpdate,
  isMobile = false,
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setAudioBlob(null);
      setRecordingTime(0);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const sendAudioMessage = async () => {
    if (!conversation || !audioBlob) return;

    try {
      // TODO: Implement audio upload logic
      console.log('Sending audio message...', audioBlob);
      
      // Reset audio state
      setAudioBlob(null);
      setRecordingTime(0);
    } catch (err) {
      console.error('Erro ao enviar áudio:', err);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // TODO: Implement file upload logic
    console.log('Uploading files:', files);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  }, []);

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

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

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
    <Card className={`h-full flex flex-col ${isMobile ? 'border-0 shadow-none' : ''}`}>
      {/* Header - Only show on desktop or adjust for mobile */}
      {!isMobile && (
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
      )}
      
      {/* Mobile Header Info */}
      {isMobile && (
        <div className="p-3 border-b bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              {conversation.contact.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {conversation.contact.phone}
                </div>
              )}
              {conversation.contact.platform && (
                <div className="flex items-center gap-1">
                  <span>{conversation.contact.platform}</span>
                </div>
              )}
            </div>
            
            <Select value={conversation.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-28 h-8">
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
      )}

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className={isMobile ? "h-[calc(100vh-16rem)]" : "h-[calc(100vh-20rem)]"}>
          <div className="p-4 space-y-4">
            {loading ? (
              <div className="text-center text-gray-500 dark:text-gray-400">
                Carregando mensagens...
              </div>
            ) : error ? (
              <div className="text-center text-red-500 dark:text-red-400">
                Erro: {error}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
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
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 mx-auto text-center text-sm'
                          : isPrivate
                          ? 'bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                          : isFromContact
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          : 'bg-blue-500 dark:bg-blue-600 text-white'
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
                          ? 'text-gray-500 dark:text-gray-400' 
                          : isPrivate
                          ? 'text-amber-600 dark:text-amber-400'
                          : isFromContact 
                          ? 'text-gray-500 dark:text-gray-400' 
                          : 'text-blue-100 dark:text-blue-200'
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
      <div 
        className={`border-t ${isMobile ? 'p-3' : 'p-4'} ${isDragOver ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag & Drop Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/80 bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-2 text-blue-500 dark:text-blue-400" />
              <p className="text-blue-700 dark:text-blue-300 font-medium">Solte aqui para anexar</p>
            </div>
          </div>
        )}

        {/* Recording Interface */}
        {isRecording && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full animate-pulse"></div>
                  <Mic className="w-5 h-5 text-red-500 dark:text-red-400" />
                  <span className="text-red-700 dark:text-red-300 font-medium">Gravando</span>
                </div>
                <div className="text-red-600 dark:text-red-400 font-mono">
                  {formatRecordingTime(recordingTime)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={cancelRecording}
                  variant="outline"
                  size="sm"
                  className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/50"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  onClick={stopRecording}
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Audio Preview */}
        {audioBlob && !isRecording && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300 font-medium">Áudio gravado</span>
                <span className="text-green-600 dark:text-green-400 text-sm">
                  {formatRecordingTime(recordingTime)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setAudioBlob(null)}
                  variant="outline"
                  size="sm"
                  className="text-gray-600 dark:text-gray-400"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  onClick={sendAudioMessage}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Normal Message Input */}
        {!isRecording && !audioBlob && (
          <>
            {/* Private Note Toggle */}
            <div className={`flex items-center gap-2 ${isMobile ? 'mb-2' : 'mb-3'}`}>
              <label className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>
                <input
                  type="checkbox"
                  checked={isPrivateNote}
                  onChange={(e) => setIsPrivateNote(e.target.checked)}
                  className="rounded"
                />
                <FileText className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                Nota privada
              </label>
            </div>
            
            {/* Input Area */}
            <div className="flex gap-2 items-end">
              {/* Attach Button - Only show when message is empty */}
              {!newMessage.trim() && (
                <div className="relative">
                  <Button
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    variant="outline"
                    size={isMobile ? "sm" : "default"}
                    className="p-2"
                  >
                    <Plus className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  </Button>
                  
                  {/* Attach Menu */}
                  {showAttachMenu && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg p-2 min-w-40">
                      <Button
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowAttachMenu(false);
                        }}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Paperclip className="w-4 h-4 mr-2" />
                        Arquivo
                      </Button>
                      <Button
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowAttachMenu(false);
                        }}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Image className="w-4 h-4 mr-2" />
                        Imagem
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Message Input */}
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
                className={`flex-1 resize-none ${isMobile ? 'min-h-[50px] text-sm' : 'min-h-[60px]'}`}
                onFocus={() => setShowAttachMenu(false)}
              />

              {/* Action Button - Changes based on content */}
              {newMessage.trim() ? (
                <Button
                  onClick={handleSendMessage}
                  disabled={loading}
                  className={`${isMobile ? 'px-3' : ''}`}
                  size={isMobile ? "sm" : "default"}
                >
                  <Send className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                </Button>
              ) : (
                <Button
                  onClick={startRecording}
                  variant="outline"
                  className={`${isMobile ? 'px-3' : ''} text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50`}
                  size={isMobile ? "sm" : "default"}
                >
                  <Mic className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                </Button>
              )}
            </div>
          </>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>
    </Card>
  );
}