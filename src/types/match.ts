export interface Project {
  id: string;
  name: string;
  description?: string;
  teamA: string;
  teamALogo:string;
  teamB: string;
  teamBLogo:string;
  matchResult?: string;
  matchDate?: string;
  createdAt: string;
  videoUrl?: string | null;
  tags?: BackendTag[];
}

export interface BackendTag {
  _id?: string;
  matchId?: string;
  startTime: number;
  endTime: number | null;
  event: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TagPayload {
  startTime: string;
  endTime: string;
  event: string;
  notes?: string;
}
