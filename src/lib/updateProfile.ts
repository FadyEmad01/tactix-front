"use server"

import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export async function updateProfile(formData: FormData) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      throw new Error("Unauthorized — missing token")
    }

    // Check if FormData has a file
    let hasFile = false
    let userName = ""
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        hasFile = true
      } else if (key === "userName") {
        userName = value as string
      }
    }

    // If there's a file, send FormData (multipart/form-data)
    // If no file, send JSON (application/json) - backend expects this format
    let body: BodyInit
    let headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
    }

    if (hasFile) {
      // Send FormData when there's a file (image upload - commented out for now)
      // Don't set Content-Type - browser will set it automatically with boundary
      body = formData
    } else {
      // Send JSON when there's no file (backend expects JSON format)
      body = JSON.stringify({ userName })
      headers["Content-Type"] = "application/json"
    }

    const res = await fetch(`${API_URL}/api/profile`, {
      method: "PUT",
      headers,
      body,
      cache: "no-store",
    })

    if (!res.ok) {
      const errorText = await res.text()
      let errorMessage = errorText
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorText
      } catch {
        // If not JSON, use text as is
      }
      throw new Error(errorMessage || `Failed to update profile: ${res.statusText}`)
    }

    const result = await res.json()
    return result
  } catch (err: any) {
    console.error("updateProfile error:", err)
    throw new Error(err.message || "Something went wrong")
  }
}