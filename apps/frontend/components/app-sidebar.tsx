"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Command,
  GalleryVerticalEnd,
  LineChart,
  MessageSquare,
  Send,
  Settings2,
  Users,
  Contact,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useInboxesApi } from "@/app/(admin)/inboxes/hooks/useInboxesApi";

// Estes são dados de exemplo.
const data = {
  user: {
    name: "Leonardo",
    email: "leo@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Devs",
      logo: Command,
      plan: "Enterprise",
    },
    {
      name: "Vendas",
      logo: LineChart,
      plan: "Startup",
    },
  ],
  navMain: [
    {
      title: "Conversas",
      url: "#",
      icon: MessageSquare,
      isActive: true,
    },
    {
      title: "Contatos",
      url: "#",
      icon: Contact,
    },
    {
      title: "Relatórios",
      url: "#",
      icon: LineChart,
    },
    {
      title: "Campanhas",
      url: "#",
      icon: Send,
    },
    {
      title: "Documentação",
      url: "#",
      icon: BookOpen,
    },
    {
      title: "Configurações",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Usuários",
          url: "/users", // Link para a página de usuários
        },
        {
          title: "Equipes",
          url: "#",
        },
        {
          title: "Caixas de Entrada",
          url: "/inboxes",
        },
        {
          title: "Respostas Prontas",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { inboxes, isLoading } = useInboxesApi();

  // Criar itens do menu dinamicamente com base nos inboxes do usuário
  const navMainWithInboxes = React.useMemo(() => {
    const conversasItem = data.navMain.find(item => item.title === "Conversas");
    if (!conversasItem) return data.navMain;

    // Criar subitens para cada inbox
    const inboxItems = inboxes
      .filter(inbox => inbox.is_active) // Apenas inboxes ativos
      .map(inbox => ({
        title: inbox.name,
        url: `/inboxes/${inbox.id}/conversations`,
        id: inbox.id, // Adicionar ID único para evitar duplicatas
      }));

    // Atualizar o item Conversas com os subitens dos inboxes
    const updatedNavMain = data.navMain.map(item => 
      item.title === "Conversas" 
        ? { ...item, items: inboxItems }
        : item
    );

    return updatedNavMain;
  }, [inboxes]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithInboxes} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
