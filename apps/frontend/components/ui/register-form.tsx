'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CreditCard } from "lucide-react";
import { PatternFormat } from 'react-number-format';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card" 
import { useState } from "react"
import { cn } from "@/lib/utils" 
import { User, Mail, Lock, Loader2 } from "lucide-react" 
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner" 


const formSchema = z.object({
name: z.string().min(2, "O nome precisa ter pelo menos 2 caracteres."),
email: z.string().email("E-mail inválido."),
tipoPessoa: z.string().min(1, "Selecione o tipo de pessoa."),
dataNascimento: z.string().min(10, "A data de nascimento precisa ter pelo menos 6 caracteres."),
cpfCnpj: z.string().min(11, "O CPF/CNPJ precisa ter pelo menos 11 caracteres."),
cep: z.string().min(8, "O CEP precisa ter pelo menos 8 caracteres."),
Cidade: z.string().min(11, "A cidade precisa ter pelo menos 11 caracteres."),
Estado: z.string().min(11, "O estado precisa ter pelo menos 11 caracteres."),
endereço: z.string().min(11, "O endereço precisa ter pelo menos 11 caracteres."),
numero: z.string().min(11, "O número precisa ter pelo menos 11 caracteres."),
complemento: z.string().min(11, "O complemento precisa ter pelo menos 11 caracteres."),
password: z.string().min(6, "A senha precisa ter no mínimo 6 caracteres."),
confirmPassword: z.string().min(6, "A confirmação de senha precisa ter no mínimo 6 caracteres."),

});

type RegisterFormData = z.infer<typeof formSchema>;

interface RequiredLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {
children: React.ReactNode;
}

const RequiredLabel = ({ children, ...props }: RequiredLabelProps) => (
<Label className="text-base font-medium" {...props}>
{children}
<span className="text-red-500 ml-1">*</span>
</Label>
);

