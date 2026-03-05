export const dynamic = "force-dynamic";

import { fetchMatches } from "@/lib/match/actions";
import MatchesDashboard from "@/components/projects/MatchesDashboard";

export default async function ProjectsPage() {
  const matches = (await fetchMatches().catch(() => [])) || [];

  return <MatchesDashboard initialProjects={matches} />;
}
    