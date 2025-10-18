import { z } from "zod"

//  Common password rules
const passwordRules = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")

//  Allowed domains for email
const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]
const isAllowedEmail = (email: string) => {
  const domain = email.split("@")[1]
  return allowedDomains.includes(domain)
}

//  Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .refine(isAllowedEmail, "Only Gmail, Yahoo, Outlook, or Hotmail emails are allowed"),
  password: passwordRules,
})
export type LoginFormData = z.infer<typeof loginSchema>

//  Sign Up Schema (with confirm password)
export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .email("Invalid email address")
      .refine(isAllowedEmail, "Only Gmail, Yahoo, Outlook, or Hotmail emails are allowed"),
    password: passwordRules,
    // confirmPassword: z.string().min(8, "Please confirm your password"),
    confirmPassword: z.string(), // dh 3shan ygeb error:"Passwords do not match"; 3la tol men 8er "Please confirm your password"
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"], // shows the error under confirmPassword field
    message: "Passwords do not match",
  })

export type SignUpFormData = z.infer<typeof signUpSchema>
