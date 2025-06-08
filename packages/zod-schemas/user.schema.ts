import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  cargo: z.enum(["ADMINISTRADOR", "GERENTE", "ATENDENTE"]),
});

export const updateUserSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  email: z.string().email().optional(),
  cargo: z.enum(["ADMINISTRADOR", "GERENTE", "ATENDENTE"]).optional(),
  status: z.enum(["ATIVO", "INATIVO"]).optional(),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>; 