import MatchEditorPage from "./client";

interface MatchPageProps {
  params: Promise<{ matchId: any }>;
}
export default async function Page({ params }: MatchPageProps) {
  const { matchId } = await params;

  return (
    <MatchEditorPage matchId={matchId}/>
  );
}
  