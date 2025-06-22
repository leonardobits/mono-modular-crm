"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { User } from "@/types/user";
import { UserActions } from "./UserActions";

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
      );
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
      );
    },
  },
  {
    accessorKey: "role",
    header: "Cargo",
    cell: ({ row }) => {
      const roleMap = {
        ADMIN: "Administrador",
        MANAGER: "Gerente",
        AGENT: "Atendente",
      };
      return (
        roleMap[row.getValue("role") as keyof typeof roleMap] ||
        row.getValue("role")
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusMap = {
        ACTIVE: "Ativo",
        INACTIVE: "Inativo",
      };
      return (
        statusMap[row.getValue("status") as keyof typeof statusMap] ||
        row.getValue("status")
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const user = row.original;
      const { updateUserStatus, handleEditUser } = table.options.meta as {
        updateUserStatus: (
          id: string,
          status: "ACTIVE" | "INACTIVE",
        ) => Promise<any>;
        handleEditUser: (user: User) => void;
      };

      return (
        <UserActions
          user={user}
          updateUserStatus={updateUserStatus}
          handleEditUser={handleEditUser}
        />
      );
    },
  },
];
