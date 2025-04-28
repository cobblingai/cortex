import { z } from "zod";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const askTypeSchema = z.enum(["text", "image"]);
export const tellTypeSchema = z.enum(["text", "image"]);

export const uiMessageSchema = z.union([
  z.object({
    type: z.literal("ask"),
    askType: askTypeSchema,
    content: z.string(),
  }),
  z.object({
    type: z.literal("tell"),
    tellType: tellTypeSchema,
    content: z.string(),
  }),
]);

export type TellType = z.infer<typeof tellTypeSchema>;
export type AskType = z.infer<typeof askTypeSchema>;
export type UIMessage = z.infer<typeof uiMessageSchema>;
