
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Settings } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import { fetchUserProfile } from "@/lib/fetchUserProfile";
import { redirect } from "next/navigation";
import IntroAnimation from "@/components/landing/IntroAnimation";
// import { LogoAnimation } from "@/components/landing/LogoAnimation";
import { Header } from "@/components/landing/header";
import Hero from "@/components/landing/Hero/Hero";
import Container from "@/components/layout/Container";
import Image from "next/image";

export default async function Home() {
  const user = await fetchUserProfile();

  if (user) {
    redirect("/projects")
  }

  return (
    <>
      {user ? (
        <>
          <div className="relative w-full h-screen flex justify-center items-center px-4">
            <Link
              href="/settings"
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
                    <Link href="/settings">Go to Dashboard</Link>
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

          </div>
        </>
      ) : (
        <>
          <div className="bg-[#e2e7e7]">
            <IntroAnimation />
            <Hero />

            <div className="h-dvh"></div>

          </div>
        </>
      )}

    </>
  );
}
