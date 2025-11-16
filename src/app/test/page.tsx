import { Separator } from "@/components/ui/separator"
import ProfileForm from "./ProfileForm"

export default async function SettingsPage() {
  // Removed fetch - testing PUT only
  return (
    <div className="lg:space-y-6 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Update your profile details.
        </p>
      </div>
      <Separator />
      {/* Testing PUT only - no initial user data */}
      <ProfileForm user={null} />
    </div>
  )
}
