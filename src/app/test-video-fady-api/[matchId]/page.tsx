'use client'
import { use } from 'react'

import MatchEditorPage from "./client";

interface MatchPageProps {
  params: Promise<{ matchId: string }>;
}
export default function Page({ params }: MatchPageProps) {
  const { matchId } = use(params);

  return (
    <MatchEditorPage matchId={matchId}/>
  );
}
  