export function RegisterForm() {
const [loading, setLoading] = useState(false);

const form = useForm<RegisterFormData>({
resolver: zodResolver(formSchema),
mode: "onSubmit",
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

const [cepLoading, setCepLoading] = useState(false);
const { setValue, getValues, watch, trigger } = form; 
const tipoPessoa = watch('tipoPessoa'); 

const handleCepBlur = async (cepValue: string) => {
const cep = cepValue?.replace(/\D/g, ''); 

if (!cep || cep.length !== 8) {

return;
}

setCepLoading(true);
try {
const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
const data = await response.json();

if (data.erro) {
console.warn('CEP não encontrado:', cep);

setValue("endereço", "");
setValue("Cidade", "");
setValue("Estado", "");
setValue("complemento", "");

} else {
setValue("endereço", data.logradouro || "");
setValue("Cidade", data.localidade || "");
setValue("Estado", data.uf || "");

if ((!getValues("complemento") && data.complemento) || data.complemento) {
setValue("complemento", data.complemento || "");
}
}
} catch (error) {
console.error('Erro ao buscar CEP:', error);
} finally {
setCepLoading(false);
}
};



const onSubmit = async (data: RegisterFormData) => {
setLoading(true);

try {
console.log("Dados de cadastro do administrador:", data);





await new Promise(resolve => setTimeout(resolve, 1500)); 
toast.success("Cadastro de administrador realizado com sucesso!");


} catch (error) {
console.error("Erro ao cadastrar administrador:", error);
toast.error("Ocorreu um erro ao cadastrar o administrador. Tente novamente.");
} finally {
setLoading(false);
}
};

return (
<div className="min-h-screen flex items-center justify-center py-10 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
<Card className="w-full max-w-md shadow-lg">
<CardHeader className="px-8 pt-8 pb-4 border-b">
<CardTitle className="text-3xl font-bold text-center">Cadastro de Administrador</CardTitle>
<CardDescription className="text-lg mt-1 text-center">
Crie uma conta para gerenciar o sistema
</CardDescription>
</CardHeader>

<CardContent className="px-8 py-8">
<Form {...form}>
<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
<div className="space-y-2.5">
<RequiredLabel htmlFor="name">Nome Completo</RequiredLabel>
<FormField
control={form.control}
name="name"
render={({ field, fieldState }) => (
<FormItem>
<FormControl>
<div className="relative">
<div className="absolute left-3 top-3">
  <User className="h-5 w-5 text-gray-500" />
</div>
<Input
  id="name"
  placeholder="Seu nome completo"
  className={cn(
    "h-12 pl-11",
    fieldState.error && "border-red-500 focus-visible:ring-red-500"
  )}
  autoComplete="name"
  {...field}
/>
</div>
</FormControl>
<FormMessage className="text-red-500" />
</FormItem>
)}
/>
</div>

<div className="space-y-2.5">
<RequiredLabel htmlFor="email">E-mail</RequiredLabel>
<FormField
control={form.control}
name="email"
render={({ field, fieldState }) => (
<FormItem>
<FormControl>
<div className="relative">
<div className="absolute left-3 top-3">
  <Mail className="h-5 w-5 text-gray-500" />
</div>
<Input
  id="email"
  type="email"
  placeholder="seu.email@exemplo.com"
  className={cn(
    "h-12 pl-11",
    fieldState.error && "border-red-500 focus-visible:ring-red-500"
  )}
  autoComplete="email"
  {...field}
/>
</div>
</FormControl>
<FormMessage className="text-red-500" />
</FormItem>
)}
/>
</div>

<div className="space-y-2.5">
<RequiredLabel htmlFor="dataNascimento">Data de Nascimento</RequiredLabel>
<FormField
control={form.control}
name="dataNascimento"
render={({ field, fieldState }) => (
<FormItem>
<FormControl>
<div className="relative">
<div className="absolute left-3 top-3">
  <Mail className="h-5 w-5 text-gray-500" />
</div>
<Input
  id="dataNascimento"
  type="date"
  placeholder="dd/mm/yyyy"
  className={cn(
    "h-12 pl-11",
    fieldState.error && "border-red-500 focus-visible:ring-red-500"
  )}
  autoComplete="data-birth"
  {...field}
/>
</div>
</FormControl>
<FormMessage className="text-red-500" />
</FormItem>
)}
/>
</div>

<div className="space-y-2.5">
<FormLabel className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pessoa</FormLabel>
<div className="flex space-x-2">
<Button
  type="button"
  variant={tipoPessoa === 'F' ? 'default' : 'outline'}
  onClick={() => {
    form.setValue('tipoPessoa', 'F', { shouldValidate: true });
    form.setValue('cpfCnpj', '', { shouldValidate: true });
  }}
  className="flex-1 h-12"
>
  Pessoa Física (CPF)
</Button>
<Button
  type="button"
  variant={tipoPessoa === 'J' ? 'default' : 'outline'}
  onClick={() => {
    form.setValue('tipoPessoa', 'J', { shouldValidate: true });
    form.setValue('cpfCnpj', '', { shouldValidate: true });
  }}
  className="flex-1 h-12"
>
  Pessoa Jurídica (CNPJ)
</Button>
</div>
</div>

<div className="space-y-2.5">
<RequiredLabel>{tipoPessoa === 'F' ? 'CPF' : 'CNPJ'}</RequiredLabel>
<FormField
control={form.control}
name="cpfCnpj"
render={({ field, fieldState }) => (
<FormItem>
<FormControl>
<div className="relative">
<div className="absolute left-3 top-3">
<CreditCard className="h-5 w-5" />
</div>
<PatternFormat
{...field}
format={tipoPessoa === 'F' ? '###.###.###-##' : '##.###.###/####-##'}
mask="_"
customInput={Input}
className={cn(
"h-12 pl-11",
fieldState.error && "border-red-500 focus-visible:ring-red-500"
)}
placeholder={tipoPessoa === 'F' ? 'Digite seu CPF' : 'Digite seu CNPJ'}
onBlur={() => trigger('cpfCnpj')}
/>
</div>
</FormControl>
<FormMessage className="text-red-500" />
</FormItem>
)}
/>
</div>

<div className="space-y-2.5">
<RequiredLabel htmlFor="cep">CEP</RequiredLabel>
<FormField
control={form.control}
name="cep"
render={({ field, fieldState }) => (
<FormItem>
<FormControl>
<div className="relative">
<div className="absolute left-3 top-3">
  <Mail className="h-5 w-5 text-gray-500" />
</div>
<Input
  id="cep"
  type="cep"
  placeholder="00000-000"
  className={cn(
    "h-12 pl-11",
    fieldState.error && "border-red-500 focus-visible:ring-red-500"
  )}
  autoComplete="postal-code"
  {...field}
  onBlur={() => {
    field.onBlur(); 
    handleCepBlur(field.value);
  }}
  disabled={cepLoading}
/>
</div>
</FormControl>
<FormMessage className="text-red-500" />
</FormItem>
)}
/>
</div>


<div className="space-y-2.5">
<RequiredLabel htmlFor="Cidade">Cidade</RequiredLabel>
<FormField
control={form.control}
name="Cidade"
render={({ field, fieldState }) => (
<FormItem>
<FormControl>
<div className="relative">
<div className="absolute left-3 top-3">
  <Mail className="h-5 w-5 text-gray-500" />
</div>
<Input
  id="Cidade"
  type="Cidade"
  placeholder="Cidade"
  className={cn(
    "h-12 pl-11",
    fieldState.error && "border-red-500 focus-visible:ring-red-500"
  )}
  autoComplete="Cidade"
  {...field}
/>
</div>
</FormControl>
<FormMessage className="text-red-500" />
</FormItem>
)}
/>
</div>


<div className="space-y-2.5">
<RequiredLabel htmlFor="Estado">Estado</RequiredLabel>
<FormField
control={form.control}
name="Estado"
render={({ field, fieldState }) => (
<FormItem>
<FormControl>
<div className="relative">
<div className="absolute left-3 top-3">
  <Mail className="h-5 w-5 text-gray-500" />
</div>
<Input
  id="Estado"
  type="Estado"
  placeholder="Estado"
  className={cn(
    "h-12 pl-11",
    fieldState.error && "border-red-500 focus-visible:ring-red-500"
  )}
  autoComplete="Estado"
  {...field}
/>
</div>
</FormControl>
<FormMessage className="text-red-500" />
</FormItem>
)}
/>
</div>


<div className="space-y-2.5">
<RequiredLabel htmlFor="endereço">Endereço</RequiredLabel>
<FormField
control={form.control}
name="endereço"
render={({ field, fieldState }) => (
<FormItem>
<FormControl>
<div className="relative">
<div className="absolute left-3 top-3">
  <Mail className="h-5 w-5 text-gray-500" />
</div>
<Input
  id="endereço"
  type="endereço"
  placeholder="Rua, Bairro, Cidade, Estado"
  className={cn(
    "h-12 pl-11",
    fieldState.error && "border-red-500 focus-visible:ring-red-500"
  )}
  autoComplete="endereço"
  {...field}
/>
</div>
</FormControl>
<FormMessage className="text-red-500" />
</FormItem>
)}
/>
</div>



<div className="space-y-2.5">
<RequiredLabel htmlFor="numero">Número</RequiredLabel>
<FormField
control={form.control}
name="numero"
render={({ field, fieldState }) => (
<FormItem>
<FormControl>
<div className="relative">
<div className="absolute left-3 top-3">
  <Mail className="h-5 w-5 text-gray-500" />
</div>
<Input
  id="numero"
  type="numero"
  placeholder="Número"
  className={cn(
    "h-12 pl-11",
    fieldState.error && "border-red-500 focus-visible:ring-red-500"
  )}
  autoComplete="numero"
  {...field}
/>
</div>
</FormControl>
<FormMessage className="text-red-500" />
</FormItem>
)}
/>
</div>


<div className="space-y-2.5">
<RequiredLabel htmlFor="complemento">Complemento</RequiredLabel>
<FormField
control={form.control}
name="complemento"
render={({ field, fieldState }) => (
<FormItem>
<FormControl>
<div className="relative">
<div className="absolute left-3 top-3">
  <Mail className="h-5 w-5 text-gray-500" />
</div>
<Input
  id="complemento"
  type="complemento"
  placeholder="Complemento"
  className={cn(
    "h-12 pl-11",
    fieldState.error && "border-red-500 focus-visible:ring-red-500"
  )}
  autoComplete="complemento"
  {...field}
/>
</div>
</FormControl>
<FormMessage className="text-red-500" />
</FormItem>
)}
/>
</div>

<div className="space-y-2.5">
<RequiredLabel htmlFor="password">Senha</RequiredLabel>
<FormField
control={form.control}
name="password"
render={({ field, fieldState }) => (
<FormItem>
<FormControl>
<div className="relative">
<div className="absolute left-3 top-3">
  <Lock className="h-5 w-5 text-gray-500" />
</div>
<Input
  id="password"
  type="password"
  placeholder="••••••••"
  className={cn(
    "h-12 pl-11",
    fieldState.error && "border-red-500 focus-visible:ring-red-500"
  )}
  autoComplete="new-password"
  {...field}
/>
</div>
</FormControl>
<FormMessage className="text-red-500" />
</FormItem>
)}
/>
</div>

<div className="space-y-2.5">
<RequiredLabel htmlFor="confirmPassword">Confirmar a Senha</RequiredLabel>
<FormField
control={form.control}
name="confirmPassword"
render={({ field, fieldState }) => (
<FormItem>
<FormControl>
<div className="relative">
<div className="absolute left-3 top-3">
  <Lock className="h-5 w-5 text-gray-500" />
</div>
<Input
  id="confirmPassword"
  type="password"
  placeholder="••••••••"
  className={cn(
    "h-12 pl-11",
    fieldState.error && "border-red-500 focus-visible:ring-red-500"
  )}
  autoComplete="new-password"
  {...field}
/>
</div>
</FormControl>
<FormMessage className="text-red-500" />
</FormItem>
)}
/>
</div>

<Button type="submit" className="w-full h-12 text-lg mt-4" disabled={loading}>
{loading ? (
<>
<Loader2 className="mr-2 h-5 w-5 animate-spin" />
Cadastrando...
</>
) : (
"Cadastrar"
)}
</Button>
</form>
</Form>
</CardContent>

<CardFooter className="px-8 pb-8 pt-4 text-center text-base">
Já tem uma conta?{" "}
<a href="/login" className="underline underline-offset-4 font-medium text-primary hover:text-primary/90 ml-1">
Faça login
</a>
</CardFooter>
</Card>
</div>
);
}