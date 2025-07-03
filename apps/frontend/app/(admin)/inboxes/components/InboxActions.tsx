"use client";

import { useState } from "react";
import { MoreHorizontal, MessageSquare, Edit, Power, PowerOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Inbox } from "@/types/inbox";

interface InboxActionsProps {
  inbox: Inbox;
  updateInboxStatus: (id: string, is_active: boolean) => Promise<any>;
  handleEditInbox: (inbox: Inbox) => void;
  handleViewConversations: (inbox: Inbox) => void;
}

export function InboxActions({
  inbox,
  updateInboxStatus,
  handleEditInbox,
  handleViewConversations,
}: InboxActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async () => {
    setIsLoading(true);
    try {
      await updateInboxStatus(inbox.id, !inbox.is_active);
    } catch (error) {
      console.error("Erro ao alterar status da caixa de entrada:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        
        <DropdownMenuItem
          onClick={() => handleViewConversations(inbox)}
          className="cursor-pointer"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Ver Conversas
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => handleEditInbox(inbox)}
          className="cursor-pointer"
        >
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={handleStatusChange}
          disabled={isLoading}
          className="cursor-pointer"
        >
          {inbox.is_active ? (
            <>
              <PowerOff className="mr-2 h-4 w-4" />
              Desativar
            </>
          ) : (
            <>
              <Power className="mr-2 h-4 w-4" />
              Ativar
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 