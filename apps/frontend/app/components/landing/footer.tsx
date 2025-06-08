"use client";

import { Github, Book, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border py-8">
      <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center md:flex-row">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} MonoModular CRM. Todos os direitos reservados.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github size={20} />
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Book size={20} />
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Twitter size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
} 