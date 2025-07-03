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
import { useRouter, useParams } from "next/navigation";
import { useInboxesApi } from "../../hooks/useInboxesApi";
import { toast } from "sonner";
import { Inbox } from "@/types/inbox";

const EditInboxPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    channel_id: "",
    settings: {} as Record<string, any>,
    is_active: true,
  });
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [settingsJson, setSettingsJson] = useState<string>("");
  const [currentInbox, setCurrentInbox] = useState<Inbox | null>(null);
  
  const router = useRouter();
  const params = useParams();
  const inboxId = params.inboxId as string;
  
  const { 
    channels, 
    isLoading, 
    updateInbox, 
    fetchChannels,
    getInboxById 
  } = useInboxesApi();

  useEffect(() => {
    fetchChannels();
    if (inboxId) {
      loadInboxData();
    }
  }, [inboxId, fetchChannels]);

  const loadInboxData = async () => {
    try {
      const inbox = await getInboxById(inboxId);
      if (inbox) {
        setCurrentInbox(inbox);
        setFormData({
          name: inbox.name,
          channel_id: inbox.channel_id,
          settings: inbox.settings || {},
          is_active: inbox.is_active,
        });
        setSelectedChannel(inbox.channel_id);
        setSettingsJson(JSON.stringify(inbox.settings || {}, null, 2));
      }
    } catch (error) {
      console.error("Erro ao carregar dados da inbox:", error);
      toast.error("Erro ao carregar dados da caixa de entrada");
      router.push("/inboxes");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.channel_id) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    try {
      await updateInbox(inboxId, {
        name: formData.name,
        channel_id: formData.channel_id,
        settings: formData.settings,
        is_active: formData.is_active,
      });
      
      toast.success("Caixa de entrada atualizada com sucesso!");
      router.push("/inboxes");
    } catch (error) {
      console.error("Erro ao atualizar caixa de entrada:", error);
      toast.error("Erro ao atualizar caixa de entrada");
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

  const handleSettingsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSettingsJson(value);
    
    try {
      const settings = value ? JSON.parse(value) : {};
      setFormData(prev => ({ ...prev, settings }));
    } catch (error) {
      // Ignora erros de JSON inválido durante a digitação
    }
  };

  const breadcrumbs: BreadcrumbItemProps[] = [
    { label: "Admin", href: "/admin" },
    { label: "Caixas de Entrada", href: "/inboxes" },
    { label: currentInbox ? `Editar ${currentInbox.name}` : "Editar Caixa de Entrada" },
  ];

  if (!currentInbox && !isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Caixa de entrada não encontrada</h2>
            <Button onClick={() => router.push("/inboxes")}>
              Voltar à lista
            </Button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <AdminPageHeader
        title={currentInbox ? `Editar ${currentInbox.name}` : "Editar Caixa de Entrada"}
        breadcrumbs={breadcrumbs}
      />
      
      {isLoading ? (
        <div className="flex items-center justify-center min-h-96">
          <LoadingBar />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Editar Caixa de Entrada</CardTitle>
              <CardDescription>
                Atualize as configurações da caixa de entrada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Caixa de Entrada *</Label>
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
                  <Label htmlFor="is_active">Status</Label>
                  <Select 
                    value={formData.is_active ? "true" : "false"} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, is_active: value === "true" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Ativo</SelectItem>
                      <SelectItem value="false">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settings">Configurações (Opcional)</Label>
                  <textarea
                    id="settings"
                    name="settings"
                    value={settingsJson}
                    placeholder='{"webhook_url": "https://api.example.com/webhook", "auto_reply": true}'
                    rows={5}
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={handleSettingsChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Configure parâmetros específicos do canal em formato JSON. Deixe vazio para usar configurações padrão.
                  </p>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isLoading || !formData.name || !formData.channel_id}>
                    {isLoading ? "Salvando..." : "Salvar Alterações"}
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
      )}
    </AuthGuard>
  );
};

export default EditInboxPage; 