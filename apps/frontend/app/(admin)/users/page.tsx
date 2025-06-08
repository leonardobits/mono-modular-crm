"use client";

import React, { useState } from 'react';
import { useUsersApi } from './hooks/useUsersApi';
import { DataTable } from './components/DataTable';
import { columns } from './components/columns';
import { User } from '@/types/user';
import { EditUserModal } from './components/EditUserModal';
import { AdminPageHeader, BreadcrumbItemProps } from '@/components/admin-page-header';
import { Button } from '@/components/ui/button';
import { CreateUserModal } from './components/CreateUserModal';
import { LoadingBar } from '@/components/ui/loading-bar';

const UsersPage = () => {
  const { users, isLoading, error, updateUser, updateUserStatus, fetchUsers } = useUsersApi();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCreateUser = () => {
    setIsCreateModalOpen(true);
  };

  if (isLoading) {
    return <LoadingBar />;
  }

  if (error) {
    return <div className="text-red-500">Erro: {error}</div>;
  }

  const breadcrumbs: BreadcrumbItemProps[] = [
    { label: 'Admin', href: '/admin' },
    { label: 'Usuários' },
  ];

  return (
    <>
      <AdminPageHeader title="Gerenciamento de Usuários" breadcrumbs={breadcrumbs}>
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
        />
      )}
      <CreateUserModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onUserCreated={fetchUsers}
      />
    </>
  );
};

export default UsersPage; 