import { z } from 'zod';

// ---------------------------------------------------------------------------
// Tool Definition Schema
// ---------------------------------------------------------------------------

export const ToolParameterSchema = z.object({
  type: z.enum(['string', 'number', 'boolean', 'integer', 'array', 'object']),
  description: z.string().optional(),
  enum: z.array(z.union([z.string(), z.number()])).optional(),
});

export const ToolSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  parameters: z.record(z.string(), ToolParameterSchema).optional(),
  required: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// Chat Message Schemas
// ---------------------------------------------------------------------------

export const SystemMessageSchema = z.object({
  role: z.literal('system'),
  content: z.string(),
});

export const UserMessageSchema = z.object({
  role: z.literal('user'),
  content: z.string(),
});

export const ToolCallSchema = z.object({
  id: z.string(),
  type: z.literal('function'),
  function: z.object({
    name: z.string(),
    arguments: z.string(), // JSON string
  }),
});

export const AssistantMessageSchema = z.object({
  role: z.literal('assistant'),
  content: z.string().nullable(),
  tool_calls: z.array(ToolCallSchema).optional(),
});

export const ToolResultMessageSchema = z.object({
  role: z.literal('tool'),
  tool_call_id: z.string(),
  content: z.string(),
});

export const ChatMessageSchema = z.union([
  SystemMessageSchema,
  UserMessageSchema,
  AssistantMessageSchema,
  ToolResultMessageSchema,
]);

export const ChatHistorySchema = z.array(ChatMessageSchema);
