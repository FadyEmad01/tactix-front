// import { Metadata } from "next"
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
import z from "zod"
import ImageCropperForm from "@/components/settings/ImageCropperForm"
import { useEffect } from "react"

// export const metadata: Metadata = {
//   title: "Settings",
//   description: "Manage your account settings",
// }

const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
})

type SignUpFormData = z.infer<typeof signUpSchema>

export default function SettingsPage() {

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onSubmit",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const { setValue, formState } = form

  useEffect(() => {
    try {
      const userString = sessionStorage.getItem("user")
      if (userString) {
        const user = JSON.parse(userString)
        if (user?.userName) setValue("name", user.userName)
        if (user?.email) setValue("email", user.email)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }, [setValue])

  const { isSubmitting } = form.formState

  return (
    <>
      <div className="lg:space-y-6 space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Profile
          </h2>
          {/* <h3 className="text-lg font-medium">Profile</h3> */}
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
            <form id="form-account" className="@container">
              <FieldGroup className="@container/field-group flex max-w-4xl min-w-0 flex-col gap-8 @3xl:gap-6">
                <ImageCropperForm />

                <Controller
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field className="grid auto-rows-min items-start gap-3 *:data-[slot=label]:col-start-1 *:data-[slot=label]:row-start-1 @3xl/field-group:grid-cols-2 @3xl/field-group:gap-6" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="name">Name</FieldLabel>
                      <div className="flex flex-col gap-2">
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          id="name"
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
            {/* <Button className="text-destructive-foreground-saturated" type="submit" form="form-account" variant="destructive-outline">
              Save changes
            </Button> */}
            <Button size="sm" type="submit" form="form-account" variant="default">
              Save changes
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