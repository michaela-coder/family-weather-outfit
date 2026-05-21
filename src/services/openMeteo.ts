import type { WeatherDay, WeatherCondition } from '../types/weather';

function wmoCodeToCondition(code: number): WeatherCondition {
  if (code === 0) return 'sunny';
  if (code <= 2) return 'partly-cloudy';
  if (code <= 48) return 'cloudy';
  if (code <= 67) return 'rainy';
  if (code <= 77) return 'snowy';
  if (code <= 82) return 'rainy';
  if (code <= 86) return 'snowy';
  return 'storm';
}

function wmoCodeToDescription(code: number): string {
  if (code === 0) return 'Jasno';
  if (code <= 2) return 'Převážně jasno';
  if (code <= 3) return 'Oblačno';
  if (code <= 48) return 'Mlha nebo jinovatka';
  if (code <= 55) return 'Mrholení';
  if (code <= 67) return 'Déšť';
  if (code <= 77) return 'Sněžení';
  if (code <= 82) return 'Přeháňky';
  if (code <= 86) return 'Sněhové přeháňky';
  return 'Bouřka';
}

function maxInRange(arr: number[], from: number, to: number): number {
  return Math.max(...arr.slice(from, to + 1).filter(v => v != null));
}

export async function fetchTodayWeather(lat: number, lon: number): Promise<WeatherDay> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current: 'temperature_2m,weathercode,windspeed_10m,is_day',
    hourly: 'temperature_2m,precipitation_probability,windspeed_10m,uv_index',
    daily: 'temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max,precipitation_sum,snowfall_sum,uv_index_max',
    timezone: 'auto',
    forecast_days: '1',
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw new Error(`Open-Meteo API chyba: ${response.status}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await response.json() as any;
  const current = data.current as Record<string, number>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const daily = data.daily as Record<string, any[]>;
  const hourly = data.hourly as Record<string, number[]>;

  // Ranní teplota: hodina 7 v hodinovém poli (index 7 = 07:00 dnešního dne)
  const temperatureMorning = Math.round(hourly.temperature_2m?.[7] ?? daily.temperature_2m_min[0]);

  // Maximální pravděpodobnost srážek přes den (6–20 h)
  const precipProb = maxInRange(hourly.precipitation_probability ?? [], 6, 20);

  // UV index: denní maximum z daily, nebo z hodinových hodnot 8–18
  const uvIndex = Math.round(
    daily.uv_index_max?.[0] ?? maxInRange(hourly.uv_index ?? [], 8, 18) ?? 0
  );

  // Vítr: denní maximum
  const windSpeed = Math.round(daily.windspeed_10m_max?.[0] ?? current.windspeed_10m);

  const precipitationMm = Math.round(daily.precipitation_sum?.[0] ?? 0);
  const isSnowing = (daily.snowfall_sum?.[0] ?? 0) > 0;

  const dailyCode = daily.weathercode?.[0] ?? current.weathercode;
  const condition = wmoCodeToCondition(dailyCode);

  return {
    date: String(daily.time[0]),
    temperatureMorning,
    temperatureMin: Math.round(daily.temperature_2m_min[0]),
    temperatureMax: Math.round(daily.temperature_2m_max[0]),
    temperatureCurrent: Math.round(current.temperature_2m),
    condition,
    windSpeed,
    uvIndex,
    precipitationMm,
    precipitationProbability: isNaN(precipProb) ? 0 : precipProb,
    isSnowing,
    description: wmoCodeToDescription(dailyCode),
  };
}
