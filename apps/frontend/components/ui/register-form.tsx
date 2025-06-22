"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PatternFormat } from "react-number-format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { toast } from "sonner";
import Link from "next/link";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const formSchema = z
  .object({
    name: z.string().min(2, "O nome precisa ter pelo menos 2 caracteres."),
    email: z.string().email("E-mail inválido."),
    tipoPessoa: z.string().min(1, "Selecione o tipo de pessoa."),
    dataNascimento: z
      .string()
      .min(10, "A data de nascimento precisa ter pelo menos 6 caracteres."),
    cpfCnpj: z
      .string()
      .min(11, "O CPF/CNPJ precisa ter pelo menos 11 caracteres."),
    cep: z.string().min(8, "O CEP precisa ter pelo menos 8 caracteres."),
    Cidade: z.string().min(1, "A cidade é obrigatória."),
    Estado: z.string().min(1, "O estado é obrigatório."),
    endereço: z.string().min(1, "O endereço é obrigatório."),
    numero: z.string().min(1, "O número é obrigatório."),
    complemento: z.string().optional(),
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres.")
      .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
      .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
      .regex(/[0-9]/, "A senha deve conter pelo menos um número.")
      .regex(
        /[^a-zA-Z0-9]/,
        "A senha deve conter pelo menos um caractere especial.",
      ),
    confirmPassword: z.string().min(8, "A confirmação de senha é obrigatória."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof formSchema>;

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      tipoPessoa: "F",
      dataNascimento: "",
      cpfCnpj: "",
      cep: "",
      Cidade: "",
      Estado: "",
      endereço: "",
      numero: "",
      complemento: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { setValue, getValues, watch } = form;
  const tipoPessoa = watch("tipoPessoa");
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

  const handleCepBlur = async (cepValue: string) => {
    const cep = cepValue?.replace(/\D/g, "");
    if (!cep || cep.length !== 8) return;

    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado.");
        setValue("endereço", "");
        setValue("Cidade", "");
        setValue("Estado", "");
        setValue("complemento", "");
      } else {
        setValue("endereço", data.logradouro || "");
        setValue("Cidade", data.localidade || "");
        setValue("Estado", data.uf || "");
        if (
          (!getValues("complemento") && data.complemento) ||
          data.complemento
        ) {
          setValue("complemento", data.complemento || "");
        }
      }
    } catch (error) {
      toast.error("Erro ao buscar CEP. Verifique sua conexão.");
    } finally {
      setCepLoading(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    if (shouldValidateCaptcha) {
      toast.error("Por favor, complete a verificação de segurança.");
      return;
    }

    setLoading(true);
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const registerData = {
        name: data.name,
        email: data.email,
        password: data.password,
        tipoPessoa: data.tipoPessoa,
        dataNascimento: data.dataNascimento,
        cpfCnpj: data.cpfCnpj,
        cep: data.cep,
        cidade: data.Cidade,
        estado: data.Estado,
        endereco: data.endereço,
        numero: data.numero,
        complemento: data.complemento,
        captchaToken: captchaToken,
      };

      const response = await fetch(`${backendUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erro no cadastro");
      }

      toast.success("Cadastro de administrador realizado com sucesso!");
      form.reset();
      setCaptchaToken(null);
    } catch (error: any) {
      console.error("Erro ao cadastrar administrador:", error);
      toast.error(
        error.message ||
          "Ocorreu um erro ao cadastrar o administrador. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Crie sua conta</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para criar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
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
                        placeholder="seu.email@exemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Data Nascimento */}
              <FormField
                control={form.control}
                name="dataNascimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipo Pessoa e CPF/CNPJ */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipoPessoa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      {/* TODO: Substituir por um Select component */}
                      <select
                        {...field}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="F">Física</option>
                        <option value="J">Jurídica</option>
                      </select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cpfCnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {tipoPessoa === "F" ? "CPF" : "CNPJ"}
                      </FormLabel>
                      <FormControl>
                        <PatternFormat
                          format={
                            tipoPessoa === "F"
                              ? "###.###.###-##"
                              : "##.###.###/####-##"
                          }
                          customInput={Input}
                          placeholder={
                            tipoPessoa === "F"
                              ? "000.000.000-00"
                              : "00.000.000/0000-00"
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* CEP */}
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <PatternFormat
                          format="#####-###"
                          customInput={Input}
                          placeholder="00000-000"
                          {...field}
                          onBlur={(e) => handleCepBlur(e.target.value)}
                        />
                        {cepLoading && (
                          <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Endereco e Numero */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="endereço"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Sua rua, avenida..."
                            {...field}
                            disabled={cepLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="Nº" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Complemento */}
              <FormField
                control={form.control}
                name="complemento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Apto, bloco, casa..."
                        {...field}
                        disabled={cepLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cidade e Estado */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="Cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Sua cidade"
                          {...field}
                          disabled={cepLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="UF"
                          {...field}
                          disabled={cepLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Senhas */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1
                      especial.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className={cn(
                          fieldState.error &&
                            "border-destructive focus-visible:ring-destructive",
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3">
                {isCaptchaEnabled && (
                  <div className="flex justify-center">
                    <HCaptcha
                      sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
                      onVerify={setCaptchaToken}
                    />
                  </div>
                )}

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
                  disabled={loading || shouldValidateCaptcha}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Criar Conta"
                  )}
                </Button>
              </div>
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
