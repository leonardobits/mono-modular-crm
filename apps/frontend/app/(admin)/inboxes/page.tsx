"use client";

import React, { useCallback } from "react";
import {
  AdminPageHeader,
  BreadcrumbItemProps,
} from "@/components/admin-page-header";
import { Button } from "@/components/ui/button";
import { LoadingBar } from "@/components/ui/loading-bar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useRouter } from "next/navigation";
import { useInboxesApi } from "./hooks/useInboxesApi";
import { DataTable } from "./components/DataTable";
import { columns } from "./components/columns";
import { Inbox } from "@/types/inbox";

const InboxesPage = () => {
  const router = useRouter();
  const { inboxes, isLoading, error, updateInboxStatus, fetchInboxes } = useInboxesApi();

  React.useEffect(() => {
    const handleFocus = () => {
      fetchInboxes();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchInboxes]);

  const handleCreateInbox = useCallback(() => {
    router.push("/inboxes/new");
  }, [router]);

  const handleEditInbox = useCallback((inbox: Inbox) => {
    router.push(`/inboxes/${inbox.id}/edit`);
  }, [router]);

  const handleViewConversations = useCallback((inbox: Inbox) => {
    router.push(`/inboxes/${inbox.id}/conversations`);
  }, [router]);

  if (isLoading) {
    return <LoadingBar />;
  }

  if (error) {
    return <div className="text-red-500">Erro: {error}</div>;
  }

  const breadcrumbs: BreadcrumbItemProps[] = [
    { label: "Admin", href: "/admin" },
    { label: "Caixas de Entrada" },
  ];

  return (
    <AuthGuard requireAuth={true}>
      <AdminPageHeader
        title="Gerenciamento de Caixas de Entrada"
        breadcrumbs={breadcrumbs}
      >
        <Button onClick={handleCreateInbox}>Criar Caixa de Entrada</Button>
      </AdminPageHeader>
      
      <div className="container mx-auto py-6">
        {inboxes.length === 0 ? (
          <div className="flex flex-1 items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Nenhuma caixa de entrada encontrada</h2>
              <p className="text-muted-foreground mb-4">
                Clique em "Criar Caixa de Entrada" para começar
              </p>
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={inboxes}
            meta={{
              updateInboxStatus,
              handleEditInbox,
              handleViewConversations,
            }}
          />
        )}
      </div>
    </AuthGuard>
  );
};

export default InboxesPage; 