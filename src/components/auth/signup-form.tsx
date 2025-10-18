"use client"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { PasswordInput } from "../ui/password-input"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import Link from "next/link"
import { Button } from "../ui/button"
import { LoadingSwap } from "../ui/loading-swap"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SignUpFormData, signUpSchema } from "@/validation/authSchemas"
import { useState } from "react"
import z from "zod"
import { toast } from "sonner"


export function SignupForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [googleLoading, setGoogleLoading] = useState(false)

    const form = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        mode: "all",
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    const { isSubmitting } = form.formState

    function onSubmit(data: z.infer<typeof signUpSchema>) {

        toast.success(`Hello, ${data.email.split("@")[0]}!`)

    }

    async function handleGoogleSignUp() {
        setGoogleLoading(true)
        toast("Redirecting to Google...")
        await new Promise((resolve) => setTimeout(resolve, 2000))
        setGoogleLoading(false)
        console.log("Google sgin-up logic here...")
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0 md:rounded-3xl">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form id="form-signup" onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
                        <FieldGroup>
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <h1 className="text-2xl font-bold">Create your account</h1>
                                    <p className="text-muted-foreground text-sm text-balance">
                                        Enter your email below to create your account
                                    </p>
                                </div>
                                <Controller
                                    control={form.control}
                                    name="name"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="name">Full name</FieldLabel>
                                            <Input
                                                {...field}
                                                aria-invalid={fieldState.invalid}
                                                id="name"
                                                type="text"
                                                autoComplete="additional-name"
                                                placeholder="Evil Rabbit"
                                            />

                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
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
                                <Controller
                                    control={form.control}
                                    name="password"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="password">Password</FieldLabel>
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
                                <Controller
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel  htmlFor="confirm-password">Confirm Password</FieldLabel>
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
                                <Field>
                                    <Button form="form-signup" type="submit" disabled={isSubmitting} className="w-full">
                                        <LoadingSwap isLoading={isSubmitting}>Create account</LoadingSwap>
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
                                            onClick={handleGoogleSignUp}
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
                                    have an account?{" "}
                                    <Link href="/login" className="underline underline-offset-4">
                                        Login
                                    </Link>
                                </div>
                            </div>
                        </FieldGroup>

                    </form>
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
