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
}

export interface RankInfo {
  rank: string;
  rr: number;
  icon: string;
  color: string;
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
}
