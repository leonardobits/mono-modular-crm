"use client";

import {
  SiNextdotjs,
  SiNestjs,
  SiSupabase,
  SiPostgresql,
  SiTypescript,
  SiReact,
  SiPnpm,
  SiTurborepo,
  SiPostman,
  SiWhatsapp,
} from "react-icons/si";
import { BrainCircuit } from "lucide-react";

const technologies = [
  { name: "Next.js", icon: <SiNextdotjs size={32} /> },
  { name: "React", icon: <SiReact size={32} /> },
  { name: "NestJS", icon: <SiNestjs size={32} /> },
  { name: "TypeScript", icon: <SiTypescript size={32} /> },
  { name: "Supabase", icon: <SiSupabase size={32} /> },
  { name: "PostgreSQL", icon: <SiPostgresql size={32} /> },
  { name: "PNPM", icon: <SiPnpm size={32} /> },
  { name: "Turborepo", icon: <SiTurborepo size={32} /> },
  { name: "Inteligência Artificial", icon: <BrainCircuit size={32} /> },
  { name: "WhatsApp", icon: <SiWhatsapp size={32} /> },
  { name: "Postman", icon: <SiPostman size={32} /> },
];

export function TechStackSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-200 md:text-5xl">
            Construído com as{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Melhores Ferramentas
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Utilizamos uma stack moderna e poderosa para garantir performance, escalabilidade e uma experiência de desenvolvimento de ponta.
          </p>
        </div>
        <div
          className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]"
        >
          <div className="flex w-max animate-scroll">
            {[...technologies, ...technologies].map((tech, index) => (
              <div key={index} className="mx-8 flex flex-col items-center justify-center gap-2 text-center">
                <div className="text-slate-400 transition-all duration-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                  {tech.icon}
                </div>
                <span className="text-sm text-slate-500">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 