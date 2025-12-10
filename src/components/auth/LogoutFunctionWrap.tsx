"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function LogoutFunctionWrap({ children, className }: { children: React.ReactNode, className?: string }) {
    const router = useRouter();

    const handleLogout = async () => {
        try {

            await fetch("/api/auth/logout", { method: "POST" });

            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");

            router.push("/auth/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <button className={cn("bg-none p-0 m-0 border-none", className)} onClick={handleLogout}>
            {children}
        </button>
    );
}
