export const dynamic = "force-dynamic";

import { fetchMatches } from "@/lib/match/actions";
import MatchesDashboard from "./MatchesDashboard-test";

export default async function ProjectsPage() {
  const matches = (await fetchMatches().catch(() => [])) || [];

  console.log(matches)
  return <MatchesDashboard initialProjects={matches} />;
}
    