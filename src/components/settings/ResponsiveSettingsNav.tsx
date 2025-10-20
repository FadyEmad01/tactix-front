// "use client"

// import { useEffect, useMemo, useRef, useState } from "react"
// import { usePathname, useRouter } from "next/navigation"
// import * as Icons from "lucide-react"

// import { Button } from "@/components/ui/button"
// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger,
// } from "@/components/ui/popover"
// import {
//     Command,
//     CommandEmpty,
//     CommandGroup,
//     CommandInput,
//     CommandItem,
//     CommandList,
// } from "@/components/ui/command"
// import { CheckIcon, ChevronDownIcon } from "lucide-react"
// import { SidebarNav } from "@/components/settings/sidebar-nav"
// import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
// import { ScrollArea, ScrollBar } from "../ui/scroll-area"
// import Link from "next/link"

// interface ResponsiveSettingsNavProps {
//     items: {
//         href: string
//         title: string
//         icon?: string
//     }[]
// }

// export function ResponsiveSettingsNav({ items }: ResponsiveSettingsNavProps) {
//     const pathname = usePathname()
//     const router = useRouter()
//     // const [open, setOpen] = useState(false)
//     // const buttonRef = useRef<HTMLButtonElement | null>(null)
//     // const [popoverWidth, setPopoverWidth] = useState<number | null>(null)
//     // const [width, setWidth] = useState(0)

//     // const current = items.find((item) => item.href === pathname)

//     // const DynamicIcons = Icons as unknown as Record<string, React.ElementType>
//     const DynamicIcons = useMemo(
//         () => Icons as unknown as Record<string, React.ElementType>,
//         []
//     )

//     const formatIconName = (name: string) =>
//         name.charAt(0).toUpperCase() + name.slice(1)


//     // const CurrentIcon =
//     //     current?.icon && DynamicIcons[formatIconName(current.icon)]
//     //         ? DynamicIcons[formatIconName(current.icon)]
//     //         : null

//     // useEffect(() => {
//     //     if (!buttonRef.current) return

//     //     const updateWidth = () => {
//     //         if (buttonRef.current) {
//     //             setWidth(buttonRef.current.offsetWidth)
//     //         }
//     //     }

//     //     updateWidth()
//     //     const resizeObserver = new ResizeObserver(updateWidth)
//     //     resizeObserver.observe(buttonRef.current)

//     //     return () => resizeObserver.disconnect()
//     // }, [])

//     // useEffect(() => {
//     //     const handleResize = () => {
//     //         if (window.innerWidth >= 1024) setOpen(false)
//     //     }

//     //     window.addEventListener("resize", handleResize)
//     //     return () => window.removeEventListener("resize", handleResize)
//     // }, [])

//     const currentTab =
//         items.find((item) => pathname === item.href) // تطابق كامل
//             ? pathname
//             : items.find((item) =>
//                 pathname.startsWith(item.href + "/")
//             )?.href || items[0].href

//     useEffect(() => {
//         const activeTab = document.querySelector("[data-state='active']")
//         if (activeTab) activeTab.scrollIntoView({ behavior: "smooth", inline: "center" })
//     }, [pathname])

//     return (
//         <>
//             {/* Mobile version: Dropdown */}
//             {/* <div className="block lg:hidden">
//                 <Popover open={open} onOpenChange={setOpen}>
//                     <PopoverTrigger asChild className="">
//                         <Button
//                             variant="outline"
//                             role="combobox"
//                             aria-expanded={open}
//                             ref={buttonRef}
//                             className="w-full max-w-lg justify-between cursor-pointer"
//                         >
//                             <span className="flex items-center truncate gap-2">
//                                 {CurrentIcon && <CurrentIcon className="h-4 w-4" />}
//                                 {current ? current.title : "Select a section"}
//                             </span>
//                             <ChevronDownIcon className="h-4 w-4 opacity-50" />
//                         </Button>
//                     </PopoverTrigger>

//                     <PopoverContent className="w-full p-0" align="center" sideOffset={10}
//                         style={{ width: width ? `${width}px` : "auto" }}
//                     >
//                         <Command className="w-full">
//                             <CommandInput placeholder="Search settings..." />
//                             <CommandList>
//                                 <CommandEmpty>No section found.</CommandEmpty>
//                                 <CommandGroup>
//                                     {items.map((item) => {
//                                         const Icon = item.icon
//                                             ? DynamicIcons[
//                                             item.icon.charAt(0).toUpperCase() +
//                                             item.icon.slice(1)
//                                             ]
//                                             : null

