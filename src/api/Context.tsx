import React from 'react';
import { ChartDocument, PBScoreDocument, SongDocument } from 'tachi-common';

export interface ContextType {
  userId: string;
  setUserId(id: string): void;
  token: string;
  setToken(id: string): void;
  pbs?: PBScoreDocument[];
  setPbs(pbs: PBScoreDocument[]): void;
  charts?: ChartDocument[];
  setCharts(charts: ChartDocument[]): void;
  songs?: SongDocument[];
  setSongs(songs: SongDocument[]): void;
}

export const Context = React.createContext<ContextType | null>(null);
