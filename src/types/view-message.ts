import { z } from "zod";
import { uiMessageSchema } from "./chat.js";

export const viewMessageSchema = z.union([
  z.object({
    type: z.literal("state"),
    payload: z.object({
      state: z.object({
        uiMessages: z.array(uiMessageSchema),
      }),
    }),
  }),
  z.object({
    type: z.literal("action"),
    payload: z.object({
      action: z.string(),
    }),
  }),
  z.object({
    type: z.literal("ask-for-api-key"),
    payload: z.object({
      service: z.enum(["openai", "anthropic"]),
    }),
  }),
]);

export type ViewMessage = z.infer<typeof viewMessageSchema>;
