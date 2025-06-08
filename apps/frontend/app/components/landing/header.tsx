"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion, useAnimation, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";

export function Header() {
  const { scrollY } = useScroll();
  const controls = useAnimation();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (previous !== undefined && latest > previous && latest > 150) {
      controls.start("hidden");
    } else {
      controls.start("visible");
    }
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      initial="visible"
      animate={controls}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed inset-x-0 top-0 z-50 h-20 border-border bg-background/80 backdrop-blur-lg"
    >
      <div className="container mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        <div className="text-xl font-bold">
          <Link href="/" className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            MonoModular CRM
          </Link>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
            Recursos
          </Link>
          <Link href="#docs" className="text-muted-foreground transition-colors hover:text-foreground">
            Documentação
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="group relative bg-gradient-to-r from-blue-500 to-purple-500 text-primary-foreground">
            <Link href="/register">
              <span className="absolute h-full w-full rounded-md bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></span>
              <span className="relative">Registrar-se</span>
            </Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
} 