'use client';

import { useState, useEffect } from 'react';
import { useConversationsApi, type Conversation } from '@/hooks/useConversationsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MessageCircle, Clock, CheckCircle, UserCheck, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConversationsListProps {
  inboxId: string;
  selectedConversationId?: string;
  onConversationSelect: (conversation: Conversation) => void;
}

export default function ConversationsList({
  inboxId,
  selectedConversationId,
  onConversationSelect,
}: ConversationsListProps) {
  const { getConversations, getConversationStats, loading, error } = useConversationsApi();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    pending: 0,
    snoozed: 0,
    unassigned: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all');

  const loadConversations = async () => {
    try {
      const filters: any = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      if (assignmentFilter === 'unassigned') {
        filters.assigned_agent_id = 'unassigned';
      } else if (assignmentFilter === 'mine') {
        // TODO: Add current user ID when available
      }

      const data = await getConversations(inboxId, filters);
      setConversations(data);
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getConversationStats(inboxId);
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  useEffect(() => {
    if (inboxId) {
      loadConversations();
      loadStats();
    }
  }, [inboxId, statusFilter, assignmentFilter]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-blue-100 text-blue-800';
      case 'snoozed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredConversations = conversations.filter(conversation =>
    searchTerm === '' ||
    conversation.contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.contact.phone?.includes(searchTerm) ||
    conversation.last_message?.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Conversas
        </CardTitle>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-semibold text-green-600">{stats.open}</div>
            <div className="text-gray-500">Abertas</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-yellow-600">{stats.pending}</div>
            <div className="text-gray-500">Pendentes</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-600">{stats.unassigned}</div>
            <div className="text-gray-500">Não atribuídas</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="open">Abertas</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="resolved">Resolvidas</SelectItem>
              <SelectItem value="snoozed">Adiadas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Atribuição" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="mine">Minhas</SelectItem>
              <SelectItem value="unassigned">Não atribuídas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-20rem)]">
          {loading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Carregando conversas...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500 dark:text-red-400">
              Erro: {error}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p>Nenhuma conversa encontrada</p>
              <p className="text-sm">
                {searchTerm ? 'Tente ajustar os filtros de busca' : 'As conversas aparecerão aqui quando chegarem mensagens'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onConversationSelect(conversation)}
                  className={`w-full p-3 text-left border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    selectedConversationId === conversation.id ? 'bg-blue-50 dark:bg-blue-950/50 border-l-4 border-l-blue-500 dark:border-l-blue-400' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(conversation.status)}
                        <span className="font-medium text-sm truncate">
                          {conversation.contact.name || conversation.contact.phone || 'Cliente'}
                        </span>
                        {conversation.unread_count && conversation.unread_count > 0 && (
                          <Badge variant="destructive" className="text-xs px-1 py-0 min-w-0">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                      
                      {conversation.last_message && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {conversation.last_message.sender_type === 'contact' ? '' : 'Você: '}
                          {conversation.last_message.content}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={`text-xs ${getStatusColor(conversation.status)}`}>
                            {conversation.status === 'open' && 'Aberta'}
                            {conversation.status === 'pending' && 'Pendente'}
                            {conversation.status === 'resolved' && 'Resolvida'}
                            {conversation.status === 'snoozed' && 'Adiada'}
                          </Badge>
                          
                          {conversation.assigned_agent ? (
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <UserCheck className="w-3 h-3" />
                              {conversation.assigned_agent.full_name.split(' ')[0]}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                              <Users className="w-3 h-3" />
                              Não atribuída
                            </div>
                          )}
                        </div>
                        
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {formatDistanceToNow(new Date(conversation.last_message_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}