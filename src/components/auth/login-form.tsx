"use client"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { PasswordInput } from "../ui/password-input"
import Link from "next/link"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import z from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "../ui/button"
import { LoadingSwap } from "../ui/loading-swap"
// import { toast } from "sonner"
import { LoginFormData, loginSchema } from "@/validation/authSchemas"
import { useState } from "react"
import { toastManager } from "../ui/toast"
import { login } from "@/lib/auth/login"
import { useRouter } from "next/navigation"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { isSubmitting } = form.formState

  // function onSubmit(data: z.infer<typeof loginSchema>) {

  //   // toast.success(`Welcome back, ${data.email.split("@")[0]}!`)
  //   toastManager.add({
  //     title: `👋🏻 Helloo ${data.email.split("@")[0]}!`,
  //     description: `Welcome back`,
  //     // type:"success"
  //   })
  // }

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    let id: string | undefined;
    try {
      // const formData = new FormData();
      // formData.append("email", data.email);
      // formData.append("password", data.password);
      const result = await login({
        email: data.email,
        password: data.password,
      });

      // console.log(formData)
      // console.log(data.email)
      // console.log(data.password)

      id = toastManager.add({
        title: "Loging...",
        type: "loading",
      });

      // const result = await login(formData);
      toastManager.close(id)
      toastManager.add({
        title: "Success",
        description: result.message,
        type: "success",
        timeout: 2000,
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/");
    } catch (err: any) {
      if (id) toastManager.close(id);
      toastManager.add({
        title: "Error",
        description: err.message || "Something went wrong",
        type: "error",
        timeout: 3000,
      });

      await new Promise((resolve) => setTimeout(resolve, 3000));

      // toastManager.add({
      //   title: "Please try again",
      //   timeout: 3000,
      // });
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    // toast("Redirecting to Google...")
    const id = toastManager.add({
      title: "Loading…",
      description: "Redirecting to Google...",
      type: "loading",
    })
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setGoogleLoading(false)
    toastManager.close(id)
    toastManager.add({
      title: "Done",
      description: "Google login logic here...",
      timeout: 3000,
    })
    console.log("Google login logic here...")
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 rounded-3xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form id="form-login" onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your account
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
                      // required
                      />
                      {/* <FieldDescription>
                                        We&apos;ll use this to contact you. We will not share your
                                        email with anyone else.
                          </FieldDescription>
                      */}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <div className="flex items-center">
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Link
                          href="forget-password"
                          className="ml-auto text-sm underline-offset-2 hover:underline text-primary"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                      <PasswordInput
                        {...field}
                        aria-invalid={fieldState.invalid}
                        id="password"
                        placeholder="********"
                      // required
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <Field>
                <Button form="form-login" type="submit" disabled={isSubmitting} className="w-full">
                  <LoadingSwap isLoading={isSubmitting}>Login</LoadingSwap>
                </Button>
              </Field>

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Field>
                  <Button
                    variant="outline"
                    type="button"
                    disabled={googleLoading}
                    onClick={handleGoogleLogin}
                    className="w-full">
                    <LoadingSwap isLoading={googleLoading}>
                      <Image
                        src="/svg/google.svg"
                        alt="Google"
                        priority
                        width={24}
                        height={24}
                        className="size-4"
                      />
                      <span className="sr-only">Login with Google</span>
                    </LoadingSwap>
                  </Button>
                </Field>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="sign-up" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
          {/* <div className="bg-muted relative hidden md:block"> */}
          <div className="p-2 relative hidden md:block">
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <Image
                src="/images/placeholder.jpeg"
                alt="Image"
                fill
                priority
                // className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                // className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                className="object-cover pointer-events-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
