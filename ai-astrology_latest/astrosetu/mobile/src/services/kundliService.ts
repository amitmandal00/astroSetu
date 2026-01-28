import { apiService } from './api';

export interface KundliRequest {
  name: string;
  dob: string;
  tob: string;
  place: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  ayanamsa?: number;
}

export interface KundliResponse {
  ok: boolean;
  data?: {
    ascendant: string;
    rashi: string;
    nakshatra: string;
    planets: Array<{
      name: string;
      sign: string;
      degree: number;
    }>;
  };
  error?: string;
}

export const kundliService = {
  async generateKundli(data: KundliRequest) {
    const response = await apiService.post<KundliResponse>('/astrology/kundli', data);
    if (response.ok && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to generate Kundli');
  },

  async matchKundli(male: KundliRequest, female: KundliRequest) {
    const response = await apiService.post('/astrology/match', { a: male, b: female });
    if (response.ok && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to match Kundli');
  },
};

