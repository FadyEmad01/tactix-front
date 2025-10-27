import ProfileContent from "./ProfileContent";
import { fetchUserProfile } from "@/lib/fetchUserProfile";

export default async function ProfilePage() {
  const user = await fetchUserProfile();

  return <ProfileContent user={user} />;
}