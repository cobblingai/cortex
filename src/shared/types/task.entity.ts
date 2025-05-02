import { z } from "zod";

export const taskDTOSchema = z.object({
  id: z.string(),
  status: z.enum(["initialized", "running", "completed", "failed"]),
});

export type TaskDTO = z.infer<typeof taskDTOSchema>;
