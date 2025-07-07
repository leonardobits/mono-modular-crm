"use client";

import React, { useState, useEffect } from "react";
import {
  AdminPageHeader,
  BreadcrumbItemProps,
} from "@/components/admin-page-header";
import { LoadingBar } from "@/components/ui/loading-bar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useParams } from "next/navigation";
import ConversationsLayout from "@/components/conversations/ConversationsLayout";
import { useInboxesApi } from "../../hooks/useInboxesApi";

const InboxConversationsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inboxName, setInboxName] = useState<string>("");
  const params = useParams();
  const inboxId = params.inboxId as string;
  const { getInboxById } = useInboxesApi();

  useEffect(() => {
    const loadInboxData = async () => {
      try {
        setIsLoading(true);
        const inbox = await getInboxById(inboxId);
        if (inbox) {
          setInboxName(inbox.name);
        } else {
          setError("Inbox não encontrada");
        }
      } catch (err) {
        setError("Erro ao carregar dados da inbox");
        console.error("Error loading inbox:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (inboxId) {
      loadInboxData();
    }
  }, [inboxId, getInboxById]);

  if (isLoading) {
    return <LoadingBar />;
  }

  if (error) {
    return <div className="text-red-500">Erro: {error}</div>;
  }

  const breadcrumbs: BreadcrumbItemProps[] = [
    { label: "Admin", href: "/admin" },
    { label: "Caixas de Entrada", href: "/inboxes" },
    { label: `Conversas - ${inboxName}` },
  ];

  return (
    <AuthGuard requireAuth={true}>
      <AdminPageHeader
        title=""
        breadcrumbs={breadcrumbs}
      />
      
      <ConversationsLayout inboxId={inboxId} />
    </AuthGuard>
  );
};

export default InboxConversationsPage; 