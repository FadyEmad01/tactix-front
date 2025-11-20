// "use client";

// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { usePathname } from "next/navigation";
// import React from "react";
// import Link from "next/link";

// export default function BreadcrumbNav() {
//   const pathname = usePathname();

//   // Initialize breadcrumb items
//   const breadcrumbItems: { title: string; url?: string }[] = [];

//   // Add Home breadcrumb
//   breadcrumbItems.push({ title: "Home", url: "/" });

//   // Handle dynamic routes first
//   if (pathname.startsWith("/chat/") && pathname.length > "/chat/".length) {
//     const chatId = pathname.substring("/chat/".length);
//     const chatConversation = DUMMY_CHAT_CONVERSATIONS.find(chat => chat.id === chatId);

//     // Add "Chat" as a link to the base chat page
//     breadcrumbItems.push({ title: "Chat", url: "/chat" });

//     // Add the specific chat's name as the current page
//     breadcrumbItems.push({
//       title: chatConversation
//         ? (chatConversation.type === "individual"
//             ? chatConversation.participants[0].name ?? "Unknown Chat"
//             : chatConversation.name ?? "Unknown Chat")
//         : "Unknown Chat",
//     });
//   } else {
//     // Handle static routes
//     const allItems = NAVIGATION_DATA.navMain.flatMap((section) => section.items);
//     const current = allItems.find((item) => pathname === item.url);

//     if (current) {
//       // If the current path is a top-level item in NAVIGATION_DATA, add it
//       breadcrumbItems.push({ title: current.title }); // No URL for the last item in breadcrumb
//     } else if (pathname === "/") {
//       // If it's the root, "Home" is already added, no need for another item
//     } else {
//       // Fallback for unknown pages (e.g., 404 or other dynamic routes not handled)
//       breadcrumbItems.push({ title: "Unknown" });
//     }
//   }

//   return (
//     <Breadcrumb>
//       <BreadcrumbList>
//         {breadcrumbItems.map((item, index) => (
//           <React.Fragment key={item.title}>
//             <BreadcrumbItem>
//               {item.url ? (
//                 <BreadcrumbLink asChild>
//                   <Link href={item.url}>{item.title}</Link>
//                 </BreadcrumbLink>
//               ) : (
//                 <BreadcrumbPage>{item.title}</BreadcrumbPage>
//               )}
//             </BreadcrumbItem>
//             {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
//           </React.Fragment>
//         ))}
//       </BreadcrumbList>
//     </Breadcrumb>
//   );
// }




"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import React from "react";
import Link from "next/link";
import { NAVIGATION_DATA } from "@/constant/sidebar";

export default function BreadcrumbNav() {
  const pathname = usePathname();

  // Initialize breadcrumb items
  const breadcrumbItems: { title: string; url?: string }[] = [];

  // Add Home breadcrumb
  breadcrumbItems.push({ title: "Home", url: "/" });

  // Handle dynamic routes first
  
    // Handle static routes
    const allItems = NAVIGATION_DATA.navMain.flatMap((section) => section.items);
    const current = allItems.find((item) => pathname === item.url);

    if (current) {
      // If the current path is a top-level item in NAVIGATION_DATA, add it
      breadcrumbItems.push({ title: current.title }); // No URL for the last item in breadcrumb
    } else if (pathname === "/") {
      // If it's the root, "Home" is already added, no need for another item
    } else {
      // Fallback for unknown pages (e.g., 404 or other dynamic routes not handled)
      breadcrumbItems.push({ title: "Unknown" });
    }
  

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.title}>
            <BreadcrumbItem>
              {item.url ? (
                <BreadcrumbLink asChild>
                  <Link href={item.url}>{item.title}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
