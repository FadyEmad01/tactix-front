"use server"

import { cookies } from "next/headers"

export async function updateProfile(formData: FormData) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      throw new Error("Unauthorized — missing token")
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      cache: "no-store",
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Failed to update profile: ${errorText || res.statusText}`)
    }

    const data = await res.json()
    return data
  } catch (err: any) {
    console.error("updateProfile error:", err)
    throw new Error(err.message || "Something went wrong")
  }
}
