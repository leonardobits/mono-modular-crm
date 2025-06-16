"use client";

import { useState, useEffect, useCallback } from 'react';
import { CreateUserSchema, UpdateUserSchema } from "zod-schemas/user.schema";
import { User } from '@/types/user';
import { toast } from 'sonner';

// Configuração da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const useUsersApi = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Obter token de autenticação
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.message || 'Falha ao buscar usuários');
      }

      const users = await response.json();
      setUsers(users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: CreateUserSchema) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔥 FRONTEND - createUser called with:', userData);
      
      // Obter token de autenticação
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        throw new Error('Token de autenticação não encontrado');
      }

      console.log('🔥 FRONTEND - Token found, making request to:', `${API_BASE_URL}/api/v1/users`);
      console.log('🔥 FRONTEND - Request body:', JSON.stringify(userData));

      const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(userData),
      });

      console.log('🔥 FRONTEND - Response status:', response.status);
      console.log('🔥 FRONTEND - Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        console.error('🔥 FRONTEND - Error response:', errorData);
        console.error('🔥 FRONTEND - Validation errors:', errorData.errors);
        throw new Error(errorData.message || 'Falha ao criar usuário');
      }

      const newUser = await response.json();
      console.log('🔥 FRONTEND - Success! New user:', newUser);
      
      // Atualiza a lista local e também força uma busca atualizada
      setUsers((prevUsers) => [...prevUsers, newUser]);
      // Opcionalmente recarrega a lista para garantir consistência
      setTimeout(() => fetchUsers(), 100);
      return newUser;
    } catch (err: any) {
      console.error('🔥 FRONTEND - Error in createUser:', err);
      setError(err.message);
      throw err; // Re-lança o erro para o formulário tratar
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, userData: Partial<UpdateUserSchema>) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔥 FRONTEND - updateUser called with:', { id, userData });
      
      // Obter token de autenticação
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        throw new Error('Token de autenticação não encontrado');
      }

      console.log('🔥 FRONTEND - Making PUT request to:', `${API_BASE_URL}/api/v1/users/${id}`);
      console.log('🔥 FRONTEND - Request body:', JSON.stringify(userData));

      const response = await fetch(`${API_BASE_URL}/api/v1/users/${id}`, {
        method: 'PUT', // Usando PUT conforme especificado no PRD
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(userData),
      });

      console.log('🔥 FRONTEND - Update response status:', response.status);
      console.log('🔥 FRONTEND - Update response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        console.error('🔥 FRONTEND - Update error response:', errorData);
        throw new Error(errorData.message || 'Falha ao atualizar usuário');
      }

      const updatedUser = await response.json();
      
      // Força a busca da lista de usuários para garantir 100% de consistência
      await fetchUsers();
      
      return updatedUser;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers]);

  const updateUserPassword = useCallback(async (id: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) throw new Error('Token de autenticação não encontrado');

      const response = await fetch(`${API_BASE_URL}/api/v1/users/${id}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.message || 'Falha ao atualizar a senha');
      }

      toast.success('Senha do usuário atualizada com sucesso!');
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      toast.error(`Erro ao atualizar a senha: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deactivateUser = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Obter token de autenticação
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/users/${id}/deactivate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.message || 'Falha ao desativar usuário');
      }

      const updatedUser = await response.json();
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === id ? updatedUser : user))
      );
      toast.success(`Usuário ${updatedUser.full_name} desativado com sucesso!`);
      return updatedUser;
    } catch (err: any) {
      setError(err.message);
      toast.error(`Erro ao desativar usuário: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reactivateUser = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Obter token de autenticação
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/users/${id}/reactivate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.message || 'Falha ao reativar usuário');
      }

      const updatedUser = await response.json();
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === id ? updatedUser : user))
      );
      toast.success(`Usuário ${updatedUser.full_name} reativado com sucesso!`);
      return updatedUser;
    } catch (err: any) {
      setError(err.message);
      toast.error(`Erro ao reativar usuário: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserStatus = useCallback(async (id: string, status: 'ACTIVE' | 'INACTIVE') => {
    if (status === 'INACTIVE') {
      return deactivateUser(id);
    } else {
      return reactivateUser(id);
    }
  }, [deactivateUser, reactivateUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, error, fetchUsers, createUser, updateUser, updateUserPassword, updateUserStatus, deactivateUser, reactivateUser };
}; 