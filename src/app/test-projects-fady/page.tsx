export const dynamic = "force-dynamic";

import { fetchMatches } from "@/lib/matches";
import MatchesDashboard from "@/components/projects/MatchesDashboard";

export default async function Page() {
  const matches = (await fetchMatches().catch(() => [])) || [];
  return <MatchesDashboard initialProjects={matches} />;
}
