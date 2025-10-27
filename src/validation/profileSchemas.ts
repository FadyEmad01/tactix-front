import { z } from "zod"


export const profileSchema = z.object({
    userName: z.string().min(2, "Name must be at least 2 characters"),
    ProfileImageUrl: z.any().optional(),
})
export type ProfileFormData = z.infer<typeof profileSchema>

