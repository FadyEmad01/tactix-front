import { ResetPasswordForm } from '@/components/auth/ResetPassword'


export default function page() {
    return (
        <div className="bg-muted dark:bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <ResetPasswordForm />
            </div>
        </div>
    )
}
