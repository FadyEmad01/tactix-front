// import MatchVideoEditor from "@/components/video-editor/MatchVideoEditor";
// import { fetchMatchById } from "@/lib/matches";
// import { notFound } from "next/navigation";

// interface PageProps {
//   params: Promise<{ matchId: string }>;
// }

// export default async function Page({ params }: PageProps) {
//   const { matchId } = await params; // FIX #1

//   const match = await fetchMatchById(matchId);

//   if (!match) {
//     notFound();
//   }

//   // const videoUrl = match.videoUrl ?? null;
//   // const tags = match.tags ?? [];

//   const videoUrl: string | null = match.videoUrl ?? null;
//   const tags = match.tags ?? [];

//   // console.log(tags)
//   return (
//     <MatchVideoEditor
//       matchId={matchId} // FIX #2
//       initialVideoUrl={videoUrl}
//       initialTags={tags}
//     />
//   );
// }


import MatchVideoEditor from "@/components/video-editor/MatchVideoEditor";
import { fetchMatchById } from "@/lib/match/actions";
import { fetchPanels } from "@/lib/panel/panel-actions";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ matchId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { matchId } = await params;

  // Fetch match and panels in parallel
  const [match, panels] = await Promise.all([
    fetchMatchById(matchId),
    fetchPanels(),
  ]);

  if (!match) {
    notFound();
  }

  const videoUrl: string | null = match.videoUrl ?? null;
  const tags = match.tags ?? [];
  const matchTitle =
    "title" in match && typeof match.title === "string"
      ? match.title
      : match.name;

  return (
    <MatchVideoEditor
      matchId={matchId}
      initialVideoUrl={videoUrl}
      initialTags={tags}
      customPanels={panels}
      matchName={matchTitle || "Untitled Match"}
    />
  );
}
