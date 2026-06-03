import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL;

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${API_URL}/api/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ message: "Failed to fetch profile" }, { status: res.status });
  }

  const result = await res.json();
  return NextResponse.json(result);
}

export async function PUT(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const res = await fetch(`${API_URL}/api/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    return NextResponse.json({ message: errorText }, { status: res.status });
  }

  const result = await res.json();
  return NextResponse.json(result);
}
