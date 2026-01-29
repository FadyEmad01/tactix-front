import Container from "@/components/layout/Container";
import { ResponsiveSettingsNav } from "@/components/settings/ResponsiveSettingsNav";

import { SETTINGS_NAV_ITEMS } from "@/constant/SETTINGS";
import { cookies } from "next/headers";

export default async function SettingsLayout({ children }: Readonly<{
    children: React.ReactNode;
}>) {

    const cookieStore = await cookies()
    const userCookie = cookieStore.get("user")?.value
    const user = userCookie ? JSON.parse(userCookie) : null

    const name = user?.userName || ""
    const email = user?.email || ""

    return (
        <>
            <Container>
                <div className="space-y-6 py-10 pb-16">
                    <div className="space-y-0.5">
                        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                        <p className="text-muted-foreground">
                            {/* Manage your account settings. */}
                            Update account preferences and manage
                        </p>
                    </div>
                    {/* <Separator className="my-6" /> */}
                    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                        <aside className="lg:w-1/5">
                            <ResponsiveSettingsNav items={SETTINGS_NAV_ITEMS} />
                        </aside>
                        <div className="flex-1 lg:max-w-2xl">{children}</div>
                    </div>
                </div>
            </Container>
        </>
    );
}
