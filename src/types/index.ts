export interface Account {
  id: string;
  riotId: string;
  hashtag: string;
  username: string;
  password: string;
  region: "ap" | "br" | "eu" | "kr" | "latam" | "na";
  hasSkins: boolean;
  currentRank: string;
  lastRefreshed: string;
  passwordVisible: boolean;
  notes?: string;
  tags?: string[];
  lentTo?: string;
  lentSince?: string;
}

export interface RankInfo {
  rank: string;
  rr: number;
  icon: string;
  color: string;
}

export interface RankHistoryEntry {
  date: string;
  rank: string;
  rr: number;
  icon: string;
  color: string;
}

export interface AccountRankHistory {
  accountId: string;
  history: RankHistoryEntry[];
  peakRank: string;
  peakRR: number;
  peakIcon: string;
}

export interface MasterPassword {
  hash: string;
  salt: string;
}

export type Theme = "light" | "dark";

export interface AppSettings {
  theme: Theme;
  autoRefresh: boolean;
  refreshInterval: number;
  viewLayout: "list" | "grid";
  compactView: boolean;
  showStatistics: boolean;
  sortKey: string;
  sortDirection: "ascending" | "descending";
  apiKey?: string;
}

export type BulkAction = "delete" | "tag" | "refresh" | "export";
