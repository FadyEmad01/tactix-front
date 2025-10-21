import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "../ui/button"
import { CheckCircle2Icon } from "lucide-react"
import Link from "next/link"

export default function SuccessVerification() {
  return (
    <Empty className="from-muted/50 to-background h-screen w-screen bg-gradient-to-b from-30%">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CheckCircle2Icon className="text-green-500 size-5" />
        </EmptyMedia>s
        <EmptyTitle>Email verified successfully</EmptyTitle>
        <EmptyDescription>
          Your email has been verified successfully. You can now explore your account and start using all features.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link href="/">Go to Dashboard</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/profile">View Profile</Link>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  )
}
