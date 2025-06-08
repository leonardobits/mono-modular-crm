"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateUserForm } from "./CreateUserForm";

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}

export function CreateUserModal({
  open,
  onOpenChange,
  onUserCreated,
}: CreateUserModalProps) {
  const handleSuccess = () => {
    onUserCreated();
    onOpenChange(false); // Fecha o modal em caso de sucesso
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para criar um novo usuário. Clique em
            salvar para finalizar.
          </DialogDescription>
        </DialogHeader>
        <CreateUserForm onSubmitSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
} 