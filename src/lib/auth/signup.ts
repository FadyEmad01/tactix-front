export async function signUp(formData: FormData) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        body: formData,
    });

    const result = await res.json();
    
    if (!res.ok) throw new Error(result.message || "Signup failed");
    return result;
}
