interface TokenResponse {
  access_token: string;
}

interface DashboardData {
  Temperature?: number;
  Humidity?: number;
  WindStrength?: number;
  Rain?: number;
  time_utc?: number;
}

interface NetatmoModule {
  type: string;
  dashboard_data?: DashboardData;
}

interface NetatmoDevice {
  modules?: NetatmoModule[];
}

interface StationsResponse {
  body?: {
    devices?: NetatmoDevice[];
  };
}

async function fetchAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
): Promise<string> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch('https://api.netatmo.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) throw new Error(`Token endpoint returned ${res.status}`);
  const json = (await res.json()) as TokenResponse;
  return json.access_token;
}

async function fetchStationsData(accessToken: string): Promise<StationsResponse> {
  const res = await fetch('https://api.netatmo.com/api/getstationsdata', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`getstationsdata returned ${res.status}`);
  return res.json() as Promise<StationsResponse>;
}

export default async function handler(_req: Request): Promise<Response> {
  const clientId = process.env.NETATMO_CLIENT_ID;
  const clientSecret = process.env.NETATMO_CLIENT_SECRET;
  const refreshToken = process.env.NETATMO_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return Response.json({ connected: false, message: 'Netatmo není nakonfigurováno' });
  }

  try {
    const accessToken = await fetchAccessToken(clientId, clientSecret, refreshToken);
    const stations = await fetchStationsData(accessToken);

    const device = stations.body?.devices?.[0];
    if (!device) {
      return Response.json({ connected: false, message: 'Žádná stanice nenalezena' });
    }

    // NAModule1 = outdoor temp/humidity, NAModule2 = wind, NAModule3 = rain
    const outdoor = device.modules?.find(m => m.type === 'NAModule1')?.dashboard_data;
    const wind = device.modules?.find(m => m.type === 'NAModule2')?.dashboard_data;
    const rain = device.modules?.find(m => m.type === 'NAModule3')?.dashboard_data;

    if (outdoor?.Temperature == null || outdoor?.Humidity == null) {
      return Response.json({ connected: false, message: 'Venkovní modul nemá data' });
    }

    const measuredAt = outdoor.time_utc
      ? new Date(outdoor.time_utc * 1000).toISOString()
      : new Date().toISOString();

    return Response.json({
      connected: true,
      data: {
        temperature: outdoor.Temperature,
        humidity: outdoor.Humidity,
        wind: wind?.WindStrength ?? 0,
        rain: rain?.Rain ?? 0,
        measuredAt,
      },
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Neznámá chyba';
    return Response.json({
      connected: false,
      message: 'Chyba při načítání dat ze stanice',
      detail,
    });
  }
}
