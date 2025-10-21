"use client"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { ForgotPasswordData, forgotPasswordSchema } from "@/validation/authSchemas"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: ForgotPasswordData) {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1500)) // mock delay
    setIsSubmitting(false)

    toastManager.add({
      title: "Password reset link sent!",
      description: `Check your inbox at ${data.email}`,
      type: "success",
      timeout: 3000
    })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 rounded-3xl">
        <CardContent className="grid p-0 md:grid-cols">
          <form id="form-forgot" onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Forgot your password?</h1>
                <p className="text-muted-foreground text-balance">
                  Enter your email address and we’ll send you a reset link.
                </p>
              </div>
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
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

              <Field>
                <Button form="form-forgot" type="submit" disabled={isSubmitting} className="w-full">
                  <LoadingSwap isLoading={isSubmitting}>
                    Send Password Reset Link
                  </LoadingSwap>
                </Button>
              </Field>

              <div className="text-center text-sm">
                Remember your password?{" "}
                <Link href="login" className="underline underline-offset-4">
                  Back to Login
                </Link>
              </div>
            </div>
          </form>

          <div className="p-2 relative hidden md:block">
            {/* <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <Image
                src="/images/placeholder.jpeg"
                alt="Image"
                fill
                priority
                className="object-cover pointer-events-none"
              />
            </div> */}
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our{" "}
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
