"use server"
import { cookies } from "next/headers";
import { Project } from "@/types/tactical-board";

const API_URL = process.env.API_URL;

async function getAuthHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("No token found");
  }

  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

// function stripIds(project: Partial<Project>) {
//   const data = JSON.parse(JSON.stringify(project)) as any;
//   delete data.id;
//   if (data.scenes && Array.isArray(data.scenes)) {
//     data.scenes.forEach((s: any) => {
//         delete s.id
//     });
//   }
//   return data;
// }

// function stripIds(project: Partial<Project>, isUpdate: boolean = false) {
//   const data = JSON.parse(JSON.stringify(project)) as any;

//   // Always remove the top-level ID from the BODY 
//   // because it's already in the URL for PATCH
//   delete data.id;
//   delete data._id;

//   // IMPORTANT: Only strip scene IDs if we are creating a BRAND NEW board.
//   // If we are updating, we NEED these IDs to tell the DB which scenes to change.
//   if (!isUpdate && data.scenes && Array.isArray(data.scenes)) {
//     data.scenes.forEach((s: any) => {
//       delete s.id;
//       delete s._id;
//     });
//   }
//   return data;
// }

function stripIds(project: any) {
  const data = JSON.parse(JSON.stringify(project));

  delete data.id;
  delete data._id;

  if (data.scenes) {
    data.scenes.forEach((scene: any) => {
      delete scene.id;
      delete scene._id;

      scene.players?.forEach((p: any) => {
        delete p.id;
        delete p._id;
      });

      scene.balls?.forEach((b: any) => {
        delete b.id;
        delete b._id;
      });

      scene.drawings?.forEach((d: any) => {
        delete d.id;
        delete d._id;
      });

      scene.arrows?.forEach((a: any) => {
        delete a.id;
        delete a._id;
      });
    });
  }

  return data;
}



export async function createBoardAction(project: Project) {
  const payload = stripIds(project);
  const res = await fetch(`${API_URL}/api/board`, {
    method: "POST",
    headers: await getAuthHeader(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Create Error:", errorText);
    throw new Error("Failed to create board");
  }
  return res.json();
}

// export async function createBoardAction() {
//   const res = await fetch(`${API_URL}/api/board`, {
//     method: "POST",
//     headers: await getAuthHeader(),
//     // Sending an empty object if the backend handles all defaults
//     body: JSON.stringify({}) 
//   });

//   if (!res.ok) {
//     const errorText = await res.text();
//     console.error(errorText);
//     throw new Error("Failed to create board");
//   }

//   return res.json(); // This should return { id: "..." }
// }

// export async function createBoardAction() {
//   const res = await fetch(`${API_URL}/api/board`, {
//     method: "POST",
//     headers: await getAuthHeader(),
//     // Try sending a minimal name instead of just {}
//     body: JSON.stringify({ 
//       name: "Untitled Board" 
//     }) 
//   });

//   if (!res.ok) {
//     const errorText = await res.text();
//     // LOOK AT YOUR TERMINAL (SERVER LOGS) FOR THIS:
//     console.error("Backend Error:", errorText); 
//     throw new Error("Failed to create board");
//   }

//   return res.json();
// }

// export async function updateBoardAction(boardId: string, project: Project) {
//   const payload = stripIds(project);
//   const res = await fetch(`${API_URL}/api/board/${boardId}`, {
//     method: "PATCH",
//     headers: await getAuthHeader(),
//     body: JSON.stringify(payload)
//   });
//   if (!res.ok) {
//     console.error(await res.text());
//     throw new Error("Failed to update board");
//   }
//   return res.json();
// }

export async function updateBoardAction(boardId: string, project: Project) {
  const payload = stripIds(project);
  const res = await fetch(`${API_URL}/api/board/${boardId}`, {
    method: "PATCH",
    headers: await getAuthHeader(),
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Update Error:", errorText);
    throw new Error("Failed to update board");
  }
  return res.json();
}

export async function deleteBoardAction(boardId: string) {
  const res = await fetch(`${API_URL}/api/board/${boardId}`, {
    method: "DELETE",
    headers: await getAuthHeader(),
  });
  if (!res.ok) throw new Error("Failed to delete board");
  return res.json();
}

export async function getBoardsAction() {
  const res = await fetch(`${API_URL}/api/board`, {
    headers: await getAuthHeader(),
    cache: "no-store"
  });
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.boards)) return data.boards;
  return [];
}

// export async function getBoardByIdAction(boardId: string) {
//   const res = await fetch(`${API_URL}/api/board/${boardId}`, {
//     headers: await getAuthHeader(),
//     cache: "no-store"
//   });
//   if (!res.ok) throw new Error("Failed to fetch board");
//   const data = await res.json();
//   return data.data || data.board || data;
// }

export async function getBoardByIdAction(boardId: string) {
  const res = await fetch(`${API_URL}/api/board/${boardId}`, {
    headers: await getAuthHeader(),
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch board");

  const json = await res.json();

  let board;

  // backend بيرجع array
  if (Array.isArray(json.data)) {
    board = json.data[0];
  } else {
    board = json.data;
  }

  if (!board) return null;

  // ✅ تحويل _id → id
  return {
    ...board,
    id: board._id,
  };
}



export async function deleteSceneAction(boardId: string, sceneId: string) {
  const res = await fetch(`${API_URL}/api/board/${boardId}/${sceneId}`, {
    method: "DELETE",
    headers: await getAuthHeader(),
  });
  if (!res.ok) throw new Error("Failed to delete scene");
  return res.json();
}
