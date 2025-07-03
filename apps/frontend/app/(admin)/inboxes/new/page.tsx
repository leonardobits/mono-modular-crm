"use client";

import React, { useState, useEffect } from "react";
import {
  AdminPageHeader,
  BreadcrumbItemProps,
} from "@/components/admin-page-header";
import { Button } from "@/components/ui/button";
import { LoadingBar } from "@/components/ui/loading-bar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useInboxesApi } from "../hooks/useInboxesApi";
import { toast } from "sonner";

const NewInboxPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    channel_id: "",
    settings: {} as Record<string, any>,
  });
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  
  const router = useRouter();
  const { 
    channels, 
    isLoading, 
    createInbox, 
    fetchChannels 
  } = useInboxesApi();

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.channel_id) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    try {
      await createInbox({
        name: formData.name,
        channel_id: formData.channel_id,
        settings: formData.settings,
      });
      
      router.push("/inboxes");
    } catch (error) {
      console.error("Erro ao criar caixa de entrada:", error);
      toast.error("Erro ao criar caixa de entrada");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChannelChange = (value: string) => {
    setSelectedChannel(value);
    setFormData(prev => ({ ...prev, channel_id: value }));
  };

  const breadcrumbs: BreadcrumbItemProps[] = [
    { label: "Admin", href: "/admin" },
    { label: "Caixas de Entrada", href: "/inboxes" },
    { label: "Nova Caixa de Entrada" },
  ];

  return (
    <AuthGuard requireAuth={true}>
      <AdminPageHeader
        title="Nova Caixa de Entrada"
        breadcrumbs={breadcrumbs}
      />
      
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Criar Nova Caixa de Entrada</CardTitle>
            <CardDescription>
              Configure uma nova caixa de entrada para gerenciar suas conversas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Caixa de Entrada</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Suporte ao Cliente"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="channel_id">Canal *</Label>
                <Select value={selectedChannel} onValueChange={handleChannelChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um canal" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        {channel.name} ({channel.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {channels.length === 0 && !isLoading && (
                  <p className="text-sm text-muted-foreground">
                    Nenhum canal disponível. Verifique se existem canais cadastrados no sistema.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings">Configurações (Opcional)</Label>
                <textarea
                  id="settings"
                  name="settings"
                  placeholder='{"webhook_url": "https://api.example.com/webhook", "auto_reply": true}'
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(e) => {
                    try {
                      const settings = e.target.value ? JSON.parse(e.target.value) : {};
                      setFormData(prev => ({ ...prev, settings }));
                    } catch (error) {
                      // Ignora erros de JSON inválido durante a digitação
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Configure parâmetros específicos do canal em formato JSON. Deixe vazio para usar configurações padrão.
                </p>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading || !formData.name || !formData.channel_id}>
                  {isLoading ? "Criando..." : "Criar Caixa de Entrada"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push("/inboxes")}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
};

export default NewInboxPage; 