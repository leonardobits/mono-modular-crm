import { z } from "zod";

// Schema para o fluxo de **Registro do Administrador Inicial**
export const initialAdminRegisterSchema = z.object({
  fullName: z.string().min(3).max(100),
  email: z.string().email(),
  role: z.enum(["ADMIN", "MANAGER", "AGENT"]),
});

// Schema para **Criação de Usuário pelo Admin** (mantendo compatibilidade)
export const createUserSchema = z.object({
  fullName: z.string().min(3).max(100),
  email: z.string().email(),
  role: z.enum(["ADMIN", "MANAGER", "AGENT"]),
});

// Schema para **Atualização de Usuário pelo Admin**
export const updateUserSchema = z.object({
  fullName: z.string().min(3).max(100).optional(),
  email: z.string().email().optional(), // A lógica de serviço deve lidar com a atualização no auth.users
  role: z.enum(["ADMIN", "MANAGER", "AGENT"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  // Campos de endereço como opcionais
  zip_code: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

// Types para TypeScript
export type InitialAdminRegisterSchema = z.infer<typeof initialAdminRegisterSchema>;
export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>; 