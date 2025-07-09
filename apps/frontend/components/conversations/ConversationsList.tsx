'use client';

import { useState, useEffect } from 'react';
import { useConversationsApi, type Conversation } from '@/hooks/useConversationsApi';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MessageSquareText, Check, CheckCheck, ChevronDown, Users, UserCheck } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatTimestamp = (date: Date) => {
if (isToday(date)) {
return format(date, 'HH:mm');
}
if (isYesterday(date)) {
return 'Ontem';
}
return format(date, 'dd/MM/yyyy');
};

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
const { getConversations, loading, error } = useConversationsApi();
const [conversations, setConversations] = useState<Conversation[]>([]);
const [searchTerm, setSearchTerm] = useState('');

useEffect(() => {
const loadConversations = async () => {
try {
const data = await getConversations(inboxId, {});
setConversations(data);
} catch (err) {
console.error('Erro ao carregar conversas:', err);
}
};
if (inboxId) {
loadConversations();
}
}, [inboxId]);

const getReadStatusIcon = (lastMessage: Conversation['last_message']) => {
if (!lastMessage || lastMessage.sender_type === 'contact') {
return null;
}
return <CheckCheck className="w-4 h-4 text-blue-500" />;
};

const filteredConversations = conversations.filter(conversation =>
searchTerm === '' ||
conversation.contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
conversation.last_message?.content?.toLowerCase().includes(searchTerm.toLowerCase())
);

return (
<div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r dark:border-gray-700">
<header className="p-4 border-b dark:border-gray-700">
<h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
<MessageSquareText className="w-7 h-7" />
Conversas
</h1>
<div className="relative">
<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
<Input
placeholder="Pesquisar ou começar uma nova conversa"
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
className="pl-9 rounded-full bg-gray-100 dark:bg-gray-800 focus-visible:ring-offset-0 focus-visible:ring-1"
/>
</div>
</header>

<ScrollArea className="flex-1">
{loading && <div className="p-4 text-center text-gray-500">Carregando...</div>}
{error && <div className="p-4 text-center text-red-500">Erro ao carregar conversas.</div>}

{!loading && !error && filteredConversations.length === 0 && (
<div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
<MessageSquareText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
<p className="font-semibold">Nenhuma conversa encontrada</p>
<p className="text-sm">
{searchTerm 
? 'Tente uma busca diferente.' 
: 'As novas conversas aparecerão aqui.'
}
</p>
</div>
)}

<div className="divide-y divide-gray-200 dark:divide-gray-700">
{filteredConversations.map((conversation) => (
<button
key={conversation.id}
onClick={() => onConversationSelect(conversation)}
className={`w-full text-left transition-colors ${
selectedConversationId === conversation.id 
? 'bg-gray-100 dark:bg-gray-800' 
: 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
}`}
>
<div className="p-3 flex items-start space-x-3">
<Avatar className="w-12 h-12">
<AvatarImage src={conversation.contact.avatar_url || 'https://avatars.githubusercontent.com/u/153465524?v=4'} />
<AvatarFallback>{conversation.contact.name?.substring(0, 2).toUpperCase() || 'C'}</AvatarFallback>
</Avatar>

<div className="flex-1 min-w-0">
<div className="flex justify-between items-center">
<p className="font-semibold truncate text-gray-900 dark:text-white">
{conversation.contact.name || conversation.contact.phone || 'Contato Desconhecido'}
</p>
<span className={`text-xs ${conversation.unread_count > 0 ? 'text-green-500 dark:text-green-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
{formatTimestamp(new Date(conversation.last_message_at))}
</span>
</div>

<div className="flex justify-between items-start mt-1">
<div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 truncate pr-2">
{getReadStatusIcon(conversation.last_message)}
<p className="truncate">
{conversation.last_message?.content || 'Nenhuma mensagem ainda.'}
</p>
</div>

<div className='flex flex-col items-end'>
{conversation.unread_count > 0 && (
<Badge className="bg-green-500 hover:bg-green-600 dark:bg-green-400 dark:text-gray-900 text-white rounded-full w-6 h-6 flex items-center justify-center p-0">
{conversation.unread_count}
</Badge>
)}

<DropdownMenu>
<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
<ChevronDown className="w-5 h-5 text-gray-400 hover:text-gray-700 dark:hover:text-white mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
</DropdownMenuTrigger>
<DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
<DropdownMenuItem>Marcar como lida</DropdownMenuItem>
<DropdownMenuItem>Arquivar conversa</DropdownMenuItem>
<DropdownMenuItem>Silenciar</DropdownMenuItem>
<DropdownMenuItem className="text-red-500">Excluir conversa</DropdownMenuItem>
</DropdownMenuContent>
</DropdownMenu>
</div>
</div>
</div>
</div>
</button>
))}
</div>
</ScrollArea>
</div>
);
}