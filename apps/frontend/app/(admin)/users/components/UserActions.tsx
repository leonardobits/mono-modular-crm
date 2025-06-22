"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { User } from "@/types/user";

interface UserActionsProps {
  user: User;
  updateUserStatus: (id: string, status: "ACTIVE" | "INACTIVE") => Promise<any>;
  handleEditUser: (user: User) => void;
}

export function UserActions({
  user,
  updateUserStatus,
  handleEditUser,
}: UserActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  const action = newStatus === "INACTIVE" ? "desativar" : "reativar";
  const actionColor = newStatus === "INACTIVE" ? "destructive" : "default";

  const handleToggleStatus = () => {
    updateUserStatus(user.id, newStatus)
      .then(() => {
        // Sucesso já é tratado no hook com toast
      })
      .catch((error) => {
        console.error(`Erro ao ${action} usuário:`, error);
      });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 text-primary hover:text-primary"
          >
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleEditUser(user)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setConfirmOpen(true)}
            className={
              user.status === "ACTIVE"
                ? "text-destructive focus:text-destructive"
                : "text-primary focus:text-primary"
            }
          >
            {user.status === "ACTIVE" ? "Desativar" : "Reativar"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleToggleStatus}
        title={`${action === "desativar" ? "Desativar" : "Reativar"} usuário`}
        description={`Tem certeza que deseja ${action} o usuário "${user.full_name}"? Esta ação pode ser revertida posteriormente.`}
        confirmText={action === "desativar" ? "Desativar" : "Reativar"}
        variant={actionColor}
      />
    </>
  );
}
