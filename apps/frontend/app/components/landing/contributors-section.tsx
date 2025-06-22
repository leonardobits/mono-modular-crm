"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, GitBranch, GitCommit, Heart, Users } from "lucide-react";
import { motion } from "framer-motion";

// Componente Badge inline
const Badge = ({
  children,
  className = "",
  variant = "secondary",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: string;
}) => (
  <div
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}
  >
    {children}
  </div>
);

interface Contributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
}

interface RepoStats {
  stargazers_count: number;
  forks_count: number;
  contributors_count: number;
}

export function ContributorsSection() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [repoStats, setRepoStats] = useState<RepoStats>({
    stargazers_count: 0,
    forks_count: 0,
    contributors_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const REPO_OWNER = "leonardobits";
  const REPO_NAME = "mono-modular-crm";

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar informações do repositório
        const repoResponse = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`,
        );

        if (!repoResponse.ok) {
          throw new Error("Falha ao carregar informações do repositório");
        }

        const repoData = await repoResponse.json();

        // Buscar contribuintes
        const contributorsResponse = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contributors`,
        );

        if (!contributorsResponse.ok) {
          throw new Error("Falha ao carregar contribuintes");
        }

        const contributorsData = await contributorsResponse.json();

        setRepoStats({
          stargazers_count: repoData.stargazers_count,
          forks_count: repoData.forks_count,
          contributors_count: contributorsData.length,
        });

        setContributors(contributorsData.slice(0, 12)); // Limitar a 12 contribuintes
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        console.error("Erro ao buscar contribuintes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContributors();
  }, []);

  const getContributionLevel = (contributions: number) => {
    if (contributions >= 100)
      return { level: "Mantenedor", color: "bg-purple-500" };
    if (contributions >= 50)
      return { level: "Contribuidor Ativo", color: "bg-blue-500" };
    if (contributions >= 10)
      return { level: "Contribuidor", color: "bg-green-500" };
    return { level: "Colaborador", color: "bg-gray-500" };
  };

  if (loading) {
    return (
      <section className="py-24">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-5xl">
              Nossos{" "}
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Contribuintes
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Carregando contribuintes...
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="p-6">
                <div className="flex animate-pulse items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gray-300"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 rounded bg-gray-300"></div>
                    <div className="h-3 w-16 rounded bg-gray-300"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-5xl">
              Nossos{" "}
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Contribuintes
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-red-500">
              {error}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Visite nosso repositório no GitHub para ver todos os
              contribuintes.
            </p>
            <Button
              className="mt-4"
              onClick={() =>
                window.open(
                  `https://github.com/${REPO_OWNER}/${REPO_NAME}`,
                  "_blank",
                )
              }
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver no GitHub
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contributors" className="py-24">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-5xl">
            Nossos{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Contribuintes
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Conheça as pessoas incríveis que tornam este projeto possível. Cada
            contribuição faz a diferença!
          </p>
        </div>

        {/* Estatísticas do Repositório */}
        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Card className="border-2 border-primary/20 bg-primary/5 p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <Heart className="h-6 w-6" />
                {repoStats.stargazers_count}
              </div>
              <p className="text-sm text-muted-foreground">Stars</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="border-2 border-primary/20 bg-primary/5 p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <GitBranch className="h-6 w-6" />
                {repoStats.forks_count}
              </div>
              <p className="text-sm text-muted-foreground">Forks</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="border-2 border-primary/20 bg-primary/5 p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <Users className="h-6 w-6" />
                {repoStats.contributors_count}
              </div>
              <p className="text-sm text-muted-foreground">Contribuintes</p>
            </Card>
          </motion.div>
        </div>

        {/* Grade de Contribuintes */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {contributors.map((contributor, index) => {
            const { level, color } = getContributionLevel(
              contributor.contributions,
            );

            return (
              <motion.div
                key={contributor.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group h-full transform-gpu transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 border-2 border-primary/20 transition-all duration-300 group-hover:border-primary/50">
                          <AvatarImage
                            src={contributor.avatar_url}
                            alt={contributor.login}
                          />
                          <AvatarFallback>
                            {contributor.login.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {contributor.login}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <GitCommit className="h-3 w-3" />
                            {contributor.contributions} contribuições
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(contributor.html_url, "_blank")
                        }
                        className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-4">
                      <Badge
                        variant="secondary"
                        className={`${color} text-white`}
                      >
                        {level}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Botão para ver mais */}
        <div className="mt-12 text-center">
          <Button
            onClick={() =>
              window.open(
                `https://github.com/${REPO_OWNER}/${REPO_NAME}/graphs/contributors`,
                "_blank",
              )
            }
            size="lg"
            className="group relative bg-gradient-to-r from-blue-500 to-purple-500 text-primary-foreground"
          >
            <span className="absolute h-full w-full rounded-md bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></span>
            <span className="relative flex items-center">
              <ExternalLink className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              Ver Todos os Contribuintes no GitHub
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
}
