import Container from "@/components/layout/Container";
import { ResponsiveSettingsNav } from "@/components/settings/ResponsiveSettingsNav";

import { SETTINGS_NAV_ITEMS } from "@/constant/SETTINGS";

export default function SettingsLayout({ children }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Container>
                <div className="space-y-6 py-10 pb-16">
                    <div className="space-y-0.5">
                        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
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
