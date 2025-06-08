'use client'
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

const handleSubmit = (e: any) =>{
  e.preventDefault();
  
  const payload = {
    email: e.target.email.value,
    password: e.target.password.value,
  }

  fetch("http://localhost:3000/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
 })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        console.log(data.error)
      } else {
        console.log(data)
      }
    })
}

export function ChangePass({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Redefinir Senha</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Redefinir Senha
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

