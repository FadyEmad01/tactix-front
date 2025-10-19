import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "../ui/button"
import {  CircleAlertIcon, } from "lucide-react"
import Link from "next/link"

export default function FailedVerification() {
    return (
        <Empty className="from-muted/50 to-background h-screen w-screen bg-gradient-to-b from-30%">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    {/* <IconFolderCode /> */}
                    <CircleAlertIcon className="text-destructive-saturated size-5" />
                </EmptyMedia>
                <EmptyTitle>Failed to verify your email</EmptyTitle>
                <EmptyDescription>
                    Your email couldn&apos;t be verified. Make sure you&apos;ve clicked the link we sent or request a new one below.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <div className="flex flex-wrap gap-2">
                    {/* <Button size="sm" variant="default">Resend verification link</Button> */}
                    <Button size="sm" variant="outline" asChild>
                        <Link href="/auth/sign-up">Sign up again</Link>
                    </Button>
                </div>
            </EmptyContent>
        </Empty>
    )
}
