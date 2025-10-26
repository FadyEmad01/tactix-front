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
import { Separator } from "@/components/ui/separator"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import ImageCropperForm from "@/components/settings/ImageCropperForm"
import { useEffect } from "react"
import { updateProfile } from "@/lib/auth/profile"
import { toast } from "sonner" // or your toast library
import { useRouter } from "next/navigation"

const settingsSchema = z.object({
  userName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
})

type SettingsFormData = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const router = useRouter()
  
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    mode: "onSubmit",
    defaultValues: {
      userName: "",
      email: "",
    },
  })

  const { setValue } = form

  useEffect(() => {
    try {
      // Read from cookie only (single source of truth)
      const cookieUser = document.cookie
        .split('; ')
        .find(row => row.startsWith('user='))
        ?.split('=')[1];

      if (cookieUser && cookieUser !== 'undefined') {
        const user = JSON.parse(decodeURIComponent(cookieUser));
        if (user && typeof user === 'object') {
          setValue("userName", user.userName || "");
          setValue("email", user.email || "");
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load user data");
    }
  }, [setValue])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      console.log("Submitting profile update:", values);
      const result = await updateProfile(values);
      console.log("Update successful:", result);
      
      // Show success toast
      toast.success("Profile updated successfully!");
      
      // Small delay to ensure cookies are set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Refresh the page data without full reload
      router.refresh();
      
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(error?.message || "Failed to update profile");
      
      // If it's an auth error, might need to re-login
      if (error?.message?.includes("Unauthorized")) {
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    }
  });

  const { isSubmitting } = form.formState

  return (
    <>
      <div className="lg:space-y-6 space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Profile
          </h2>
          <p className="text-sm text-muted-foreground">
            Update your profile details.
          </p>
        </div>
        <Separator />
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
                <ImageCropperForm />

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
                          placeholder="Evil Rabbit"
                        />

                        {fieldState.invalid && (
                          <FieldError className="" errors={[fieldState.error]} />
                        )}
                      </div>

                    </Field>
                  )}
                />
                <Controller
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
              disabled={isSubmitting}
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
              <Button className="text-destructive-saturated bg-card dark:bg-primary dark:hover:bg-primary/90 border-input hover:bg-card/70" size="sm">
                change visability
              </Button>
              <Button className="bg-destructive-saturated" variant="destructive" size="sm">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}