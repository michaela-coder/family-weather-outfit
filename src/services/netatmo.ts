export interface NetatmoCurrentConditions {
  temperature: number;   // °C
  humidity: number;      // %
  rain: number;          // mm/h
  wind: number;          // km/h
  measuredAt: string;    // ISO 8601
}

// Synchronní placeholder — vrací null dokud není Netatmo připojeno.
export function getNetatmoCurrentConditions(): NetatmoCurrentConditions | null {
  return null;
}

interface NestatmoApiResponse {
  connected: boolean;
  message?: string;
  data?: NetatmoCurrentConditions;
}

// Volá backend endpoint /api/netatmo/current.
// Vrací null pokud endpoint odpoví connected:false nebo dojde k chybě.
export async function fetchNetatmoCurrentConditions(): Promise<NetatmoCurrentConditions | null> {
  try {
    const res = await fetch('/api/netatmo/current');
    if (!res.ok) return null;
    const json = (await res.json()) as NestatmoApiResponse;
    if (!json.connected || !json.data) return null;
    return json.data;
  } catch {
    return null;
  }
}
