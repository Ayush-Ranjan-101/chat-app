import { z } from "zod";

export const messageValidationSchema = z
  .object({
    text: z.string().trim().optional(),
    image: z.string().optional(),
  })
  .refine((data) => data.text || data.image, {
    message: "Message must contain either text or an image",
    path: ["text"], // This points the error to the 'text' field
  });
