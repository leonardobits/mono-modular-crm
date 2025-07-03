"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Inbox, MessageSquare } from "lucide-react";
import ConversationsList from './ConversationsList';
import ConversationView from './ConversationView';
import { type Conversation } from '@/hooks/useConversationsApi';

interface ConversationsLayoutProps {
  inboxId: string;
  children?: React.ReactNode;
}

const ConversationsLayout: React.FC<ConversationsLayoutProps> = ({ 
  inboxId,
  children 
}) => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleConversationUpdate = (updatedConversation: Conversation) => {
    setSelectedConversation(updatedConversation);
  };

  return (
    <div className="grid grid-cols-10 gap-4 h-[calc(100vh-12rem)]">
      {/* Lista de Conversas */}
      <div className="col-span-4">
        <ConversationsList
          inboxId={inboxId}
          selectedConversationId={selectedConversation?.id}
          onConversationSelect={handleConversationSelect}
        />
      </div>

      {/* Área da Conversa Ativa */}
      <div className="col-span-6">
        <ConversationView
          inboxId={inboxId}
          conversation={selectedConversation}
          onConversationUpdate={handleConversationUpdate}
        />
      </div>
    </div>
  );
};

export default ConversationsLayout; 