"use client"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { PasswordInput } from "../ui/password-input"
import Image from "next/image"
import Link from "next/link"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import z from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "../ui/button"
import { LoadingSwap } from "../ui/loading-swap"
import { useState } from "react"
import { toastManager } from "../ui/toast"

// Validation schema
const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ResetPasswordData = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: ResetPasswordData) {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1500)) // simulate backend delay
    setIsSubmitting(false)

    toastManager.add({
      title: "Password reset successful!",
      description: "You can now log in with your new password.",
    })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 md:rounded-3xl">
        <CardContent className="grid p-0 md:grid-cols-1">
          <form id="form-reset" onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Reset your password</h1>
                <p className="text-muted-foreground text-balance">
                  Enter your new password and confirm it below.
                </p>
              </div>

              <FieldGroup>
                <Controller
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="password">New Password</FieldLabel>
                      <PasswordInput
                        {...field}
                        aria-invalid={fieldState.invalid}
                        id="password"
                        placeholder="********"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="confirmPassword"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                      <PasswordInput
                        {...field}
                        aria-invalid={fieldState.invalid}
                        id="confirmPassword"
                        placeholder="********"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              <Field>
                <Button form="form-reset" type="submit" disabled={isSubmitting} className="w-full">
                  <LoadingSwap isLoading={isSubmitting}>
                    Reset Password
                  </LoadingSwap>
                </Button>
              </Field>

              <div className="text-center text-sm">
                <Link href="login" className="underline underline-offset-4">
                  Back to Login
                </Link>
              </div>
            </div>
          </form>

          {/* <div className="p-2 relative hidden md:block">
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <Image
                src="/images/placeholder.jpeg"
                alt="Image"
                fill
                priority
                className="object-cover pointer-events-none"
              />
            </div>
          </div> */}
        </CardContent>
      </Card>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our{" "}
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
