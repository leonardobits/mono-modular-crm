import { z } from "zod";

// Schema para o fluxo de **Registro do Administrador Inicial**
export const initialAdminRegisterSchema = z.object({
  fullName: z.string().min(3).max(100),
  email: z.string().email(),
  role: z.enum(["ADMIN", "MANAGER", "AGENT"]),
});

// Schema para **Criação de Usuário pelo Admin** (com campos modernos)
export const createUserSchema = z
  .object({
    name: z.string().min(2, "O nome precisa ter pelo menos 2 caracteres."),
    email: z.string().email("E-mail inválido."),
    role: z.enum(["ADMIN", "MANAGER", "AGENT"]),
    tipoPessoa: z.enum(["F", "J"]).optional(),
    dataNascimento: z.string().optional(),
    cpfCnpj: z.string().optional(),
    cep: z.string().optional(),
    endereco: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres.")
      .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
      .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
      .regex(/[0-9]/, "A senha deve conter pelo menos um número.")
      .regex(
        /[^a-zA-Z0-9]/,
        "A senha deve conter pelo menos um caractere especial.",
      ),
    confirmPassword: z.string().min(8, "A confirmação de senha é obrigatória."),
    sendWelcomeEmail: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
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
export type InitialAdminRegisterSchema = z.infer<
  typeof initialAdminRegisterSchema
>;
export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
