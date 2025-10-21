// export async function login(data: { email: string; password: string }) {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       // credentials: "include",
//       body: JSON.stringify(data),
//     });
  
//     const result = await res.json();
    
//     if (!res.ok) throw new Error(result.message || "Login failed");

//     console.log(result)

//     if (result.token) {
//       sessionStorage.setItem("token", result.token);
//       sessionStorage.setItem("user", JSON.stringify(result.user));
//     }

//     return result;
//   }
  
  export async function login(data: { email: string; password: string }) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  
    const result = await res.json();
  
    if (!res.ok) throw new Error(result.message || "Login failed");
  
    // ✅ ممكن تحتفظ باليوزر في sessionStorage للـ UI فقط
    sessionStorage.setItem("user", JSON.stringify(result.user));
  
    return result;
  }