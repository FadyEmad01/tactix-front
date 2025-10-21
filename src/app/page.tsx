import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Settings } from "lucide-react"

export default function Home() {
  return (
    <div className="relative w-full h-screen flex justify-center items-center px-4">
      {/* Temporary Settings Icon (top-right) */}
      <Link
        href="/dashboard/settings"
        className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
        title="Settings"
      >
        <Settings className="size-5" />
      </Link>

      {/* Main Card */}
      <Card className="max-w-sm w-full text-center rounded-3xl shadow-md">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-6 px-6">
          <h1 className="text-3xl font-bold">Welcome to Tactix</h1>
          <p className="text-muted-foreground text-balance">
            Your journey starts here — login to continue or create a new account.
          </p>

          <div className="flex flex-col gap-4 w-full mt-4">
            <Button size="lg" className="w-full" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full" asChild>
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
