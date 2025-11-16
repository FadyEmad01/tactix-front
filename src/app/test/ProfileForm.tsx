"use client"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldLabel, FieldGroup, FieldDescription } from "@/components/ui/field"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toastManager } from "@/components/ui/toast"
import ImageCropperForm from "@/components/settings/ImageCropperForm"
import { useRouter } from "next/navigation"
import { ProfileFormData, profileSchema } from "@/validation/profileSchemas"
import { updateProfile } from "./profileActions"


export default function ProfileForm({ user }: { user: any | null }) {
  const router = useRouter()

  // 🖼 Track image file
  const [imageFile, setImageFile] = useState<File | null>(null)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "all",
    defaultValues: {
      userName: user?.username || "",
      ProfileImageUrl: user?.profileImageUrl || "",
    },
  })

  // Sync form values when user prop changes (Next.js 15 fix)
  useEffect(() => {
    if (user) {
      form.reset({
        userName: user?.username || "",
        ProfileImageUrl: user?.profileImageUrl || "",
      })
    }
  }, [user, form])

  const watchedValues = form.watch()
  const { isSubmitting } = form.formState

  // Simplified: always allow submission if there's a value (testing PUT only)
  const hasChanges = useMemo(() => {
    const hasName = watchedValues.userName.trim().length > 0
    const hasImage = !!imageFile
    return hasName || hasImage
  }, [watchedValues.userName, imageFile])

  const onSubmit = async (data: ProfileFormData) => {
    let id: string | undefined
    try {
      // Create FormData
      // Backend accepts userName (camelCase) and profileImageUrl (optional) for image
      const formData = new FormData()
      formData.append("userName", data.userName)
      
      // Append image if file exists (optional field)
      if (imageFile) {
        formData.append("profileImageUrl", imageFile)
      }

      // Debug: Log what we're sending (client-side)
      console.log("📤 Client - Sending FormData (PUT only - no fetch):")
      console.log("  - userName:", data.userName)
      console.log("  - profileImageUrl (image):", imageFile ? `${imageFile.name} (${imageFile.size} bytes)` : "none (optional)")
      console.log("  - hasChanges:", hasChanges)

      id = toastManager.add({ title: "Updating...", type: "loading" })

      // Call server action (handles token from HttpOnly cookie)
      const result = await updateProfile(formData)

      toastManager.close(id)
      toastManager.add({
        title: "Success",
        description: result?.message || "Profile updated successfully!",
        type: "success",
      })

      router.refresh()
      setImageFile(null)
      
      // Reset form to new default values after successful submission
      // Backend returns { message, data: { username, profileImageUrl, ... } }
      const updatedUser = result?.data || result?.user || result
      form.reset({
        userName: updatedUser?.username || data.userName,
        ProfileImageUrl: updatedUser?.profileImageUrl || "",
      })
    } catch (err: any){
      if (id) toastManager.close(id);
      toastManager.add({
        title: "Error",
        description: err.message || "Failed to update profile",
        type: "error",
      })
      console.error("❌ Client Error:", err)
    }
  }



  return (
    <>
      {/* The <form> tag wraps the whole card to ensure the footer button works */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Make changes to your profile here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* FieldGroup wraps all the fields */}
            <FieldGroup className="space-y-6">
              {/* 🖼 Image upload component remains the same */}
              <ImageCropperForm
                defaultImage={user?.profileImageUrl || undefined}
                onImageSelect={(file) => {
                  setImageFile(file)
                  // Trigger validation and change detection
                  form.setValue("ProfileImageUrl", file?.name || "", {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }}
              />

              {/* Use Controller to connect react-hook-form to Field components */}
              <Controller
                control={form.control}
                name="userName"
                render={({ field, fieldState }) => (
                  <Field className="grid gap-2" data-invalid={fieldState.invalid}>
                    <FieldLabel>Name</FieldLabel>
                    <Input
                      placeholder="Your display name"
                      autoComplete="additional-name"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <FieldDescription>
                      This is your public display name.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError>{fieldState.error?.message}</FieldError>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>

          <CardFooter className="border-t pt-6">
            <Button
              size="sm"
              type="submit"
              variant="default"
              disabled={!hasChanges || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Danger Zone Card remains outside the profile form */}
      <Card className="border-destructive/10 bg-destructive-saturated/10">
        <CardContent className="flex w-full items-center justify-between flex-wrap gap-6">
          <div className="flex flex-col gap-2">
            <h5 className="text-destructive leading-none font-semibold text-base">
              Danger Zone
            </h5>
            <p className="text-muted-foreground text-sm">
              Be careful with these actions.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              className="text-destructive-saturated bg-card dark:bg-primary dark:hover:bg-primary/90 border-input hover:bg-card/70"
              size="sm"
            >
              Change visability
            </Button>
            <Button
              className="bg-destructive-saturated"
              variant="destructive"
              size="sm"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </>

  )
}