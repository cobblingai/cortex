import { z } from "zod";

export const controllerMessageSchema = z.union([
  z.object({
    type: z.literal("state"),
    payload: z.object({
      state: z.string(),
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

export type ControllerMessage = z.infer<typeof controllerMessageSchema>;
