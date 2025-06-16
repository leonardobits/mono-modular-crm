"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "@/types/user"

// Define as colunas da tabela
export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "full_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "role",
    header: "Cargo",
    cell: ({ row }) => {
      const roleMap = {
        'ADMIN': 'Administrador',
        'MANAGER': 'Gerente',
        'AGENT': 'Atendente'
      };
      return roleMap[row.getValue("role") as keyof typeof roleMap] || row.getValue("role");
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusMap = {
        'ACTIVE': 'Ativo',
        'INACTIVE': 'Inativo'
      };
      return statusMap[row.getValue("status") as keyof typeof statusMap] || row.getValue("status");
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const user = row.original
      const { updateUserStatus, handleEditUser } = table.options.meta as {
        updateUserStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') => Promise<any>;
        handleEditUser: (user: User) => void;
      }

      const handleToggleStatus = () => {
        const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const action = newStatus === 'INACTIVE' ? 'desativar' : 'reativar';
        const userName = user.full_name;
        
        if (window.confirm(`Tem certeza que deseja ${action} o usuário "${userName}"?\n\nEsta ação pode ser revertida posteriormente.`)) {
          updateUserStatus(user.id, newStatus)
            .then(() => {
              // Sucesso já é tratado no hook com toast
            })
            .catch((error) => {
              console.error(`Erro ao ${action} usuário:`, error);
            });
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-primary hover:text-primary">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copiar ID do Usuário
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditUser(user)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleToggleStatus}
              className={user.status === 'ACTIVE' ? "text-destructive focus:text-destructive" : "text-primary focus:text-primary"}
            >
              {user.status === 'ACTIVE' ? 'Desativar' : 'Reativar'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]