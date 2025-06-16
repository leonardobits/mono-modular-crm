'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import Link from "next/link"
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { useAuthApi } from "@/hooks/useAuthApi"
import { useRouter } from "next/navigation"

// Schema baseado no PRD - registro inicial do administrador
const formSchema = z.object({
  fullName: z.string().min(3, "O nome completo deve ter pelo menos 3 caracteres."),
  email: z.string().email("E-mail inválido."),
  role: z.enum(["ADMIN", "MANAGER", "AGENT"], {
    required_error: "Selecione um cargo.",
  }),
});

type RegisterFormData = z.infer<typeof formSchema>;

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  
  const { register, isLoading } = useAuthApi();
  const router = useRouter();

  // Controle do hCaptcha baseado no ambiente
  const isCaptchaEnabled = process.env.NODE_ENV === 'production' && !!process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
  const shouldValidateCaptcha = isCaptchaEnabled && !captchaToken;

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      role: "ADMIN", // Default para registro inicial do administrador
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    // Validar captcha apenas se estiver habilitado
    if (shouldValidateCaptcha) {
      toast.error("Por favor, complete a verificação de segurança.");
      return;
    }

    try {
      const result = await register(data);
      
      toast.success("Administrador registrado com sucesso! Você já pode fazer login.");
      
      // Redirecionar para página de login após registro bem-sucedido
      router.push("/login");
      
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar administrador. Tente novamente.");
    }
  };

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Registrar Primeiro Administrador</CardTitle>
          <CardDescription>
            Configure a conta inicial do administrador do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              {/* Nome Completo */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Seu nome completo" 
                        disabled={isLoading}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="seu.email@empresa.com" 
                        disabled={isLoading}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cargo/Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cargo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                        <SelectItem value="MANAGER">Gerente</SelectItem>
                        <SelectItem value="AGENT">Agente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Como este é o primeiro usuário, recomendamos selecionar "Administrador".
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* hCaptcha - apenas em produção */}
              {isCaptchaEnabled && (
                <div className="flex justify-center">
                  <HCaptcha
                    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
                    onVerify={setCaptchaToken}
                  />
                </div>
              )}
              
              {/* Aviso em desenvolvimento */}
              {!isCaptchaEnabled && process.env.NODE_ENV === 'development' && (
                <div className="text-sm text-muted-foreground text-center bg-muted p-2 rounded">
                  💡 hCaptcha desabilitado em desenvolvimento
                </div>
              )}

              {/* Botão de Submit */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || shouldValidateCaptcha}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar Administrador"
                )}
              </Button>
            </form>
          </Form>
          
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Fazer login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}