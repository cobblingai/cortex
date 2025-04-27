import { z } from "zod";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const uiMessageSchema = z.union([
  z.object({
    type: z.literal("ask"),
    askType: z.enum(["text", "image"]),
    content: z.string(),
  }),
  z.object({
    type: z.literal("tell"),
    tellType: z.enum(["text", "image"]),
    content: z.string(),
  }),
]);

export type UIMessage = z.infer<typeof uiMessageSchema>;
