import { fetchUserProfile } from "@/lib/fetchUserProfile"
import { Separator } from "@/components/ui/separator"
import ProfileForm from "./ProfileForm"

export default async function SettingsPage() {
  const user = await fetchUserProfile()

  return (
    <div className="lg:space-y-6 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Update your profile details.
        </p>
      </div>
      <Separator />
      {/* ✨ نمرر بيانات السيرفر للفورم */}
      <ProfileForm user={user} />
    </div>
  )
}
