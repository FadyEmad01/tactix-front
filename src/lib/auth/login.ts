export async function login(data: { email: string; password: string }) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  
    const result = await res.json();
    
    if (!res.ok) throw new Error(result.message || "Login failed");
    return result;
  }
  