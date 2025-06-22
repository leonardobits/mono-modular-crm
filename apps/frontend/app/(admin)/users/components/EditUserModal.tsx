"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "@/types/user";
import { UpdateUserForm } from "./UpdateUserForm";

interface EditUserModalProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export function EditUserModal({
  user,
  open,
  onOpenChange,
  onUserUpdated,
}: EditUserModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Altere os dados de {user.full_name}. Clique em salvar para aplicar
            as mudanças.
          </DialogDescription>
        </DialogHeader>
        <UpdateUserForm initialData={user} onSubmitSuccess={onUserUpdated} />
      </DialogContent>
    </Dialog>
  );
}
