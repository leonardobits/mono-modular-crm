"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Inbox, MessageSquare, ArrowLeft } from "lucide-react";
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
  const [showConversationView, setShowConversationView] = useState(false);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowConversationView(true);
  };

  const handleConversationUpdate = (updatedConversation: Conversation) => {
    setSelectedConversation(updatedConversation);
  };

  const handleBackToList = () => {
    setShowConversationView(false);
    setSelectedConversation(null);
  };

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-10 gap-4 h-[calc(100vh-12rem)]">
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

      {/* Mobile Layout */}
      <div className="md:hidden h-[calc(100vh-12rem)]">
        {!showConversationView ? (
          /* Lista de Conversas Mobile */
          <ConversationsList
            inboxId={inboxId}
            selectedConversationId={selectedConversation?.id}
            onConversationSelect={handleConversationSelect}
          />
        ) : (
          /* Conversa Ativa Mobile */
          <div className="h-full flex flex-col">
            {/* Header com botão de voltar */}
            <div className="flex items-center gap-2 p-4 border-b bg-white">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <span className="font-medium">
                  {selectedConversation?.contact.name || 
                   selectedConversation?.contact.phone || 
                   'Conversa'}
                </span>
              </div>
            </div>
            
            {/* Área da Conversa */}
            <div className="flex-1">
              <ConversationView
                inboxId={inboxId}
                conversation={selectedConversation}
                onConversationUpdate={handleConversationUpdate}
                isMobile={true}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ConversationsLayout; 