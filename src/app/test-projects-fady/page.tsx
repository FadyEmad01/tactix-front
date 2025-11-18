import { fetchMatches } from "@/lib/matches";
import MatchesDashboard from "./client/page";

export default async function Page() {
  // This runs on the server. Cookies are accessible here via the lib function.
  const matches = await fetchMatches();

  return (
    <MatchesDashboard initialProjects={matches} />
  );
}