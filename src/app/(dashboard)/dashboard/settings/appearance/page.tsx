"use client"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Controller, useForm } from "react-hook-form"
import ImageCropperForm from "@/components/settings/ImageCropperForm"
import DarkLightMode from "@/components/theme/DarkLightMode"

// export const metadata: Metadata = {
//   title: "Settings",
//   description: "Manage your account settings",
// }


export default function AppearancePage() {

  return (
    <>
      <div className="lg:space-y-6 space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Appearance
          </h2>
          {/* <h3 className="text-lg font-medium">Profile</h3> */}
          <p className="text-sm text-muted-foreground">
            Change as u like in the website.
          </p>
        </div>
        <Separator />
        <Card>
          <CardHeader>
            <CardTitle>Website Settings</CardTitle>
            <CardDescription>
              Make changes to your website here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DarkLightMode />
          </CardContent>
        </Card>
      </div>
    </>

  )
}