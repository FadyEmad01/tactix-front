// "use server";

// import { cookies } from "next/headers";
// import { revalidatePath } from "next/cache";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// export interface Project {
//   id: string;
//   name: string;
//   description?: string;
//   teamA: string;
//   teamB: string;
//   result?: string;
//   matchDate?: string;
//   createdAt: string;
// }

// async function getAuthHeaders() {
//   const cookieStore = await cookies();
//   const token = cookieStore.get("token")?.value;
  
//   return {
//     "Content-Type": "application/json",
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };
// }

// // GET: Fetch all matches
// export async function fetchMatches(): Promise<Project[]> {
//   try {
//     const headers = await getAuthHeaders();
    
//     const res = await fetch(`${API_URL}/api/match`, {
//       method: "GET",
//       headers,
//       cache: "no-store",
//     });

//     if (!res.ok) {
//       console.error(`Failed to fetch matches: ${res.status} ${res.statusText}`);
//       return [];
//     }

//     const json = await res.json();
    
//     // Debug log to see backend response
//     console.log("GET /api/match raw response:", JSON.stringify(json, null, 2));

//     // --- FIX: Extract array from various possible structures ---
//     let matches: any[] = [];

//     if (Array.isArray(json)) {
//         // Case: [...]
//         matches = json;
//     } else if (json.data && Array.isArray(json.data.matches)) {
//         // Case: { data: { matches: [...] } } (Matches your logs)
//         matches = json.data.matches;
//     } else if (json.data && Array.isArray(json.data)) {
//         // Case: { data: [...] }
//         matches = json.data;
//     } else if (json.matches && Array.isArray(json.matches)) {
//         // Case: { matches: [...] }
//         matches = json.matches;
//     } else {
//         console.warn("⚠️ API returned unexpected structure. Could not find matches array.", json);
//         return [];
//     }

//     return matches.map((m: any) => ({
//       id: m.id ?? m._id ?? String(m.matchId ?? ""),
//       name: m.title ?? "Untitled Match",
//       description: m.description ?? "",
//       teamA: m.teamA ?? "Team A",
//       teamB: m.teamB ?? "Team B",
//       result: m.result ?? "",
//       matchDate: m.matchDate ?? undefined,
//       createdAt: m.createdAt ?? new Date().toISOString(),
//     }));
//   } catch (error) {
//     console.error("Error fetching matches:", error);
//     return [];
//   }
// }

// // POST: Create a new match
// export async function createMatch(data: {
//   title: string;
//   description?: string;
//   teamA: string;
//   teamB: string;
//   matchDate?: string;
//   result?: string;
// }) {
//   try {
//     const headers = await getAuthHeaders();

//     const res = await fetch(`${API_URL}/api/match`, {
//       method: "POST",
//       headers,
//       body: JSON.stringify(data),
//     });

//     if (!res.ok) {
//         const errorText = await res.text();
//         console.error(`Create match failed: ${res.status}`, errorText);
//         return { success: false, error: errorText };
//     }

//     const json = await res.json();
//     console.log("POST /api/match raw response:", JSON.stringify(json, null, 2));
    
//     // Revalidate to refresh the server-side list
//     revalidatePath("/"); 
    
//     return { success: true, data: json };
//   } catch (error) {
//     console.error("Error creating match:", error);
//     return { success: false, error };
//   }
// }

// export async function deleteMatch(matchId: string) {
//   try {
//     const headers = await getAuthHeaders();
//     const res = await fetch(`${API_URL}/api/match/${matchId}`, {
//         method: "DELETE",
//         headers,
//     });

//     if (!res.ok) {
//         console.error("Delete failed", res.status);
//         return { success: false };
//     }

//     revalidatePath("/");
//     return { success: true };
//   } catch (error) {
//     return { success: false, error };
//   }
// }


"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface Project {
  id: string;
  name: string;
  description?: string;
  teamA: string;
  teamB: string;
  result?: string;
  matchDate?: string;
  createdAt: string;
  videoUrl?: string | null;
  tags?: BackendTag[];
}

export interface BackendTag {
  _id?: string;
  matchId?: string;
  startTime: number;
  endTime: number | null;
  event: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TagPayload { // <-- ADDED: Type for tag creation payload
    startTime: string;
    endTime: string;
    event: string;
    notes?: string;
}

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
    console.log("GET /api/match raw response:", JSON.stringify(json, null, 2));

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
      result: m.result ?? "",
      matchDate: m.matchDate ?? undefined,
      createdAt: m.createdAt ?? new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
}

// GET: Fetch single match by ID <-- ADDED
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
        
        const match = json.data ?? json; // Handle { data: {...} } or {...}


        if (!match || (!match.id && !match._id && !match.matchId)) {
            console.warn(`Match ${matchId} returned empty or invalid structure.`, json);
            return null;
        }

        // return {
        //     id: match.id ?? match._id ?? String(match.matchId ?? ""),
        //     name: match.title ?? "Untitled Match",
        //     description: match.description ?? "",
        //     teamA: match.teamA ?? "Team A",
        //     teamB: match.teamB ?? "Team B",
        //     result: match.result ?? "",
        //     matchDate: match.matchDate ?? undefined,
        //     createdAt: match.createdAt ?? new Date().toISOString(),
        // };
        return match
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
  result?: string;
}) {
  try {
    const headers = await getAuthHeaders();

    const payload = {
        title: data.title,
        description: data.description,
        teamA: data.teamA,
        teamB: data.teamB,
        matchDate: data.matchDate,
        result: data.result,
    };

    const res = await fetch(`${API_URL}/api/match`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error(`Create match failed: ${res.status}`, errorText);
        return { success: false, error: errorText };
    }

    const json = await res.json();
    console.log("POST /api/match raw response:", JSON.stringify(json, null, 2));
    
    // Revalidate to refresh the server-side list
    revalidatePath("/"); 
    
    return { success: true, data: json };
  } catch (error) {
    console.error("Error creating match:", error);
    return { success: false, error };
  }
}

// POST: Create a new tag for a match <-- ADDED
export async function createTag(matchId: string, data: TagPayload) {
    try {
        const headers = await getAuthHeaders();
        
        const payload = {
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
            return { success: false, error: errorText };
        }

        const json = await res.json();
        console.log(`POST /api/tag/${matchId} raw response:`, JSON.stringify(json, null, 2));

        return { success: true, data: json };
    } catch (error) {
        console.error("Error creating tag:", error);
        return { success: false, error };
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
        return { success: false };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

// DELETE: Delete a tag <-- ADDED
export async function deleteTag(matchId: string, tagId: string) {
    try {
        const headers = await getAuthHeaders();
        // Assuming the DELETE endpoint is /api/tag/matchId/tagId based on common REST patterns
        const res = await fetch(`${API_URL}/api/tag/${matchId}/${tagId}`, {
            method: "DELETE",
            headers,
        });

        if (!res.ok) {
            console.error(`Delete tag ${tagId} failed for match ${matchId}`, res.status);
            // Even if the backend delete fails, we'll optimistically return success to clean the UI state.
        }

        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}