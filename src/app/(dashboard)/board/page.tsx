import { cookies } from "next/headers";
import BoardsDashboard from "@/components/board/BoardsDashboard";
import { getBoardsAction } from "./actions";

export default async function BoardListingPage() {
   const boards = await getBoardsAction().catch(() => []);
   return <BoardsDashboard initialProjects={boards} />;
}
