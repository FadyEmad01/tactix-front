"use server"

import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// Update user profile (PUT only - no fetch)
export async function updateProfile(formData: FormData) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      throw new Error("Unauthorized — missing token")
    }

    // Debug: Log FormData contents
    console.log("📤 Server - Processing update request:")
    const formDataEntries: Array<[string, string | File]> = []
    let hasFile = false
    let userName = ""
    
    for (const [key, value] of formData.entries()) {
      formDataEntries.push([key, value])
      if (value instanceof File) {
        hasFile = true
        console.log(`  ${key}: ${value.name} (${value.size} bytes, ${value.type})`)
      } else {
        if (key === "userName") {
          userName = value as string
        }
        console.log(`  ${key}: "${value}"`)
      }
    }
    
    // Check if we have any data to send
    if (formDataEntries.length === 0) {
      throw new Error("No data to update")
    }
    
    // Log the API URL being used
    console.log(`  API URL: ${API_URL}/api/profile`)
    console.log(`  Token exists: ${token ? "Yes" : "No"}`)
    console.log(`  Has file: ${hasFile}`)

    // If there's a file, send FormData (multipart/form-data)
    // If no file, send JSON (application/json) - backend expects this format
    let body: BodyInit
    let headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
    }

    if (hasFile) {
      // Send FormData when there's a file
      // Don't set Content-Type - browser will set it automatically with boundary for multipart/form-data
      body = formData
      console.log("📤 Sending as FormData (multipart/form-data)")
      console.log("  - FormData includes userName and profileImageUrl (file)")
      // Log all entries for debugging
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  - ${key}: File - ${value.name}, ${value.size} bytes, ${value.type}`)
        } else {
          console.log(`  - ${key}: ${value}`)
        }
      }
    } else {
      // Send JSON when there's no file (backend expects JSON format)
      body = JSON.stringify({ userName })
      headers["Content-Type"] = "application/json"
      console.log("📤 Sending as JSON:", { userName })
    }

    const res = await fetch(`${API_URL}/api/profile`, {
      method: "PUT",
      headers,
      body,
      cache: "no-store",
    })

    console.log("📥 Response status:", res.status)

    if (!res.ok) {
      const errorText = await res.text()
      console.error("❌ Error response:", errorText)
      
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
    console.log("✅ Success response:", result)
    return result
  } catch (err: any) {
    console.error("❌ updateProfile error:", err)
    throw new Error(err.message || "Something went wrong")
  }
}

