"use client"
import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { LoadingSwap } from "../ui/loading-swap"

interface InputOTPProps {
    containerClassName?: string
    value?: string
    onChange?: (value: string) => void
    onComplete?: (value: string) => void
    maxLength?: number
    className?: string
    hasError?: boolean
    hasSuccess?: boolean
    disabled?: boolean
}

function InputOTPComponent({
    className,
    containerClassName,
    value,
    onChange,
    onComplete,
    maxLength = 6,
    hasError = false,
    hasSuccess = false,
    disabled = false,
    children,
    ...props
}: InputOTPProps & { children: React.ReactNode }) {
    const handleChange = (newValue: string) => {
        const numericValue = newValue.replace(/[^0-9]/g, "")
        onChange?.(numericValue)
    }

    return (
        <OTPInput
            data-slot="input-otp"
            containerClassName={cn(
                "flex items-center gap-3 has-disabled:opacity-50",
                containerClassName
            )}
            className={cn("disabled:cursor-not-allowed", className)}
            value={value}
            onChange={handleChange}
            onComplete={onComplete}
            maxLength={maxLength}
            disabled={disabled}
            spellCheck={false}
            {...props}
        >
            {children}
        </OTPInput>
    )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="input-otp-group"
            className={cn(
                // responsive gap and wrapping
                "flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4",
                className
            )}
            {...props}
        />
    )
}

interface InputOTPSlotProps extends React.ComponentProps<"div"> {
    index: number
    hasError?: boolean
    hasSuccess?: boolean
}

function InputOTPSlot({
    index,
    className,
    hasError = false,
    hasSuccess = false,
    ...props
}: InputOTPSlotProps) {
    const inputOTPContext = React.useContext(OTPInputContext)
    const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

    return (
        <div
            data-slot="input-otp-slot"
            data-active={isActive}
            className={cn(
                // responsive size
                "relative flex items-center justify-center rounded-xl border-2 text-lg font-medium shadow-sm transition-colors",
                "size-12 md:size-14", // <--- responsive box size
                hasError && "border-destructive bg-destructive/10",
                hasSuccess && "border-green-500 bg-green-50 dark:bg-green-950",
                !hasError && !hasSuccess && "border-input bg-background",
                isActive && !hasError && !hasSuccess && "border-ring ring-2 ring-ring/20",
                className
            )}
            {...props}
        >
            {char && <span className="font-semibold">{char}</span>}

            {hasFakeCaret && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-5 w-px animate-pulse bg-foreground" />
                </div>
            )}
        </div>
    )
}


