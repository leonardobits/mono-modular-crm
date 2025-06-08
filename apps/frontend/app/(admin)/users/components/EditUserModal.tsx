"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UpdateUserForm } from "./UpdateUserForm"
import { User } from "@/types/user"

interface EditUserModalProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserModal({ user, open, onOpenChange }: EditUserModalProps) {
  
  const handleSuccess = () => {
    onOpenChange(false); // Fecha o modal em caso de sucesso
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Faça alterações no perfil do usuário aqui. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <UpdateUserForm 
          initialData={user} 
          onSubmitSuccess={handleSuccess} 
        />
      </DialogContent>
    </Dialog>
  )
} 