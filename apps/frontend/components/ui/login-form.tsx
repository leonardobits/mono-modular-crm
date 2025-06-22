"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const { login, isLoading } = useAuth();
  const router = useRouter();

  // Controle do hCaptcha baseado na chave estar configurada
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");
  const forceHcaptchaOnLocalhost =
    process.env.NEXT_PUBLIC_FORCE_HCAPTCHA_ON_LOCALHOST === "true";
  const isCaptchaEnabled =
    !!process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY &&
    (!isLocalhost || forceHcaptchaOnLocalhost);
  const shouldValidateCaptcha = isCaptchaEnabled && !captchaToken;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    if (shouldValidateCaptcha) {
      toast.error("Por favor, complete a verificação de segurança.");
      return;
    }

    try {
      const success = await login({ email, password });
      if (success) {
        toast.success("Login realizado com sucesso!");
        router.push("/users");
      } else {
        toast.error("Erro no login. Verifique suas credenciais.");
      }
    } catch (err: any) {
      // O erro já deve ser tratado no contexto, mas por segurança:
      toast.error(err.message || "Erro inesperado no login.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Faça login em sua conta</CardTitle>
          <CardDescription>
            Digite seu email abaixo para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  <a
                    href="/reset"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                {/* Mostrar hCaptcha apenas em produção com chave configurada */}
                {isCaptchaEnabled && (
                  <center>
                    <HCaptcha
                      sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
                      onVerify={(token) => setCaptchaToken(token)}
                    />
                  </center>
                )}

                {/* Aviso quando hCaptcha não está configurado */}
                {!isCaptchaEnabled && (
                  <div className="text-sm text-muted-foreground text-center bg-muted p-2 rounded">
                    {isLocalhost
                      ? "💡 hCaptcha desabilitado em localhost para desenvolvimento"
                      : "💡 hCaptcha desabilitado - Configure NEXT_PUBLIC_HCAPTCHA_SITE_KEY para habilitar"}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || shouldValidateCaptcha}
                >
                  {isLoading ? "Entrando..." : "Login"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Ainda não tem uma conta?{" "}
              <a href="./register" className="underline underline-offset-4">
                Cadastre-se
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
