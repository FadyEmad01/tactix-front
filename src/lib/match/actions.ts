"use server";

import { revalidatePath } from "next/cache";
import type { Project, TagPayload, BackendTag } from "@/types/match";
import { cookies } from "next/headers";


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// GET: Fetch all matches
export async function fetchMatches(): Promise<Project[]> {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/api/match`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Failed to fetch matches: ${res.status} ${res.statusText}`);
      return [];
    }

    const json = await res.json();

    // Debug log to see backend response
    // console.log("GET /api/match raw response:", JSON.stringify(json, null, 2));

    // --- FIX: Extract array from various possible structures ---
    let matches: any[] = [];

    if (Array.isArray(json)) {
      // Case: [...]
      matches = json;
    } else if (json.data && Array.isArray(json.data.matches)) {
      // Case: { data: { matches: [...] } } (Matches your logs)
      matches = json.data.matches;
    } else if (json.data && Array.isArray(json.data)) {
      // Case: { data: [...] }
      matches = json.data;
    } else if (json.matches && Array.isArray(json.matches)) {
      // Case: { matches: [...] }
      matches = json.matches;
    } else {
      console.warn("⚠️ API returned unexpected structure. Could not find matches array.", json);
      return [];
    }

    return matches.map((m: any) => ({
      id: m.id ?? m._id ?? String(m.matchId ?? ""),
      name: m.title ?? "Untitled Match",
      description: m.description ?? "",
      teamA: m.teamA ?? "Team A",
      teamB: m.teamB ?? "Team B",
      matchResult: m.matchResult ?? "",
      tags: Array.isArray(m.tags) ? m.tags : [],
      matchDate: m.matchDate ?? undefined,
      createdAt: m.createdAt ?? new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
}

// GET: Fetch single match by ID
export async function fetchMatchById(matchId: string): Promise<Project | null> {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/api/match/${matchId}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Failed to fetch match ${matchId}: ${res.status} ${res.statusText}`);
      return null;
    }

    const json = await res.json();
    const match = json.data ?? json;

    if (!match || (!match.id && !match._id && !match.matchId)) {
      console.warn(`Match ${matchId} returned empty or invalid structure.`, json);
      return null;
    }

    return match;
  } catch (error) {
    console.error(`Error fetching match ${matchId}:`, error);
    return null;
  }
}

// POST: Create a new match
export async function createMatch(data: {
  title: string;
  description?: string;
  teamA: string;
  teamB: string;
  matchDate?: string;
  matchResult?: string;
}) {
  try {
    const headers = await getAuthHeaders();

    const payload = {
      title: data.title,
      description: data.description,
      teamA: data.teamA,
      teamB: data.teamB,
      matchDate: data.matchDate,
      matchResult: data.matchResult,
    };

    const res = await fetch(`${API_URL}/api/match`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Create match failed: ${res.status}`, errorText);
      return { success: false, error: errorText } as const;
    }

    const json = await res.json();

    // console.log("📥 Backend response:", json);

    revalidatePath("/");
    return { success: true, data: json } as const;
  } catch (error) {
    console.error("Error creating match:", error);
    return { success: false, error } as const;
  }
}

// PUT: Update an existing match
export async function updateMatch(
  matchId: string,
  updates: Partial<{
    title: string;
    description?: string;
    teamA: string;
    teamB: string;
    matchDate?: string;
    result?: string;
  }>,
) {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/api/match/${matchId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Update match failed: ${res.status}`, errorText);
      return { success: false, error: errorText } as const;
    }

    const json = await res.json();
    revalidatePath("/");
    return { success: true, data: json } as const;
  } catch (error) {
    console.error("Error updating match:", error);
    return { success: false, error } as const;
  }
}

// DELETE: Delete a match
export async function deleteMatch(matchId: string) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/match/${matchId}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      console.error("Delete failed", res.status);
      return { success: false } as const;
    }

    revalidatePath("/");
    return { success: true } as const;

  } catch (error) {
    return { success: false, error } as const;
  }
}

// POST: Create a new tag for a match
export async function createTag(matchId: string, data: TagPayload) {
  try {
    const headers = await getAuthHeaders();

    const payload: TagPayload = {
      startTime: data.startTime,
      endTime: data.endTime,
      event: data.event,
      notes: data.notes,
    };

    const res = await fetch(`${API_URL}/api/tag/${matchId}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Create tag failed for match ${matchId}: ${res.status}`, errorText);
      return { success: false, error: errorText } as const;
    }

    const json = await res.json();
    return { success: true, data: json } as const;
  } catch (error) {
    console.error("Error creating tag:", error);
    return { success: false, error } as const;
  }
}

// PUT: Update an existing tag
export async function updateTag(tagId: string, data: TagPayload) {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/api/tag/${tagId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Update tag failed for tag ${tagId}: ${res.status}`, errorText);
      return { success: false, error: errorText } as const;
    }

    const json = await res.json();
    return { success: true, data: json } as const;
  } catch (error) {
    console.error("Error updating tag:", error);
    return { success: false, error } as const;
  }
}

// DELETE: Delete a tag (by tag ID only, matches new API)
export async function deleteTag(tagId: string) {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/api/tag/${tagId}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      console.error(`Delete tag ${tagId} failed`, res.status);
    }

    return { success: true } as const;
  } catch (error) {
    return { success: false, error } as const;
  }
}
