"use client"

import * as React from "react"
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
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

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
          url: "#",
        },
        {
          title: "Respostas Prontas",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
