"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import * as Icons from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { SidebarNav } from "@/components/settings/sidebar-nav"

interface ResponsiveSettingsNavProps {
    items: {
        href: string
        title: string
        icon?: string
    }[]
}

export function ResponsiveSettingsNav({ items }: ResponsiveSettingsNavProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement | null>(null)
    const [popoverWidth, setPopoverWidth] = useState<number | null>(null)
    const [width, setWidth] = useState(0)

    const current = items.find((item) => item.href === pathname)

    // const DynamicIcons = Icons as unknown as Record<string, React.ElementType>
    const DynamicIcons = useMemo(
        () => Icons as unknown as Record<string, React.ElementType>,
        []
      )

    const formatIconName = (name: string) =>
        name.charAt(0).toUpperCase() + name.slice(1)

    const CurrentIcon =
        current?.icon && DynamicIcons[formatIconName(current.icon)]
            ? DynamicIcons[formatIconName(current.icon)]
            : null

    useEffect(() => {
        if (!buttonRef.current) return

        const updateWidth = () => {
            if (buttonRef.current) {
                setWidth(buttonRef.current.offsetWidth)
            }
        }

        updateWidth()
        const resizeObserver = new ResizeObserver(updateWidth)
        resizeObserver.observe(buttonRef.current)

        return () => resizeObserver.disconnect()
    }, [])

    useEffect(() => {
        const handleResize = () => {
          if (window.innerWidth >= 1024) setOpen(false)
        }
    
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
      }, [])

    return (
        <>
            {/* Mobile version: Dropdown */}
            <div className="block lg:hidden">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild className="">
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            ref={buttonRef}
                            className="w-full max-w-lg justify-between cursor-pointer"
                        >
                            <span className="flex items-center truncate gap-2">
                                {CurrentIcon && <CurrentIcon className="h-4 w-4" />}
                                {current ? current.title : "Select a section"}
                            </span>
                            <ChevronDownIcon className="h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-full p-0" align="center" sideOffset={10}
                        style={{ width: width ? `${width}px` : "auto" }}
                    >
                        <Command className="w-full">
                            <CommandInput placeholder="Search settings..." />
                            <CommandList>
                                <CommandEmpty>No section found.</CommandEmpty>
                                <CommandGroup>
                                    {items.map((item) => {
                                        const Icon = item.icon
                                            ? DynamicIcons[
                                            item.icon.charAt(0).toUpperCase() +
                                            item.icon.slice(1)
                                            ]
                                            : null

                                        return (
                                            <CommandItem
                                                key={item.href}
                                                onSelect={() => {
                                                    setOpen(false)
                                                    router.push(item.href)
                                                }}
                                            >
                                                {Icon && <Icon className="mr-2 h-4 w-4" />}
                                                {item.title}
                                                {pathname === item.href && (
                                                    <CheckIcon className="ml-auto h-4 w-4" />
                                                )}
                                            </CommandItem>
                                        )
                                    })}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Desktop version: Sidebar */}
            <div className="hidden lg:block sticky top-6">
                <SidebarNav items={items} />
            </div>
        </>
    )
}
