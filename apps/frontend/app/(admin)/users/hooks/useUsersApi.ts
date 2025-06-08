"use client";

import { useState, useEffect, useCallback } from 'react';
import { CreateUserSchema, UpdateUserSchema } from "zod-schemas/user.schema";
import { User } from '@/types/user';

export const useUsersApi = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // INÍCIO: DADOS MOCKADOS PARA TESTE
      const mockUsers: User[] = [
        { id: '1', name: 'Alice Smith', email: 'alice@example.com', cargo: 'ADMINISTRADOR', status: 'ATIVO' },
        { id: '2', name: 'Bob Johnson', email: 'bob@example.com', cargo: 'GERENTE', status: 'ATIVO' },
        { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', cargo: 'ATENDENTE', status: 'INATIVO' },
        { id: '4', name: 'Diana Prince', email: 'diana@example.com', cargo: 'ATENDENTE', status: 'ATIVO' },
      ];
      
      setTimeout(() => {
        setUsers(mockUsers);
        setIsLoading(false);
      }, 1000); // Simula 1 segundo de delay da rede
      // FIM: DADOS MOCKADOS PARA TESTE

      // TODO: Descomentar quando o backend estiver pronto
      // const response = await fetch('/api/users'); 
      // if (!response.ok) {
      //   throw new Error('Failed to fetch users');
      // }
      // const data = await response.json();
      // setUsers(data);
    } catch (err: any) {
      setError(err.message);
      // setIsLoading(false); // Já está no finally, mas se descomentar o fetch, tire o do setTimeout
    } finally {
      // Com o setTimeout, o setIsLoading(false) é movido para dentro dele.
      // setIsLoading(false); 
    }
  }, []);

  const createUser = useCallback(async (userData: CreateUserSchema) => {
    setIsLoading(true);
    setError(null);
    try {
      // INÍCIO: DADOS MOCKADOS PARA TESTE
      console.log("Creating user with data:", userData);
      const newUser: User = {
        id: (Math.random() * 1000).toString(), // ID Fictício
        ...userData,
        status: 'ATIVO', // Status padrão
      };
      
      setTimeout(() => {
        setUsers((prevUsers) => [...prevUsers, newUser]);
        setIsLoading(false);
      }, 500);
      
      return newUser;
      // FIM: DADOS MOCKADOS PARA TESTE

      // TODO: Descomentar quando o backend estiver pronto
      // const response = await fetch('/api/users', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(userData),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Failed to create user');
      // }

      // const newUser = await response.json();
      // setUsers((prevUsers) => [...prevUsers, newUser]);
      // return newUser;
    } catch (err: any) {
      setError(err.message);
      throw err; // Re-lança o erro para o formulário tratar
    } finally {
      // Com o setTimeout, o setIsLoading(false) é movido para dentro dele.
      // setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, userData: Partial<UpdateUserSchema>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      const updatedUser = await response.json();
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === id ? updatedUser : user))
      );
      return updatedUser;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserStatus = useCallback(async (id: string, status: 'ATIVO' | 'INATIVO') => {
    // Reutiliza a lógica de updateUser para a mudança de status
    return updateUser(id, { status });
  }, [updateUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Funções para criar, atualizar, etc. serão adicionadas aqui

  return { users, isLoading, error, fetchUsers, createUser, updateUser, updateUserStatus };
}; 