import { z } from "zod";

const signUpVSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(2, "Username must be at least 2 character long")
      .max(15, "Username is too long"),
    email: z.string().trim().email("Invalid email format").lowercase(),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .strict();

const logInVSchema = z
  .object({
    username: z.string().trim().optional(),
    email: z
      .string()
      .trim()
      .email("Invalid email format")
      .lowercase()
      .optional(),
    password: z.string().min(6, "Password is at least 6 characters"),
  })
  .strict()
  .refine((data) => data.email || data.username, {
    message: "Please provide either a username or an email",
    path: ["username/email"],
  });

export { signUpVSchema, logInVSchema };
