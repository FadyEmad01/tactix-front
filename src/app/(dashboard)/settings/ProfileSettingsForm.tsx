"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
// import ImageCropperForm from "@/components/settings/ImageCropperForm" // Commented out - image upload disabled
import { useEffect, useMemo } from "react"
import { updateProfile } from "@/lib/updateProfile"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const settingsSchema = z.object({
  userName: z.string().min(2, "Name must be at least 2 characters"),
//   email: z.string().email("Invalid email address"),
})

type SettingsFormData = z.infer<typeof settingsSchema>

export default function ProfileSettingsForm({ user }: { user: any | null }) {
  const router = useRouter()
  
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    mode: "onSubmit",
    defaultValues: {
      userName: user?.username || "",
    //   email: user?.email || "",
    },
  })

  // Sync form values when user prop changes (Next.js 15 fix)
  useEffect(() => {
    if (user) {
      form.reset({
        userName: user?.username || "",
        // email: user?.email || "",
      })
    }
  }, [user, form])

  const watchedValues = form.watch()
  const { isSubmitting } = form.formState

  // Check if form has changes
  const hasChanges = useMemo(() => {
    const nameChanged = watchedValues.userName !== (user?.username || "")
    // const emailChanged = watchedValues.email !== (user?.email || "")
    return nameChanged
  }, [watchedValues, user])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      // Create FormData - backend expects userName (camelCase)
      // Note: Backend only accepts userName, not email (email is read-only)
      const formData = new FormData()
      formData.append("userName", values.userName)
      
      // Image upload commented out - will be fixed later
      // if (imageFile) {
      //   formData.append("profileImageUrl", imageFile)
      // }

      const result = await updateProfile(formData)
      
      toast.success(result?.message || "Profile updated successfully!")
      
      // Refresh the page data
      router.refresh()
      
      // Update form with new values
      const updatedUser = result?.data || result?.user || result
      if (updatedUser) {
        form.reset({
          userName: updatedUser?.username || values.userName,
        //   email: updatedUser?.email || values.email,
        })
      }
      
    } catch (error: any) {
      console.error("Update failed:", error)
      toast.error(error?.message || "Failed to update profile")
      
      // If it's an auth error, might need to re-login
      if (error?.message?.includes("Unauthorized")) {
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    }
  })

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Make changes to your profile here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="form-account" className="@container" onSubmit={onSubmit}>
            <FieldGroup className="@container/field-group flex max-w-4xl min-w-0 flex-col gap-8 @3xl:gap-6">
              {/* Image upload commented out - will be fixed later */}
              {/* <ImageCropperForm 
                defaultImage={user?.profileImageUrl || undefined}
                onImageSelect={(file) => {
                  setImageFile(file)
                }}
              /> */}

              <Controller
                control={form.control}
                name="userName"
                render={({ field, fieldState }) => (
                  <Field className="grid auto-rows-min items-start gap-3 *:data-[slot=label]:col-start-1 *:data-[slot=label]:row-start-1 @3xl/field-group:grid-cols-2 @3xl/field-group:gap-6" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="userName">Name</FieldLabel>
                    <div className="flex flex-col gap-2">
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        id="userName"
                        type="text"
                        autoComplete="additional-name"
                        placeholder="Your display name"
                      />

                      {fieldState.invalid && (
                        <FieldError className="" errors={[fieldState.error]} />
                      )}
                    </div>
                  </Field>
                )}
              />
              {/* <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="grid auto-rows-min items-start gap-3 *:data-[slot=label]:col-start-1 *:data-[slot=label]:row-start-1 @3xl/field-group:grid-cols-2 @3xl/field-group:gap-6">
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="m@example.com"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              /> */}

            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="border-t">
          <Button 
            size="sm" 
            type="submit" 
            form="form-account" 
            variant="default" 
            disabled={!hasChanges || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive/10 bg-destructive-saturated/10">
        <CardContent className="flex w-full items-center justify-between flex-wrap gap-6">
          <div className="flex flex-col gap-2">
            <h5 className="text-destructive leading-none font-semibold text-base">Danger Zone</h5>
            <p className="text-muted-foreground text-sm">Make changes to your profile here.</p>
          </div>
          <div className="flex gap-2">
            <Button className="text-destructive-saturated bg-card border-input hover:bg-card/70" size="sm">
              change visability
            </Button>
            <Button className="bg-destructive-saturated" variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

