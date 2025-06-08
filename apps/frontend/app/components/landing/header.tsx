"use client";

import { Button } from "@/components/ui/button";
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
      className="fixed inset-x-0 top-0 z-50 h-20 border-b border-white/[0.1] bg-[#0D1117]/80 backdrop-blur-lg"
    >
      <div className="container mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        <div className="text-xl font-bold">
          <Link href="/" className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            MonoModular CRM
          </Link>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#features" className="text-slate-400 transition-colors hover:text-slate-200">
            Recursos
          </Link>
          <Link href="#docs" className="text-slate-400 transition-colors hover:text-slate-200">
            Documentação
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="text-slate-200 hover:bg-white/10 hover:text-white">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="group relative bg-gradient-to-r from-blue-500 to-purple-500 text-white">
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