export function OTPVerificationComponent() {
    const [value, setValue] = React.useState("")
    const [hasError, setHasError] = React.useState(false)
    const [hasSuccess, setHasSuccess] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [timeLeft, setTimeLeft] = React.useState(600) // 10 minutes in seconds
    const [canResend, setCanResend] = React.useState(false)
    // const [resendCooldown, setResendCooldown] = React.useState(60) // 1 minute cooldown
    // for test
    const [resendCooldown, setResendCooldown] = React.useState(5)


    React.useEffect(() => {
        if (timeLeft <= 0) return

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft])

    React.useEffect(() => {
        if (resendCooldown <= 0) {
            setCanResend(true)
            return
        }

        const timer = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    setCanResend(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [resendCooldown])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const handleComplete = async (otp: string) => {
        setIsLoading(true)
        setHasError(false)
        setHasSuccess(false)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500))

        if (otp === "1234") {
            setHasSuccess(true)
            setHasError(false)
        } else {
            setHasError(true)
            setHasSuccess(false)
        }
        setIsLoading(false)
    }

    // const handleResend = () => {
    //     if (!canResend) return

    //     setValue("")
    //     setHasError(false)
    //     setHasSuccess(false)
    //     setIsLoading(false)
    //     setTimeLeft(600)
    //     setCanResend(false)
    //     setResendCooldown(60)
    // }

    const handleResend = async () => {
        if (!canResend) {
            return { error: true, message: "Please wait until you can resend." }
        }

        // reset UI states
        setValue("")
        setHasError(false)
        setHasSuccess(false)
        setIsLoading(false)
        setTimeLeft(600)
        setCanResend(false)
        setResendCooldown(5)

        // 🟢 Simulate successful resend API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        return { error: false, message: "OTP resent successfully!" }
    }

    // const handleAction = async () => {
    //     const result = await handleResend()

    //     if (!result.error) {
    //         // reset cooldown on success
    //         setCanResend(false)
    //         setResendCooldown(5)
    //     }

    //     return result
    // }

    const handleAction = async () => {
        if (!canResend) return
      
        setIsLoading(true)
        const result = await handleResend()
        setIsLoading(false)
      
        if (!result.error) {
          // reset cooldown on success
          setCanResend(false)
          setResendCooldown(5)
        }
      
        return result
      }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text/plain")
        const numericValue = pastedData.replace(/[^0-9]/g, "").slice(0, 6)
        setValue(numericValue)
        if (numericValue.length === 6) {
            handleComplete(numericValue)
        }
    }

    return (
        <div className="bg-muted dark:bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <Card className="overflow-hidden p-0 rounded-3xl">
                <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col items-center text-center">
                            <h1 className="text-2xl font-bold">Verify OTP</h1>
                            <p className="text-muted-foreground text-balance">
                                Enter the 6-digit code sent to your device
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-center" onPaste={handlePaste}>
                                <InputOTPComponent
                                    value={value}
                                    onChange={(val) => {
                                        setValue(val)
                                        setHasError(false)
                                        setHasSuccess(false)
                                    }}
                                    onComplete={handleComplete}
                                    maxLength={4}
                                    hasError={hasError}
                                    hasSuccess={hasSuccess}
                                    disabled={isLoading || hasSuccess}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} hasError={hasError} hasSuccess={hasSuccess} />
                                        <InputOTPSlot index={1} hasError={hasError} hasSuccess={hasSuccess} />
                                        <InputOTPSlot index={2} hasError={hasError} hasSuccess={hasSuccess} />
                                        <InputOTPSlot index={3} hasError={hasError} hasSuccess={hasSuccess} />
                                        {/* <InputOTPSlot index={4} hasError={hasError} hasSuccess={hasSuccess} />
                                        <InputOTPSlot index={5} hasError={hasError} hasSuccess={hasSuccess} /> */}
                                    </InputOTPGroup>
                                </InputOTPComponent>
                            </div>

                            {isLoading && (
                                <div className="flex items-center justify-center gap-2 text-sm">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Verifying OTP...</span>
                                </div>
                            )}

                            {hasError && !isLoading && (
                                <div className="flex items-center justify-center gap-2 text-sm text-destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Invalid OTP code. Please try again.</span>
                                </div>
                            )}

                            {hasSuccess && !isLoading && (
                                <div className="flex items-center justify-center gap-2 border-green-500/50 text-sm text-green-700 dark:text-green-400">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>OTP verified successfully!</span>
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Time remaining:</span>
                                    <span className={cn(
                                        "font-mono font-medium",
                                        timeLeft < 60 ? "text-destructive" : "text-foreground"
                                    )}>
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                                <Button
                                variant="outline"
                                    type="button"
                                    onClick={handleAction}
                                    disabled={!canResend || hasSuccess || isLoading}
                                    className={cn(
                                        "w-full border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors",
                                        (!canResend || hasSuccess || isLoading) &&
                                        "cursor-not-allowed border-input/50 bg-muted text-muted-foreground"
                                    )}
                                >
                                    <LoadingSwap isLoading={isLoading}>
                                        {hasSuccess
                                            ? "OTP Verified"
                                            : canResend
                                                ? "Resend OTP"
                                                : `Resend available in ${resendCooldown}s`}
                                    </LoadingSwap>
                                </Button>
                            </div>

                            <p className="text-center text-xs text-muted-foreground">
                                Didn't receive the code? Check your spam folder or try resending.
                            </p>
                        </div>
                    </div>

                </CardContent>



            </Card>
        </div>
    )
}

export default OTPVerificationComponent
