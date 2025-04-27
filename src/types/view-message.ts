import { z } from "zod";
import { ApiProvider } from "@/types/api/index.js";

const apiProviderSchema: z.ZodType<ApiProvider> = z.enum(["anthropic"]);

export const viewMessageSchema = z.union([
  z.object({
    id: z.string(),
    type: z.literal("new-task"),
    payload: z.object({
      text: z.string(),
      images: z.array(z.string()),
      context: z.object({
        model: z.string(),
        apiKey: z.string(),
        apiProvider: apiProviderSchema,
      }),
    }),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal("clear-task"),
    payload: z.object({
      taskId: z.string(),
    }),
  }),
]);

export type ViewMessage = z.infer<typeof viewMessageSchema>;
