import {
  channelSchema,
  createChannelSchema,
  updateChannelSchema,
  inboxSchema,
  createInboxSchema,
  updateInboxSchema,
  inboxAgentSchema,
  createInboxAgentSchema,
  updateInboxAgentSchema,
} from "./inbox.schema";

describe("Channel Schemas", () => {
  describe("channelSchema", () => {
    it("should validate a valid channel", () => {
      const validChannel = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Website Chat",
        type: "website",
        description: "Main website chat channel",
        is_active: true,
        created_at: "2023-06-23T10:00:00Z",
        updated_at: "2023-06-23T10:00:00Z",
      };

      expect(() => channelSchema.parse(validChannel)).not.toThrow();
    });

    it("should reject invalid channel type", () => {
      const invalidChannel = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Invalid Channel",
        type: "invalid_type",
        is_active: true,
        created_at: "2023-06-23T10:00:00Z",
        updated_at: "2023-06-23T10:00:00Z",
      };

      expect(() => channelSchema.parse(invalidChannel)).toThrow();
    });
  });

  describe("createChannelSchema", () => {
    it("should validate channel creation data", () => {
      const createData = {
        name: "WhatsApp Business",
        type: "whatsapp",
        description: "WhatsApp Business API integration",
      };

      expect(() => createChannelSchema.parse(createData)).not.toThrow();
    });

    it("should reject empty channel name", () => {
      const createData = {
        name: "",
        type: "whatsapp",
      };

      expect(() => createChannelSchema.parse(createData)).toThrow();
    });
  });
});

describe("Inbox Schemas", () => {
  describe("inboxSchema", () => {
    it("should validate a valid inbox", () => {
      const validInbox = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Support Inbox",
        channel_id: "123e4567-e89b-12d3-a456-426614174001",
        settings: { auto_assign: true },
        is_active: true,
        created_at: "2023-06-23T10:00:00Z",
        updated_at: "2023-06-23T10:00:00Z",
      };

      expect(() => inboxSchema.parse(validInbox)).not.toThrow();
    });
  });

  describe("createInboxSchema", () => {
    it("should validate inbox creation data", () => {
      const createData = {
        name: "Customer Support",
        channel_id: "123e4567-e89b-12d3-a456-426614174001",
        settings: { priority: "high" },
      };

      expect(() => createInboxSchema.parse(createData)).not.toThrow();
    });

    it("should reject invalid UUID for channel_id", () => {
      const createData = {
        name: "Customer Support",
        channel_id: "invalid-uuid",
      };

      expect(() => createInboxSchema.parse(createData)).toThrow();
    });
  });
});

describe("InboxAgent Schemas", () => {
  describe("inboxAgentSchema", () => {
    it("should validate a valid inbox agent assignment", () => {
      const validAssignment = {
        inbox_id: "123e4567-e89b-12d3-a456-426614174000",
        user_id: "123e4567-e89b-12d3-a456-426614174001",
        role: "AGENT",
        created_at: "2023-06-23T10:00:00Z",
      };

      expect(() => inboxAgentSchema.parse(validAssignment)).not.toThrow();
    });
  });

  describe("createInboxAgentSchema", () => {
    it("should validate inbox agent creation data", () => {
      const createData = {
        inbox_id: "123e4567-e89b-12d3-a456-426614174000",
        user_id: "123e4567-e89b-12d3-a456-426614174001",
        role: "ADMIN",
      };

      expect(() => createInboxAgentSchema.parse(createData)).not.toThrow();
    });

    it("should default to AGENT role", () => {
      const createData = {
        inbox_id: "123e4567-e89b-12d3-a456-426614174000",
        user_id: "123e4567-e89b-12d3-a456-426614174001",
      };

      const parsed = createInboxAgentSchema.parse(createData);
      expect(parsed.role).toBe("AGENT");
    });

    it("should reject invalid role", () => {
      const createData = {
        inbox_id: "123e4567-e89b-12d3-a456-426614174000",
        user_id: "123e4567-e89b-12d3-a456-426614174001",
        role: "INVALID_ROLE",
      };

      expect(() => createInboxAgentSchema.parse(createData)).toThrow();
    });
  });
});