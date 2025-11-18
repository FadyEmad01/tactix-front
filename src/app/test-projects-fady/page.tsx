export const dynamic = "force-dynamic";

import { fetchMatches } from "@/lib/matches";
import MatchesDashboard from "./client/page";

export default async function Page() {
  const matches = await fetchMatches().catch(() => []) || [];
  return <MatchesDashboard initialProjects={matches} />;
}