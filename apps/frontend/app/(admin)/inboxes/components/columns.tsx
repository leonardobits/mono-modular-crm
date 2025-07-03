"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Inbox } from "@/types/inbox";
import { InboxActions } from "./InboxActions";

// Define as colunas da tabela
export const columns: ColumnDef<Inbox>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "channel",
    header: "Canal",
    cell: ({ row }) => {
      const channel = row.original.channel;
      if (!channel) return <Badge variant="secondary">-</Badge>;
      
      return (
        <Badge variant="outline">
          {channel.name}
        </Badge>
      );
    },
  },
  {
    id: "channelType",
    header: "Tipo",
    accessorFn: (row) => row.channel?.type,
    cell: ({ row }) => {
      const channelType = row.original.channel?.type;
      if (!channelType) return <Badge variant="secondary">-</Badge>;

      const typeMap: Record<string, string> = {
        "webchat": "Web Chat",
        "whatsapp": "WhatsApp",
        "instagram": "Instagram",
        "facebook": "Facebook",
        "email": "Email",
        "api": "API",
      };

      return (
        <Badge variant="default">
          {typeMap[channelType] || channelType}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Ativo" : "Inativo"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Criado em
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return date.toLocaleDateString("pt-BR");
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row, table }) => {
      const inbox = row.original;
      const { updateInboxStatus, handleEditInbox, handleViewConversations } = table.options.meta as {
        updateInboxStatus: (id: string, is_active: boolean) => Promise<any>;
        handleEditInbox: (inbox: Inbox) => void;
        handleViewConversations: (inbox: Inbox) => void;
      };

      return (
        <InboxActions
          inbox={inbox}
          updateInboxStatus={updateInboxStatus}
          handleEditInbox={handleEditInbox}
          handleViewConversations={handleViewConversations}
        />
      );
    },
  },
]; 