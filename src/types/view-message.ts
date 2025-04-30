import { z } from "zod";
import { uiMessageSchema } from "./chat.js";

export const appStateSchema = z.object({
  uiMessages: z.array(uiMessageSchema),
});

export const viewMessageSchema = z.union([
  z.object({
    type: z.literal("state"),
    payload: z.object({
      state: appStateSchema,
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
  z.object({
    type: z.literal("partial"),
    payload: z.object({
      partial: uiMessageSchema,
    }),
  }),
]);

export const askQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  selected: z.string().optional(),
});

export type AppState = z.infer<typeof appStateSchema>;
export type ViewMessage = z.infer<typeof viewMessageSchema>;
export type AskQuestion = z.infer<typeof askQuestionSchema>;
