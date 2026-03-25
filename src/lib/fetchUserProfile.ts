import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:3000";

export async function fetchUserProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/api/profile`, {
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
    
    // Backend returns { message, data: { username, profileImageUrl, ... } } or { user: {...} }
    const user = result?.data || result?.user || result;
    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}
