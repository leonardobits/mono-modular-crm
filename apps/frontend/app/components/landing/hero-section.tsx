"use client";

import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";
import { GridBackground } from "./GridBackground";

export function HeroSection() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const x = useTransform(mouseX, (val) => `${val}%`);
  const y = useTransform(mouseY, (val) => `${val}%`);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLElement>) {
    if (!currentTarget) return;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const newX = ((clientX - left) / width) * 100;
    const newY = ((clientY - top) / height) * 100;
    mouseX.set(newX);
    mouseY.set(newY);
  }

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative mx-auto flex h-screen max-w-7xl flex-col items-center justify-center px-4 text-center"
    >
      <GridBackground x={x} y={y} />
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative z-10 flex flex-col items-center justify-center gap-4"
      >
        <div className="text-4xl font-bold md:text-7xl">
          <h1 className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Atendimento Reinventado.
          </h1>
          <p className="mt-2 text-2xl font-normal tracking-tight text-foreground/80 md:text-4xl">
            O CRM open-source que coloca você no controle.
          </p>
        </div>
        <p className="max-w-xl text-center text-lg text-muted-foreground">
          Cansado de plataformas rígidas? Molde nosso CRM modular às suas necessidades e seja dono da sua inovação.
        </p>
        <div className="flex items-center gap-4 py-4">
          <Button
            asChild
            size="lg"
            className="group relative bg-gradient-to-r from-blue-500 to-purple-500 text-primary-foreground"
          >
            <Link href="/register">
              <span className="absolute h-full w-full rounded-md bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></span>
              <span className="relative">Comece Agora</span>
            </Link>
          </Button>
          <Button size="lg" variant="outline">
            Veja uma Demo
          </Button>
        </div>
      </motion.div>
    </section>
  );
} 