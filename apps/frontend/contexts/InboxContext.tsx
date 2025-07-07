"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Inbox, Channel, CreateInboxData, UpdateInboxData } from "@/types/inbox";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface InboxContextType {
  inboxes: Inbox[];
  channels: Channel[];
  isLoading: boolean;
  error: string | null;
  fetchInboxes: () => Promise<void>;
  fetchChannels: () => Promise<void>;
  createInbox: (inboxData: CreateInboxData) => Promise<Inbox>;
  updateInbox: (id: string, inboxData: UpdateInboxData) => Promise<Inbox>;
  updateInboxStatus: (id: string, is_active: boolean) => Promise<Inbox>;
  getInboxById: (id: string) => Promise<Inbox | null>;
}

const InboxContext = createContext<InboxContextType | undefined>(undefined);

export const useInboxes = () => {
  const context = useContext(InboxContext);
  if (!context) {
    throw new Error("useInboxes must be used within an InboxProvider");
  }
  return context;
};

export const InboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inboxes, setInboxes] = useState<Inbox[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const getAuthToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token") ||
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth-token="))
        ?.split("=")[1];
  }, []);

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("auth_token");
    router.push("/login");
  }, [router]);

  const fetchInboxes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const authToken = getAuthToken();

      if (!authToken) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/inboxes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.message || "Falha ao buscar caixas de entrada");
      }

      const inboxes = await response.json();
      setInboxes(inboxes);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Erro ao buscar caixas de entrada: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken, handleUnauthorized]);

  const fetchChannels = useCallback(async () => {
    try {
      const authToken = getAuthToken();

      if (!authToken) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/inboxes/channels`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.message || "Falha ao buscar canais");
      }

      const channels = await response.json();
      setChannels(channels);
    } catch (err: any) {
      console.error("Erro ao buscar canais:", err);
    }
  }, [getAuthToken, handleUnauthorized]);

  const createInbox = useCallback(
    async (inboxData: CreateInboxData) => {
      setIsLoading(true);
      setError(null);
      try {
        const authToken = getAuthToken();
        if (!authToken) {
          throw new Error("Token de autenticação não encontrado");
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/inboxes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(inboxData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `HTTP ${response.status}: ${response.statusText}`,
          }));
          throw new Error(errorData.message || "Falha ao criar caixa de entrada");
        }

        const newInbox = await response.json();
        setInboxes(prevInboxes => [...prevInboxes, newInbox]);
        
        toast.success("Caixa de entrada criada com sucesso!");
        return newInbox;
      } catch (err: any) {
        setError(err.message);
        toast.error(`Erro ao criar caixa de entrada: ${err.message}`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getAuthToken],
  );

  const updateInbox = useCallback(
    async (id: string, inboxData: UpdateInboxData) => {
      setIsLoading(true);
      setError(null);
      try {
        const authToken = getAuthToken();
        if (!authToken) {
          throw new Error("Token de autenticação não encontrado");
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/inboxes/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(inboxData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `HTTP ${response.status}: ${response.statusText}`,
          }));
          throw new Error(errorData.message || "Falha ao atualizar caixa de entrada");
        }

        const updatedInbox = await response.json();
        setInboxes((prevInboxes) =>
          prevInboxes.map((inbox) => (inbox.id === id ? updatedInbox : inbox))
        );

        toast.success("Caixa de entrada atualizada com sucesso!");
        return updatedInbox;
      } catch (err: any) {
        setError(err.message);
        toast.error(`Erro ao atualizar caixa de entrada: ${err.message}`);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getAuthToken],
  );

  const updateInboxStatus = useCallback(
    async (id: string, is_active: boolean) => {
      try {
        const endpoint = is_active ? "reactivate" : "deactivate";
        const authToken = getAuthToken();
        if (!authToken) {
          throw new Error("Token de autenticação não encontrado");
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/inboxes/${id}/${endpoint}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `HTTP ${response.status}: ${response.statusText}`,
          }));
          throw new Error(errorData.message || `Falha ao ${is_active ? 'ativar' : 'desativar'} caixa de entrada`);
        }

        const updatedInbox = await response.json();
        setInboxes((prevInboxes) =>
          prevInboxes.map((inbox) => (inbox.id === id ? updatedInbox : inbox))
        );

        toast.success(`Caixa de entrada ${is_active ? 'ativada' : 'desativada'} com sucesso!`);
        return updatedInbox;
      } catch (err: any) {
        toast.error(`Erro ao ${is_active ? 'ativar' : 'desativar'} caixa de entrada: ${err.message}`);
        throw err;
      }
    },
    [getAuthToken],
  );

  const getInboxById = useCallback(
    async (id: string): Promise<Inbox | null> => {
      try {
        const authToken = getAuthToken();
        if (!authToken) {
          throw new Error("Token de autenticação não encontrado");
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/inboxes/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (response.status === 401) {
          handleUnauthorized();
          return null;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `HTTP ${response.status}: ${response.statusText}`,
          }));
          throw new Error(errorData.message || "Falha ao buscar caixa de entrada");
        }

        const inbox = await response.json();
        return inbox;
      } catch (err: any) {
        console.error("Erro ao buscar caixa de entrada:", err);
        throw err;
      }
    },
    [getAuthToken, handleUnauthorized],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchInboxes();
      fetchChannels();
    }
  }, [mounted, fetchInboxes, fetchChannels]);

  const value = {
    inboxes,
    channels,
    isLoading,
    error,
    fetchInboxes,
    fetchChannels,
    createInbox,
    updateInbox,
    updateInboxStatus,
    getInboxById,
  };

  if (!mounted) {
    return (
      <InboxContext.Provider value={value}>
        {children}
      </InboxContext.Provider>
    );
  }

  return (
    <InboxContext.Provider value={value}>
      {children}
    </InboxContext.Provider>
  );
};