//                                         return (
//                                             <CommandItem
//                                                 key={item.href}
//                                                 onSelect={() => {
//                                                     setOpen(false)
//                                                     router.push(item.href)
//                                                 }}
//                                             >
//                                                 {Icon && <Icon className="mr-2 h-4 w-4" />}
//                                                 {item.title}
//                                                 {pathname === item.href && (
//                                                     <CheckIcon className="ml-auto h-4 w-4" />
//                                                 )}
//                                             </CommandItem>
//                                         )
//                                     })}
//                                 </CommandGroup>
//                             </CommandList>
//                         </Command>
//                     </PopoverContent>
//                 </Popover>
//             </div> */}

//             {/* Mobile version: Dropdown */}
//             {/* <Tabs
//                 className="block lg:hidden"
//                 value={currentTab}
//                 onValueChange={(val) => {
//                     if (val !== pathname) router.push(val)
//                 }}
//             >
//                 <ScrollArea>
//                     <TabsList className="mb-3 h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1 text-foreground">
//                         {items.map((item) => {
//                             const Icon =
//                                 item.icon &&
//                                     DynamicIcons[formatIconName(item.icon)]
//                                     ? DynamicIcons[formatIconName(item.icon)]
//                                     : null

//                             return (
//                                 <TabsTrigger
//                                     key={item.href}
//                                     value={item.href}
//                                     className="flex items-center gap-2 relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 
//                   hover:bg-accent hover:text-foreground "
//                                 >
//                                     {Icon && <Icon className="h-4 w-4" />}
//                                     {item.title}
//                                 </TabsTrigger>
//                             )
//                         })}
//                     </TabsList>
//                     <ScrollBar orientation="horizontal" />
//                 </ScrollArea>
//             </Tabs> */}

//             <ScrollArea>
//                 <div className="flex gap-2 border-b mb-3 px-1 py-2">
//                     {items.map((item) => {
//                         const isActive = pathname.startsWith(item.href)
//                         const Icon =
//                             item.icon && DynamicIcons[formatIconName(item.icon)]
//                                 ? DynamicIcons[formatIconName(item.icon)]
//                                 : null

//                         return (
//                             <Link
//                                 key={item.href}
//                                 href={item.href}
//                                 className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md relative
//                 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5
//                 hover:bg-accent hover:text-foreground
//                 ${isActive
//                                         ? "text-foreground after:bg-primary"
//                                         : "text-muted-foreground after:bg-transparent"
//                                     }
//               `}
//                             >
//                                 {Icon && <Icon className="h-4 w-4" />}
//                                 {item.title}
//                             </Link>
//                         )
//                     })}
//                 </div>
//                 <ScrollBar orientation="horizontal" />
//             </ScrollArea>


//             {/* Desktop version: Sidebar */}
//             <div className="hidden lg:block sticky top-6">
//                 <SidebarNav items={items} />
//             </div>
//         </>
//     )
// }


"use client"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as Icons from "lucide-react"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { SidebarNav } from "@/components/settings/sidebar-nav"

interface NavItem {
    href: string
    title: string
    icon?: string
}

interface ResponsiveSettingsNavProps {
    items: NavItem[]
}

export function ResponsiveSettingsNav({ items }: ResponsiveSettingsNavProps) {
    const pathname = usePathname()

    // Load all Lucide icons dynamically (once)
    const DynamicIcons = useMemo(
        () => Icons as unknown as Record<string, React.ElementType>,
        []
    )

    const formatIconName = (name: string) =>
        name.charAt(0).toUpperCase() + name.slice(1)

    return (
        <>
            {/* 🌐 Mobile version - Horizontal scrollable nav */}
            <ScrollArea className="block lg:hidden">
                <div className="flex gap-2 border-b mb-3 px-1 py-2">
                    {items.map((item) => {
                        
                        // Find the most specific matching item
                        const matchingItem = items
                            .filter(
                                (i) =>
                                    pathname === i.href ||
                                    pathname.startsWith(i.href + "/")
                            )
                            .sort((a, b) => b.href.length - a.href.length)[0]

                        const isActive = matchingItem?.href === item.href

                        const Icon =
                            item.icon && DynamicIcons[formatIconName(item.icon)]
                                ? DynamicIcons[formatIconName(item.icon)]
                                : null

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md relative
        after:absolute after:inset-x-0 after:bottom-0 after:h-0.5
        hover:bg-accent hover:text-foreground
        ${isActive
                                        ? "text-foreground after:bg-primary"
                                        : "text-muted-foreground after:bg-transparent"}
      `}
                            >
                                {Icon && <Icon className="h-4 w-4" />}
                                {item.title}
                            </Link>
                        )
                    })}
                </div>
                <ScrollBar orientation="horizontal" className="opacity-0" />
            </ScrollArea>

            {/* 💻 Desktop version - Sidebar */}
            <div className="hidden lg:block sticky top-6">
                <SidebarNav items={items} />
            </div>
        </>
    )
}
