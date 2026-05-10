import { z } from "zod";

export const messageValidationSchema = z.object({
  text: z.string().trim().optional(),
});
