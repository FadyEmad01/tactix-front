// app/api/profile/route.ts
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(process.env.NEXT_PROFILE_API_URL!, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await res.json();
    
    if (!res.ok) {
      return NextResponse.json(result, { status: res.status });
    }

    // Log for debugging
    console.log("Profile GET response:", result);

    const response = NextResponse.json(result);
    
    // Set user cookie (non-httpOnly for client access)
    if (result.user) {
      response.cookies.set("user", JSON.stringify(result.user), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return response;
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    console.log("Updating profile with data:", body);
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    
    // Log the actual response from backend
    console.log("Backend PUT response:", result);
    console.log("Response status:", res.status);

    if (!res.ok) {
      console.error("Backend returned error:", result);
      return NextResponse.json(result, { status: res.status });
    }

    // Handle different response formats from backend
    let userData = null;
    
    // Check various possible response structures
    if (result.user) {
      userData = result.user;
    } else if (result.data?.user) {
      userData = result.data.user;
    } else if (result.data) {
      userData = result.data;
    } else {
      // If backend just returns the updated user directly
      userData = result;
    }

    console.log("Extracted user data:", userData);

    if (!userData || typeof userData !== 'object') {
      console.error("Could not extract user data from response:", result);
      return NextResponse.json(
        { message: "Invalid response format from backend" },
        { status: 500 }
      );
    }

    // Construct proper response with user object
    const responseData = {
      success: true,
      message: result.message || "Profile updated successfully",
      user: userData
    };

    const response = NextResponse.json(responseData);

    // IMPORTANT: Preserve the token cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Update user data cookie
    response.cookies.set("user", JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log("Cookies set successfully");

    return response;
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
}