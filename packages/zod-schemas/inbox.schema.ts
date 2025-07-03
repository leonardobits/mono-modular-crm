import { z } from "zod";

export const channelSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nome do canal é obrigatório"),
  type: z.enum(["website", "messenger", "whatsapp", "sms", "email", "api", "telegram", "line"]),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const createChannelSchema = z.object({
  name: z.string().min(1, "Nome do canal é obrigatório"),
  type: z.enum(["website", "messenger", "whatsapp", "sms", "email", "api", "telegram", "line"]),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

export const updateChannelSchema = z.object({
  name: z.string().min(1, "Nome do canal é obrigatório").optional(),
  type: z.enum(["website", "messenger", "whatsapp", "sms", "email", "api", "telegram", "line"]).optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

export const inboxSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nome da inbox é obrigatório"),
  channel_id: z.string().uuid(),
  settings: z.record(z.any()).default({}),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const createInboxSchema = z.object({
  name: z.string().min(1, "Nome da inbox é obrigatório"),
  channel_id: z.string().uuid("ID do canal deve ser um UUID válido"),
  settings: z.record(z.any()).default({}),
  is_active: z.boolean().default(true),
});

export const updateInboxSchema = z.object({
  name: z.string().min(1, "Nome da inbox é obrigatório").optional(),
  channel_id: z.string().uuid("ID do canal deve ser um UUID válido").optional(),
  settings: z.record(z.any()).optional(),
  is_active: z.boolean().optional(),
});

export const inboxAgentSchema = z.object({
  inbox_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(["ADMIN", "AGENT"]).default("AGENT"),
  created_at: z.string().datetime(),
});

export const createInboxAgentSchema = z.object({
  inbox_id: z.string().uuid("ID da inbox deve ser um UUID válido"),
  user_id: z.string().uuid("ID do usuário deve ser um UUID válido"),
  role: z.enum(["ADMIN", "AGENT"]).default("AGENT"),
});

export const updateInboxAgentSchema = z.object({
  role: z.enum(["ADMIN", "AGENT"]).optional(),
});

export const inboxWithChannelSchema = inboxSchema.extend({
  channel: channelSchema,
});

export const inboxWithAgentsSchema = inboxSchema.extend({
  agents: z.array(inboxAgentSchema),
});

export type Channel = z.infer<typeof channelSchema>;
export type CreateChannel = z.infer<typeof createChannelSchema>;
export type UpdateChannel = z.infer<typeof updateChannelSchema>;

export type Inbox = z.infer<typeof inboxSchema>;
export type CreateInbox = z.infer<typeof createInboxSchema>;
export type UpdateInbox = z.infer<typeof updateInboxSchema>;

export type InboxAgent = z.infer<typeof inboxAgentSchema>;
export type CreateInboxAgent = z.infer<typeof createInboxAgentSchema>;
export type UpdateInboxAgent = z.infer<typeof updateInboxAgentSchema>;

export type InboxWithChannel = z.infer<typeof inboxWithChannelSchema>;
export type InboxWithAgents = z.infer<typeof inboxWithAgentsSchema>;