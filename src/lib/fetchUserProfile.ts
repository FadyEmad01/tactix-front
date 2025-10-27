import { cookies } from "next/headers";

export async function fetchUserProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch user profile:", res.status);
      return null;
    }

    const result = await res.json();

    const user = result?.user || result;
    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}
