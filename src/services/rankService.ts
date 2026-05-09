import type { Account, RankInfo, RankHistoryEntry } from '../types';

const HENRIK_BASE = 'https://api.henrikdev.xyz';
const LEGACY_BASE = 'https://vaccie.pythonanywhere.com/mmr';

export class RankService {
  static async fetchRank(
    account: Account,
    apiKey?: string
  ): Promise<RankInfo> {
    try {
      const cleanRiotId = account.riotId.replace(/\s+/g, '');
      const encodedName = encodeURIComponent(cleanRiotId);
      const encodedTag = encodeURIComponent(account.hashtag);

      if (window.electronAPI?.fetchRank) {
        const result = await window.electronAPI.fetchRank(
          account.region,
          encodedName,
          encodedTag,
          apiKey
        );

        if (result.success && result.data) {
          if (apiKey) {
            return this.parseHenrikResponse(result.data);
          }
          return this.parseLegacyResponse(result.data);
        }
      }

      if (apiKey) {
        return this.fetchHenrik(encodedName, encodedTag, account.region, apiKey);
      }
      return this.fetchLegacy(encodedName, encodedTag, account.region);
    } catch {
      return { rank: 'Error', rr: 0, icon: '', color: '#FF0000' };
    }
  }

  static async fetchRankHistory(
    account: Account,
    apiKey?: string
  ): Promise<RankHistoryEntry[]> {
    if (!apiKey) return []; // No history without HenrikDev key
    try {
      const cleanRiotId = account.riotId.replace(/\s+/g, '');
      const encodedName = encodeURIComponent(cleanRiotId);
      const encodedTag = encodeURIComponent(account.hashtag);

      if (window.electronAPI?.fetchRankHistory) {
        const result = await window.electronAPI.fetchRankHistory(
          account.region,
          encodedName,
          encodedTag,
          apiKey
        );
        if (result.success && result.data) {
          return this.parseHistoryResponse(result.data);
        }
      }
      return [];
    } catch {
      return [];
    }
  }

  // --- HenrikDev API ---
  private static parseHenrikResponse(data: any): RankInfo {
    if (data?.data?.current_data) {
      const cd = data.data.current_data;
      const rank = cd.currenttierpatched || cd.currenttier || 'Unranked';
      const rr = cd.ranking_in_tier ?? cd.elo ?? 0;
      const icon = cd.images?.small || cd.images?.large || '';
      const color = this.getRankColor(rank);
      return { rank, rr, icon, color };
    }
    if (data?.data?.currenttierpatched) {
      const rank = data.data.currenttierpatched;
      return { rank, rr: data.data.ranking_in_tier ?? 0, icon: '', color: this.getRankColor(rank) };
    }
    return { rank: 'Unranked', rr: 0, icon: '', color: '#888888' };
  }

  // --- Legacy API (vaccie.pythonanywhere.com) ---
  private static parseLegacyResponse(data: any): RankInfo {
    let rankString = '';
    if (typeof data === 'string') {
      rankString = data;
    } else if (data?.current_rank) {
      rankString = data.current_rank;
    } else if (data?.rank) {
      rankString = data.rank;
    }

    if (!rankString || rankString.includes('Errore nel recupero dei dati')) {
      return { rank: 'Account Private', rr: 0, icon: '', color: '#FF0000' };
    }

    const icon = this.getRankIcon(rankString);
    const color = this.getRankColor(rankString);
    return { rank: rankString, rr: 0, icon: icon ? `./icons/${icon}` : '', color };
  }

  private static async fetchHenrik(
    name: string, tag: string, region: string, apiKey: string
  ): Promise<RankInfo> {
    const url = `${HENRIK_BASE}/valorant/v2/mmr/${region}/${name}/${tag}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'ValorantAccountManager/1.0', 'Authorization': apiKey },
    });
    if (response.ok) {
      return this.parseHenrikResponse(await response.json());
    }
    if (response.status === 404) {
      return { rank: 'Account Private', rr: 0, icon: '', color: '#FF0000' };
    }
    return { rank: 'Error', rr: 0, icon: '', color: '#FF0000' };
  }

  private static async fetchLegacy(
    name: string, tag: string, region: string
  ): Promise<RankInfo> {
    const url = `${LEGACY_BASE}/${name}/${tag}/${region}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    if (response.ok) {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        return this.parseLegacyResponse(data);
      } catch {
        return this.parseLegacyResponse(text);
      }
    }
    if (response.status === 404) {
      return { rank: 'Account Private', rr: 0, icon: '', color: '#FF0000' };
    }
    return { rank: 'Error', rr: 0, icon: '', color: '#FF0000' };
  }

  private static parseHistoryResponse(data: any): RankHistoryEntry[] {
    const entries: RankHistoryEntry[] = [];
    const items = data?.data || [];
    for (const item of items) {
      const rank = item.currenttierpatched || item.currenttier || 'Unranked';
      entries.push({
        date: item.match_started || item.date || '',
        rank,
        rr: item.ranking_in_tier ?? item.elo ?? 0,
        icon: item.images?.small || '',
        color: this.getRankColor(rank),
      });
    }
    return entries.filter((e) => e.rank !== 'Unranked');
  }

  static getRankIcon(rank: string): string {
    const rankLower = rank.toLowerCase();
    const mapping: Record<string, string> = {
      'iron 1': 'Iron_1_Rank.png', 'iron 2': 'Iron_2_Rank.png', 'iron 3': 'Iron_3_Rank.png',
      'bronze 1': 'Bronze_1_Rank.png', 'bronze 2': 'Bronze_2_Rank.png', 'bronze 3': 'Bronze_3_Rank.png',
      'silver 1': 'Silver_1_Rank.png', 'silver 2': 'Silver_2_Rank.png', 'silver 3': 'Silver_3_Rank.png',
      'gold 1': 'Gold_1_Rank.png', 'gold 2': 'Gold_2_Rank.png', 'gold 3': 'Gold_3_Rank.png',
      'platinum 1': 'Platinum_1_Rank.png', 'platinum 2': 'Platinum_2_Rank.png', 'platinum 3': 'Platinum_3_Rank.png',
      'diamond 1': 'Diamond_1_Rank.png', 'diamond 2': 'Diamond_2_Rank.png', 'diamond 3': 'Diamond_3_Rank.png',
      'ascendant 1': 'Ascendant_1_Rank.png', 'ascendant 2': 'Ascendant_2_Rank.png', 'ascendant 3': 'Ascendant_3_Rank.png',
      'immortal 1': 'Immortal_1_Rank.png', 'immortal 2': 'Immortal_2_Rank.png', 'immortal 3': 'Immortal_3_Rank.png',
      'radiant': 'Radiant_Rank.png',
    };
    for (const [key, icon] of Object.entries(mapping)) {
      if (rankLower.includes(key)) return icon;
    }
    return '';
  }

  static getRankColor(rank: string): string {
    const r = rank.toLowerCase();
    if (r.includes('iron')) return '#6B5B73';
    if (r.includes('bronze')) return '#CD7F32';
    if (r.includes('silver')) return '#C0C0C0';
    if (r.includes('gold')) return '#FFD700';
    if (r.includes('platinum')) return '#00CED1';
    if (r.includes('diamond')) return '#B9F2FF';
    if (r.includes('ascendant')) return '#32CD32';
    if (r.includes('immortal')) return '#FF69B4';
    if (r.includes('radiant')) return '#FFFF00';
    if (r.includes('error') || r.includes('failed')) return '#FF0000';
    return '#888888';
  }
}
