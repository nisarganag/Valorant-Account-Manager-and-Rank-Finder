import axios from 'axios';
import type { Account } from '../types';

export class RankService {
  private static readonly API_BASE_URL = 'https://vaccie.pythonanywhere.com/mmr';
  
  static async fetchRank(account: Account): Promise<{ rank: string; icon: string; color: string }> {
    try {
      // Remove spaces from riotId for API call
      const cleanRiotId = account.riotId.replace(/\s+/g, '');
      
      console.log('Fetching rank for account:', { riotId: cleanRiotId, hashtag: account.hashtag, region: account.region });
      let rankString: string;
      if (window.electronAPI && window.electronAPI.fetchRank) {
        const result = await window.electronAPI.fetchRank(cleanRiotId, account.hashtag, account.region);
        if (result.success && result.data) {
          if (typeof result.data === 'string') {
            rankString = result.data;
          } else if (result.data && typeof result.data === 'object' && 'current_rank' in result.data) {
            rankString = result.data.current_rank || 'Fetch Failed';
          } else {
            rankString = 'Fetch Failed';
          }
        } else {
          rankString = 'Fetch Failed';
        }
      } else {
        rankString = await this.fetchRankDirectly({ ...account, riotId: cleanRiotId });
      }

      if (rankString.includes('Errore nel recupero dei dati')) {
        rankString = 'Fetch Failed';
      }

      const icon = this.getRankIcon(rankString);
      const color = this.getRankColor(rankString);

      return { rank: rankString, icon: `./icons/${icon}`, color };

    } catch (error) {
      console.error('Error fetching rank:', error);
      return { rank: 'Fetch Failed', icon: '', color: '#FF0000' };
    }
  }

  private static async fetchRankDirectly(account: Account): Promise<string> {
    try {
      const encodedName = encodeURIComponent(account.riotId);
      const encodedTag = encodeURIComponent(account.hashtag);
      const url = `${this.API_BASE_URL}/${encodedName}/${encodedTag}/${account.region}`;
      
      console.log('Fetching rank from URL:', url);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });

      if (response.status === 200) {
        const contentType = response.headers['content-type'] || '';
        
        if (contentType.includes('application/json')) {
          const data = response.data;
          if (data.current_rank) {
            return data.current_rank;
          }
        } else {
          // Handle text response
          const responseText = response.data;
          if (responseText.includes('Errore nel recupero dei dati')) {
            return 'Fetch Failed';
          }
          return responseText;
        }
      }
      
      return 'Fetch Failed';
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        console.error(`Error fetching rank - Status: ${(error as { response: { status: number } }).response.status}, URL: ${this.API_BASE_URL}/${encodeURIComponent(account.riotId)}/${encodeURIComponent(account.hashtag)}/${account.region}`);
      } else {
        console.error('Error fetching rank directly:', error instanceof Error ? error.message : 'Unknown error');
      }
      return 'API Error';
    }
  }

  static getRankIcon(rank: string): string {
    const rankLower = rank.toLowerCase();
    
    if (rankLower.includes('iron')) {
      if (rankLower.includes('iron 1')) return 'Iron_1_Rank.png';
      if (rankLower.includes('iron 2')) return 'Iron_2_Rank.png';
      if (rankLower.includes('iron 3')) return 'Iron_3_Rank.png';
      return 'Iron_1_Rank.png';
    } else if (rankLower.includes('bronze')) {
      if (rankLower.includes('bronze 1')) return 'Bronze_1_Rank.png';
      if (rankLower.includes('bronze 2')) return 'Bronze_2_Rank.png';
      if (rankLower.includes('bronze 3')) return 'Bronze_3_Rank.png';
      return 'Bronze_1_Rank.png';
    } else if (rankLower.includes('silver')) {
      if (rankLower.includes('silver 1')) return 'Silver_1_Rank.png';
      if (rankLower.includes('silver 2')) return 'Silver_2_Rank.png';
      if (rankLower.includes('silver 3')) return 'Silver_3_Rank.png';
      return 'Silver_1_Rank.png';
    } else if (rankLower.includes('gold')) {
      if (rankLower.includes('gold 1')) return 'Gold_1_Rank.png';
      if (rankLower.includes('gold 2')) return 'Gold_2_Rank.png';
      if (rankLower.includes('gold 3')) return 'Gold_3_Rank.png';
      return 'Gold_1_Rank.png';
    } else if (rankLower.includes('platinum')) {
      if (rankLower.includes('platinum 1')) return 'Platinum_1_Rank.png';
      if (rankLower.includes('platinum 2')) return 'Platinum_2_Rank.png';
      if (rankLower.includes('platinum 3')) return 'Platinum_3_Rank.png';
      return 'Platinum_1_Rank.png';
    } else if (rankLower.includes('diamond')) {
      if (rankLower.includes('diamond 1')) return 'Diamond_1_Rank.png';
      if (rankLower.includes('diamond 2')) return 'Diamond_2_Rank.png';
      if (rankLower.includes('diamond 3')) return 'Diamond_3_Rank.png';
      return 'Diamond_1_Rank.png';
    } else if (rankLower.includes('ascendant')) {
      if (rankLower.includes('ascendant 1')) return 'Ascendant_1_Rank.png';
      if (rankLower.includes('ascendant 2')) return 'Ascendant_2_Rank.png';
      if (rankLower.includes('ascendant 3')) return 'Ascendant_3_Rank.png';
      return 'Ascendant_1_Rank.png';
    } else if (rankLower.includes('immortal')) {
      if (rankLower.includes('immortal 1')) return 'Immortal_1_Rank.png';
      if (rankLower.includes('immortal 2')) return 'Immortal_2_Rank.png';
      if (rankLower.includes('immortal 3')) return 'Immortal_3_Rank.png';
      return 'Immortal_1_Rank.png';
    } else if (rankLower.includes('radiant')) {
      return 'Radiant_Rank.png';
    }
    if (rankLower.includes('unrated')) {
      return '';
    }
    
    return ''; // No icon for unranked, error, etc.
  }

  static getRankColor(rank: string): string {
    const rankLower = rank.toLowerCase();
    
    if (rankLower.includes('iron')) return '#6B5B73';
    if (rankLower.includes('bronze')) return '#CD7F32';
    if (rankLower.includes('silver')) return '#C0C0C0';
    if (rankLower.includes('gold')) return '#FFD700';
    if (rankLower.includes('platinum')) return '#00CED1';
    if (rankLower.includes('diamond')) return '#B9F2FF';
    if (rankLower.includes('ascendant')) return '#32CD32';
    if (rankLower.includes('immortal')) return '#FF69B4';
    if (rankLower.includes('radiant')) return '#FFFF00';
    if (rankLower.includes('error') || rankLower.includes('failed')) return '#FF0000';
    
    return '#888888'; // Default gray for unranked
  }
}