// lib/auth/profile.ts

export async function getProfile() {
  try {
    const res = await fetch("/api/profile", {
      credentials: 'include',
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Fetch profile failed");
    }
    
    const result = await res.json();
    console.log("getProfile result:", result);
    
    return result;
  } catch (error) {
    console.error("getProfile error:", error);
    throw error;
  }
}

export async function updateProfile(data: Record<string, any>) {
  try {
    console.log("Updating profile with:", data);
    
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    
    const result = await res.json();
    console.log("updateProfile raw response:", result);
    
    if (!res.ok) {
      throw new Error(result.message || "Update profile failed");
    }
    
    // More flexible validation - check if we have user data in any format
    const hasUserData = result.user || result.data?.user || result.data;
    
    if (!hasUserData) {
      console.error("Response structure:", result);
      throw new Error("Invalid response from server - no user data found");
    }
    
    console.log("Profile updated successfully:", result);
    return result;
  } catch (error) {
    console.error("Profile update error:", error);
    throw error;
  }
}