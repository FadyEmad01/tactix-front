"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import * as Icons from "lucide-react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon?: string
  }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  const DynamicIcons = Icons as unknown as Record<string, React.ElementType>

  const formatIconName = (name: string) =>
    name.charAt(0).toUpperCase() + name.slice(1)

  return (
    <nav
      className={cn(
        "flex lg:flex-col lg:space-y-1 flex-wrap gap-y-2 md:gap-y-0",
        className
      )}
      {...props}
    >
      {items.map((item) => {
        const Icon =
          item.icon && DynamicIcons[formatIconName(item.icon)]

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === item.href
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start gap-2"
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
