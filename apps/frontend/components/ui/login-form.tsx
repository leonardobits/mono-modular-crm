"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
Card,
CardContent,
CardDescription,
CardHeader,
CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { useState } from "react"


export function LoginForm({
className,
...props
}: React.ComponentProps<"div">) {

const [captchaToken, setCaptchaToken] = useState<string | null>(null) 

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
<form>
<div className="flex flex-col gap-6">
<div className="grid gap-3">
<Label htmlFor="email">E-mail</Label>
<Input
id="email"
type="email"
placeholder="m@exemplo.com"
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
<Input id="password" type="password" required />
</div>
<div className="flex flex-col gap-3">
<center> <HCaptcha
sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ? process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY : ""}
onVerify={(token) => setCaptchaToken(token)}
/></center>
<Button type="submit" className="w-full">
Login 
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
)
}
