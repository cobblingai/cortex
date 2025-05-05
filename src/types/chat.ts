import { z } from "zod";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const askTypeSchema = z.enum([
  "text",
  "image",
  "followup",
  "completion_result",
]);
export const tellTypeSchema = z.enum(["text", "completion_result"]);

export const uiMessageSchema = z.union([
  z.object({
    id: z.string(),
    type: z.literal("ask"),
    askType: askTypeSchema,
    content: z.string().optional(),
    isPartial: z.boolean().optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal("tell"),
    tellType: tellTypeSchema,
    content: z.string().optional(),
    isPartial: z.boolean().optional(),
  }),
]);

export type TellType = z.infer<typeof tellTypeSchema>;
export type AskType = z.infer<typeof askTypeSchema>;
export type UIMessage = z.infer<typeof uiMessageSchema>;
