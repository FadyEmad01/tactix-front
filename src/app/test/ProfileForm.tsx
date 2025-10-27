"use client"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toastManager } from "@/components/ui/toast"
import ImageCropperForm from "@/components/settings/ImageCropperForm"
import { updateProfile } from "@/lib/updateProfile"
import { useRouter } from "next/navigation"
import { ProfileFormData, profileSchema } from "@/validation/profileSchemas"


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
  const { control, watch, formState, handleSubmit, setValue } = form
  const { isSubmitting } = formState

  const hasChanges = useMemo(() => {
    const current = watch()
    const nameChanged = current.userName !== user?.username
    const imageChanged = !!imageFile
    return nameChanged || imageChanged
  }, [watch, user, imageFile])

  const onSubmit = handleSubmit(async (values) => {
    let id: string | undefined
    try {
      const formData = new FormData()
      formData.append("userName", values.userName)
      if (imageFile) formData.append("image", imageFile)

      id = toastManager.add({ title: "Updating...", type: "loading" })
      const res = await updateProfile(formData)

      toastManager.close(id)
      toastManager.add({
        title: "Success",
        description: res?.message || "Profile updated successfully!",
        type: "success",
      })

      router.refresh()
      setImageFile(null)
    } catch (err: any) {
      if (id) toastManager.close(id)
      toastManager.add({
        title: "Error",
        description: err.message || "Failed to update profile",
        type: "error",
      })
      console.error(err)
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

              {/* 🖼 Image upload with default preview */}
              <ImageCropperForm
                defaultImage={user?.profileImageUrl}
                onImageSelect={(file) => {
                  setImageFile(file)
                  setValue("ProfileImageUrl", file?.name || "")
                }}
              />

              <Controller
                control={control}
                name="userName"
                render={({ field, fieldState }) => (
                  <Field
                    className="grid auto-rows-min items-start gap-3 *:data-[slot=label]:col-start-1 *:data-[slot=label]:row-start-1 
                           @3xl/field-group:grid-cols-2 @3xl/field-group:gap-6"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel htmlFor="userName">Name</FieldLabel>
                    <div className="flex flex-col gap-2">
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        id="userName"
                        type="text"
                        autoComplete="additional-name"
                        placeholder="Evil Rabbit"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </div>
                  </Field>
                )}
              />
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
            <h5 className="text-destructive leading-none font-semibold text-base">
              Danger Zone
            </h5>
            <p className="text-muted-foreground text-sm">
              Make changes to your profile here.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              className="text-destructive-saturated bg-card dark:bg-primary dark:hover:bg-primary/90 border-input hover:bg-card/70"
              size="sm"
            >
              change visability
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
