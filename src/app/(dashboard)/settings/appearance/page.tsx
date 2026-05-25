"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import DarkLightMode from "@/components/theme/DarkLightMode"
import { ThemePresetSelect } from "@/components/theme/ThemePresetSelect"

export default function AppearancePage() {
  return (
    <div className="lg:space-y-6 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Appearance
        </h2>
        <p className="text-sm text-muted-foreground">
          Customize the look and feel of the website.
        </p>
      </div>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>Mode</CardTitle>
          <CardDescription>
            Choose between light, dark, or system mode.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DarkLightMode />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Theme Preset</CardTitle>
          <CardDescription>
            Select a color theme that applies instantly across the website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemePresetSelect />
        </CardContent>
      </Card>
    </div>
  )
}
