import { Separator } from "@/components/ui/separator"
import { fetchUserProfile } from "@/lib/fetchUserProfile"
import ProfileSettingsForm from "./ProfileSettingsForm"

export default async function SettingsPage() {
  // Fetch user data server-side
  const user = await fetchUserProfile()

  return (
    <div className="lg:space-y-6 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Profile
        </h2>
        <p className="text-sm text-muted-foreground">
          Update your profile details.
        </p>
      </div>
      <Separator />
      <ProfileSettingsForm user={user} />
    </div>
  )
}
