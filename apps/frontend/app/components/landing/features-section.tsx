"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Boxes,
  MessageSquareQuote,
  PanelTop,
  Plug,
  Webhook,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: <PanelTop size={32} className="text-primary" />,
    title: "Caixa de Entrada Omnichannel",
    description:
      "Conecte-se com clientes em qualquer canal: site, e-mail, redes sociais e WhatsApp, tudo em um só lugar.",
  },
  {
    icon: <Zap size={32} className="text-primary" />,
    title: "Assistente com IA",
    description:
      "Automatize respostas, resuma conversas e traduza mensagens em tempo real para um suporte mais inteligente.",
  },
  {
    icon: <MessageSquareQuote size={32} className="text-primary" />,
    title: "Base de Conhecimento",
    description:
      "Crie um portal de autoatendimento para que seus clientes encontrem respostas rápidas, 24/7.",
  },
  {
    icon: <Boxes size={32} className="text-primary" />,
    title: "Arquitetura Modular",
    description:
      "Nosso grande diferencial. Adicione, remova ou personalize módulos para criar o CRM que seu negócio precisa.",
  },
  {
    icon: <Webhook size={32} className="text-primary" />,
    title: "Automação e Webhooks",
    description:
      "Crie regras de automação para tarefas repetitivas e use webhooks para integrar com qualquer sistema.",
  },
  {
    icon: <Plug size={32} className="text-primary" />,
    title: "API Poderosa",
    description:
      "Estenda a plataforma com integrações customizadas e construa a solução de suporte perfeita para você.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="container mx-auto max-w-7xl py-24">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-foreground md:text-5xl">
          Inteligência em cada{" "}
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Interação.
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          De IA a automações, combine nossas ferramentas e construa um fluxo de
          atendimento que encanta clientes e capacita sua equipe.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="h-full transform-gpu transition-transform duration-300 hover:-translate-y-2 hover:border-primary/50">
              <CardHeader className="flex flex-row items-center gap-4">
                {feature.icon}
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
