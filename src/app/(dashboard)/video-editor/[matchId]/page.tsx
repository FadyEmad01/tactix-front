import MatchVideoEditor from "@/components/video-editor/MatchVideoEditor";
import { fetchMatchById } from "@/lib/matches";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ matchId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { matchId } = await params; // FIX #1

  const match = await fetchMatchById(matchId);

  if (!match) {
    notFound();
  }

  // const videoUrl = match.videoUrl ?? null;
  // const tags = match.tags ?? [];

  const videoUrl: string | null = match.videoUrl ?? null;
  const tags = match.tags ?? [];

  console.log(tags)
  return (
    <MatchVideoEditor
      matchId={matchId} // FIX #2
      initialVideoUrl={videoUrl}
      initialTags={tags}
    />
  );
}
