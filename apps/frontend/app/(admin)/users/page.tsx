"use client";

import React, { useState, useCallback } from "react";
import { useUsersApi } from "./hooks/useUsersApi";
import { DataTable } from "./components/DataTable";
import { columns } from "./components/columns";
import { User } from "@/types/user";
import { EditUserModal } from "./components/EditUserModal";
import {
  AdminPageHeader,
  BreadcrumbItemProps,
} from "@/components/admin-page-header";
import { Button } from "@/components/ui/button";
import { CreateUserModal } from "./components/CreateUserModal";
import { LoadingBar } from "@/components/ui/loading-bar";
import { AuthGuard } from "@/components/auth/AuthGuard";

const UsersPage = () => {
  const { users, isLoading, error, updateUser, updateUserStatus, fetchUsers } =
    useUsersApi();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEditUser = useCallback((user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  }, []);

  const handleCreateUser = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleUserUpdated = useCallback(() => {
    fetchUsers();
    setIsEditModalOpen(false);
  }, [fetchUsers]);

  const handleUserCreated = useCallback(() => {
    fetchUsers();
    setIsCreateModalOpen(false);
  }, [fetchUsers]);

  if (isLoading) {
    return <LoadingBar />;
  }

  if (error) {
    return <div className="text-red-500">Erro: {error}</div>;
  }

  const breadcrumbs: BreadcrumbItemProps[] = [
    { label: "Admin", href: "/admin" },
    { label: "Usuários" },
  ];

  return (
    <AuthGuard requireAuth={true}>
      <AdminPageHeader
        title="Gerenciamento de Usuários"
        breadcrumbs={breadcrumbs}
      >
        <Button onClick={handleCreateUser}>Criar Usuário</Button>
      </AdminPageHeader>
      <DataTable
        columns={columns}
        data={users}
        meta={{
          updateUser,
          updateUserStatus,
          handleEditUser,
        }}
      />
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onUserUpdated={handleUserUpdated}
        />
      )}
      <CreateUserModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onUserCreated={handleUserCreated}
      />
    </AuthGuard>
  );
};

export default UsersPage;
