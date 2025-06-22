"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CreateUserSchema, UpdateUserSchema } from "zod-schemas/user.schema";
import { User } from "@/types/user";
import { toast } from "sonner";

// Configuração da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const useUsersApi = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const authToken =
        localStorage.getItem("auth_token") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("auth_token="))
          ?.split("=")[1];

      if (!authToken) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("auth_token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.message || "Falha ao buscar usuários");
      }

      const users = await response.json();
      setUsers(users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const createUser = useCallback(
    async (userData: CreateUserSchema) => {
      setIsLoading(true);
      setError(null);
      try {
        // Obter token de autenticação
        const authToken = localStorage.getItem("auth_token");
        if (!authToken) {
          throw new Error("Token de autenticação não encontrado");
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `HTTP ${response.status}: ${response.statusText}`,
          }));
          console.error("🔥 FRONTEND - Error response:", errorData);
          console.error("🔥 FRONTEND - Validation errors:", errorData.errors);
          throw new Error(errorData.message || "Falha ao criar usuário");
        }

        const newUser = await response.json();

        // Recarregar a lista completa para garantir sincronização
        await fetchUsers();
        
        return newUser;
      } catch (err: any) {
        console.error("🔥 FRONTEND - Error in createUser:", err);
        setError(err.message);
        throw err; // Re-lança o erro para o formulário tratar
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUsers],
  );

  const updateUser = useCallback(
    async (id: string, userData: Partial<UpdateUserSchema>) => {
      setIsLoading(true);
      setError(null);
      try {
        // Obter token de autenticação
        const authToken = localStorage.getItem("auth_token");
        if (!authToken) {
          throw new Error("Token de autenticação não encontrado");
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/users/${id}`, {
          method: "PUT", // Usando PUT conforme especificado no PRD
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `HTTP ${response.status}: ${response.statusText}`,
          }));
          console.error("🔥 FRONTEND - Update error response:", errorData);
          throw new Error(errorData.message || "Falha ao atualizar usuário");
        }

        const updatedUser = await response.json();

        // Atualiza a lista local imediatamente
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
    },
    [],
  );

  const updateUserPassword = useCallback(
    async (id: string, newPassword: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const authToken = localStorage.getItem("auth_token");
        if (!authToken) throw new Error("Token de autenticação não encontrado");

        const response = await fetch(
          `${API_BASE_URL}/api/v1/users/${id}/password`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ password: newPassword }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `HTTP ${response.status}: ${response.statusText}`,
          }));
          throw new Error(errorData.message || "Falha ao atualizar a senha");
        }

        toast.success("Senha do usuário atualizada com sucesso!");
        return await response.json();
      } catch (err: any) {
        setError(err.message);
        toast.error(`Erro ao atualizar a senha: ${err.message}`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const deactivateUser = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Obter token de autenticação
      const authToken = localStorage.getItem("auth_token");
      if (!authToken) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/${id}/deactivate`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.message || "Falha ao desativar usuário");
      }

      const updatedUser = await response.json();
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === id ? updatedUser : user)),
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
      const authToken = localStorage.getItem("auth_token");
      if (!authToken) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/${id}/reactivate`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.message || "Falha ao reativar usuário");
      }

      const updatedUser = await response.json();
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === id ? updatedUser : user)),
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

  const updateUserStatus = useCallback(
    async (id: string, status: "ACTIVE" | "INACTIVE") => {
      if (status === "INACTIVE") {
        return deactivateUser(id);
      } else {
        return reactivateUser(id);
      }
    },
    [deactivateUser, reactivateUser],
  );

  // Usar um useEffect simples sem dependência de fetchUsers para evitar loop infinito
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const authToken =
          localStorage.getItem("auth_token") ||
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("auth_token="))
            ?.split("=")[1];

        if (!authToken) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("auth_token");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `HTTP ${response.status}: ${response.statusText}`,
          }));
          throw new Error(errorData.message || "Falha ao buscar usuários");
        }

        const users = await response.json();
        setUsers(users);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [router]);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    updateUserPassword,
    updateUserStatus,
    deactivateUser,
    reactivateUser,
  };
};
