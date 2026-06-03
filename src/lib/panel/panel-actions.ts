"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL || "http://localhost:3000";

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type Panel = {
  id: string;
  title: string;
  tags: string[];
  createdAt?: string;
};

export type PanelPayload = {
  title: string;
  tags: string[];
};

/* -------------------------------------------------------------------------- */
/*                               GET ALL PANELS                               */
/* -------------------------------------------------------------------------- */

export async function fetchPanels(): Promise<Panel[]> {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/api/panel`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch panels", res.status);
      return [];
    }

    const json = await res.json();

    let panels: any[] = [];

    if (Array.isArray(json)) {
      panels = json;
    } else if (json.data && Array.isArray(json.data)) {
      panels = json.data;
    } else if (json.panels && Array.isArray(json.panels)) {
      panels = json.panels;
    } else {
      console.warn("Unexpected panel response structure", json);
      return [];
    }

    return panels.map((p) => ({
      id: p.id ?? p._id ?? "",
      title: p.title ?? "Untitled Panel",
      tags: Array.isArray(p.tags) ? p.tags : [],
      createdAt: p.createdAt ?? new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching panels:", error);
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/*                              FETCH PANEL BY ID                             */
/* -------------------------------------------------------------------------- */

export async function fetchPanelById(panelId: string): Promise<Panel | null> {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/api/panel/${panelId}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch panel", res.status);
      return null;
    }

    const json = await res.json();
    const panel = json.data ?? json;

    return {
      id: panel.id ?? panel._id ?? "",
      title: panel.title ?? "Untitled Panel",
      tags: Array.isArray(panel.tags) ? panel.tags : [],
      createdAt: panel.createdAt,
    };
  } catch (error) {
    console.error("Error fetching panel:", error);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*                               CREATE PANEL                                 */
/* -------------------------------------------------------------------------- */

export async function createPanel(data: PanelPayload) {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/api/panel`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Create panel failed:", res.status, errorText);

      return { success: false, error: errorText } as const;
    }

    const json = await res.json();

    // Extract the panel data from response
    const panelData = json.data ?? json;

    const panel: Panel = {
      id: panelData.id ?? panelData._id ?? "",
      title: panelData.title ?? "Untitled Panel",
      tags: Array.isArray(panelData.tags) ? panelData.tags : [],
      createdAt: panelData.createdAt ?? new Date().toISOString(),
    };

    revalidatePath("/tags");

    return { success: true, data: panel } as const;
  } catch (error) {
    console.error("Error creating panel:", error);
    return { success: false, error } as const;
  }
}

/* -------------------------------------------------------------------------- */
/*                               UPDATE PANEL                                 */
/* -------------------------------------------------------------------------- */

export async function updatePanel(
  panelId: string,
  updates: Partial<PanelPayload>
) {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/api/panel/${panelId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Update panel failed:", res.status, errorText);

      return { success: false, error: errorText } as const;
    }

    const json = await res.json();

    // Extract the panel data from response
    const panelData = json.data ?? json;

    const panel: Panel = {
      id: panelData.id ?? panelData._id ?? "",
      title: panelData.title ?? "Untitled Panel",
      tags: Array.isArray(panelData.tags) ? panelData.tags : [],
      createdAt: panelData.createdAt,
    };

    revalidatePath("/tags");

    return { success: true, data: panel } as const;
  } catch (error) {
    console.error("Error updating panel:", error);
    return { success: false, error } as const;
  }
}

/* -------------------------------------------------------------------------- */
/*                               DELETE PANEL                                 */
/* -------------------------------------------------------------------------- */

export async function deletePanel(panelId: string) {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_URL}/api/panel/${panelId}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      console.error("Delete panel failed", res.status);
      return { success: false } as const;
    }

    revalidatePath("/tags");

    return { success: true } as const;
  } catch (error) {
    console.error("Error deleting panel:", error);
    return { success: false, error } as const;
  }
}