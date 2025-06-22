"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthApi } from "@/hooks/useAuthApi";
import Link from "next/link";

// Schema para o reset de senha
const resetPasswordSchema = z.object({
  email: z.string().email("E-mail inválido."),
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export function ChangePass({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isSuccessful, setIsSuccessful] = useState(false);

  const { resetPassword, isLoading } = useAuthApi();

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetPasswordData) => {
    try {
      await resetPassword(data);

      setIsSuccessful(true);
      toast.success(
        "Instruções de redefinição de senha foram enviadas para seu e-mail!",
      );
    } catch (error: any) {
      toast.error(
        error.message ||
          "Erro ao solicitar redefinição de senha. Tente novamente.",
      );
    }
  };

  if (isSuccessful) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>Redefinição Solicitada</CardTitle>
            <CardDescription>
              Instruções foram enviadas para seu e-mail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Verificque sua caixa de entrada e siga as instruções para
                redefinir sua senha.
              </p>
              <Link href="/login">
                <Button className="w-full">Voltar para Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Redefinir Senha</CardTitle>
          <CardDescription>
            Digite seu e-mail para receber instruções de redefinição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Redefinir Senha"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            Lembrou da senha?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Voltar para login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
