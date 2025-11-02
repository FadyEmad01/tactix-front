
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Settings } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import { fetchUserProfile } from "@/lib/fetchUserProfile";

export default async function Home() {
  const user = await fetchUserProfile();

  return (
    <div className="relative w-full h-screen flex justify-center items-center px-4">
      {user ? (
        <>
          <Link
            href="/dashboard/settings"
            className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
            title="Settings"
          >
            <Settings className="size-5" />
          </Link>

          <Card className="max-w-sm w-full text-center rounded-3xl shadow-md">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-6 px-6">
              <img
                src={user.profileImageUrl}
                alt={user.username}
                className="w-20 h-20 rounded-full object-cover border shadow"
              />

              <h1 className="text-3xl font-bold">
                Welcome back, <br /> {user.username} 👋🏻
              </h1>

              <p className="text-muted-foreground">
                Your ID is <strong>{user.id}</strong>
              </p>
              {/* <p className="text-muted-foreground">
                You are logged in as <strong>{user.email}</strong>
              </p> */}
              <div className="flex flex-col gap-4 w-full mt-4">
                <Button size="lg" className="w-full" asChild>
                  <Link href="/dashboard/settings">Go to Dashboard</Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full" asChild>
                  <Link href="/profile">Profile</Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full" asChild>
                  <Link href="/video-editor">Analyze a video</Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full" asChild>
                  <Link href="/projects">Upload a video</Link>
                </Button>
                <LogoutButton />
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
