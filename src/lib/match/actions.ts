"use server";

import { revalidatePath } from "next/cache";
import type { Project, TagPayload, BackendTag } from "@/types/match";
import { cookies } from "next/headers";


const API_URL = process.env.API_URL || "http://localhost:3000";

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
      teamALogo: m.teamALogo ?? "",
      teamB: m.teamB ?? "Team B",
      teamBLogo: m.teamBLogo ?? "",
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
    const raw = json.data ?? json;
    const match = raw.match ?? raw;

    if (!match || (!match.id && !match._id && !match.matchId)) {
      console.warn(`Match ${matchId} returned empty or invalid structure.`, json);
      return null;
    }

    return {
      id: match.id ?? match._id ?? String(match.matchId ?? ""),
      name: match.title ?? "Untitled Match",
      description: match.description ?? "",
      teamA: match.teamA ?? "Team A",
      teamALogo: match.teamALogo ?? "",
      teamB: match.teamB ?? "Team B",
      teamBLogo: match.teamBLogo ?? "",
      matchResult: match.matchResult ?? "",
      videoUrl: match.videoUrl ?? null,
      tags: Array.isArray(match.tags) ? match.tags : [],
      matchDate: match.matchDate ?? undefined,
      createdAt: match.createdAt ?? new Date().toISOString(),
    };
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
  teamALogo:string;
  teamB: string;
  teamBLogo:string;
  matchDate?: string;
  matchResult?: string;
}) {
  try {
    const headers = await getAuthHeaders();

    const payload = {
      title: data.title,
      description: data.description,
      teamA: data.teamA,
      teamALogo: data.teamALogo,
      teamB: data.teamB,
      teamBLogo: data.teamBLogo,
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
    teamALogo:string;
    teamBLogo:string;
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

// POST: Get presigned S3 upload URL for a tag clip
export async function getTagUploadUrl(tagId: string) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/tag/${tagId}/upload-url`, {
      method: "POST",
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Get upload URL failed for tag ${tagId}:`, res.status, text);
      return { success: false, error: text } as const;
    }

    const json = await res.json();
    const data = json?.data ?? json;
    if (!data?.url) {
      return { success: false, error: "Missing url in response" } as const;
    }
    return { success: true, data: data as { url: string; key?: string } } as const;
  } catch (error) {
    console.error("Error getting tag upload URL:", error);
    return { success: false, error } as const;
  }
}

// GET: Fetch tactical board linked to a tag
export async function getTagBoard(tagId: string) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/tag/${tagId}/board`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const rawText = await res.text();
    console.log(`[getTagBoard ${tagId}] status=${res.status} body=${rawText.slice(0, 500)}`);

    if (!res.ok) {
      return { success: false, status: res.status, error: rawText } as const;
    }

    let json: unknown;
    try { json = JSON.parse(rawText); } catch { json = null; }
    const j = json as { data?: unknown } | null;
    const data = j?.data;
    const board = Array.isArray(data) ? data[0] : data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const boardId = (board as any)?._id || (board as any)?.id;
    if (!boardId) {
      return { success: false, error: "No board ID in response" } as const;
    }
    return { success: true, boardId: String(boardId) } as const;
  } catch (error) {
    console.error("Error getting tag board:", error);
    return { success: false, error } as const;
  }
}

// POST: Create a new tactical board linked to the tag
export async function linkTagToBoard(tagId: string) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/tag/${tagId}/link`, {
      method: "POST",
      headers,
    });

    const rawText = await res.text();
    console.log(`[linkTagToBoard ${tagId}] status=${res.status} body=${rawText.slice(0, 500)}`);

    if (!res.ok) {
      const alreadyExists = rawText.toLowerCase().includes("already exists");
      return {
        success: false,
        error: rawText,
        status: res.status,
        alreadyExists,
      } as const;
    }

    let json: unknown;
    try { json = JSON.parse(rawText); } catch { json = null; }
    const j = json as { data?: unknown } | null;
    const data = j?.data;
    const board = Array.isArray(data) ? data[0] : data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const boardId = (board as any)?._id || (board as any)?.id;
    if (!boardId) {
      return { success: false, error: "No board ID in link response" } as const;
    }
    return { success: true, boardId: String(boardId) } as const;
  } catch (error) {
    console.error("Error linking tag to board:", error);
    return { success: false, error } as const;
  }
}

// POST: Confirm S3 upload completed → backend persists permanent URL
export async function verifyTagUpload(tagId: string) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/tag/${tagId}/verify-upload`, {
      method: "POST",
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Verify upload failed for tag ${tagId}:`, res.status, text);
      return { success: false, error: text } as const;
    }

    const json = await res.json();
    const url = typeof json?.data === "string" ? json.data : json?.data?.url;
    return { success: true, url: url as string | undefined } as const;
  } catch (error) {
    console.error("Error verifying tag upload:", error);
    return { success: false, error } as const;
  }
}
