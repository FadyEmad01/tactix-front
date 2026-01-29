

import { AppSidebar } from "@/components/ui/sidebar-nav/app-sidebar";
import BreadcrumbNav from "@/components/ui/sidebar-nav/BreadcrumbNav";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { fetchUserProfile } from "@/lib/fetchUserProfile";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  const user = await fetchUserProfile(); // <-- SERVER-SIDE

  return (

    <>

      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar user={user} />
        <SidebarInset className="md:h-[97dvh] overflow-y-scroll w-full scrollbar-hide">


          <div className="px-4 md:px-6 lg:px-8 @container ">
            {/* <div className="w-full max-w-7xl mx-auto"> */}
            <div className="w-full  mx-auto relative">
              <header className="bg-background sticky z-50 top-0 w-full flex flex-wrap gap-3 min-h-10 py-4 shrink-0 items-center transition-all ease-linear border-b">
                {/* Left side */}
                <div className="flex flex-1 items-center gap-2">
                  <SidebarTrigger className="-ms-1" />
                  {/* <div className="max-lg:hidden lg:contents">
                    <Separator
                      orientation="vertical"
                      className="me-2 data-[orientation=vertical]:h-4"
                    />
                    <BreadcrumbNav />
                  </div> */}
                  <div className="contents">
                    <Separator
                      orientation="vertical"
                      className="me-2 data-[orientation=vertical]:h-4"
                    />
                    <BreadcrumbNav />
                  </div>
                </div>
              </header>
              {/* pt-8 */}
              <div className="overflow-y-hidden w-full h-full relative">
                {children}
              </div>
            </div>
          </div>


        </SidebarInset>
      </SidebarProvider>

    </>

  );
}
