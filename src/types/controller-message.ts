import { z } from "zod";
import { ApiProvider } from "@/types/api/index.js";

const apiProviderSchema: z.ZodType<ApiProvider> = z.enum(["anthropic"]);

export const initializeTaskSchema = z.object({
  id: z.string(),
  type: z.literal("initialize-task"),
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
});

export const controllerMessageSchema = z.union([
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

export type InitializeTaskMessage = z.infer<typeof initializeTaskSchema>;
export type ControllerMessage = z.infer<typeof controllerMessageSchema>;
