// // import TacticalBoard from "@/components/TacticalBoard";
// // import { getBoardByIdAction } from "../actions";
// // import { Project } from "@/types/tactical-board";

// // export default async function BoardEditorPage({ params }: { params: Promise<{ id: string }> }) {
// //   const { id } = await params;

// //   // let initialBoards: any[] = [];
// //   let initialBoards: Project[] = [];

// //   // let isNewBoard = false;
  

// //   if (id !== "new") {
// //     try {
// //       const board = await getBoardByIdAction(id);
// //       if (board && !board.error) {
// //         initialBoards = [board];
// //       }
// //     } catch (error) {
// //       console.error("Error fetching board:", error);
// //     }
// //   } else {
// //     // isNewBoard = true;
// //   }

// //   return (
// //     <div className="w-full h-screen relative">
// //       {/* <TacticalBoard initialBoards={initialBoards} isNewBoard={isNewBoard} /> */}
// //       <TacticalBoard initialBoards={initialBoards} />
// //     </div>
// //   );
// // }

// import TacticalBoard from "@/components/TacticalBoard";
// import { getBoardByIdAction } from "../actions";
// import { Project } from "@/types/tactical-board";

// function createEmptyBoard(): Project {
//   return {
//     id: "",
//     name: "New Board",
//     scenes: [],
//     homeTeam: {
//       name: "Home",
//       primaryColor: "#ff0000",
//       secondaryColor: "#ffffff",
//       textColor: "#000000",
//     },
//     awayTeam: {
//       name: "Away",
//       primaryColor: "#0000ff",
//       secondaryColor: "#ffffff",
//       textColor: "#000000",
//     },
//     fieldType: "full",
//     fieldRotation: 0,
//     createdAt: Date.now(),
//     updatedAt: Date.now(),
//   };
// }

// export default async function BoardEditorPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = await params;

//   let initialBoards: Project[] = [];

//   try {
//     if (id === "new") {
//       initialBoards = [createEmptyBoard()];
//     } else {
//       const board = await getBoardByIdAction(id);

//       if (board) {
//         initialBoards = [board];
//       } else {
//         initialBoards = [createEmptyBoard()];
//       }
//     }
//   } catch (error) {
//     console.error(error);
//     initialBoards = [createEmptyBoard()];
//   }

//   return (
//     <div className="w-full h-screen relative">
//       <TacticalBoard initialBoards={initialBoards} />
//     </div>
//   );
// }


import TacticalBoard from "@/components/TacticalBoard";
import { getBoardByIdAction } from "../actions";
import { Project } from "@/types/tactical-board";

function createEmptyBoard(): Project {
  return {
    id: "",
    name: "New Board",
    scenes: [],
    homeTeam: {
      name: "Home",
      primaryColor: "#ef4444",
      secondaryColor: "#ffffff",
      textColor: "#ffffff",
    },
    awayTeam: {
      name: "Away",
      primaryColor: "#3b82f6",
      secondaryColor: "#ffffff",
      textColor: "#ffffff",
    },
    fieldType: "full",
    fieldRotation: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export default async function BoardEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let initialBoards: Project[] = [];

  try {
    if (id === "new") {
      initialBoards = [createEmptyBoard()];
    } else {
      const board = await getBoardByIdAction(id);

      if (board) {
        initialBoards = [board];
      } else {
        initialBoards = [createEmptyBoard()];
      }
    }
  } catch (err) {
    console.error(err);
    initialBoards = [createEmptyBoard()];
  }

  return (
    <div className="w-full h-screen relative">
      <TacticalBoard initialBoards={initialBoards} />
    </div>
  );
}
