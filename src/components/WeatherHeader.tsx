import type { WeatherDay } from '../types/weather';
import WeatherAnimation from './WeatherAnimation';

interface Props {
  weather: WeatherDay;
  sourceLabel?: string;
}

const conditionLabel: Record<string, string> = {
  sunny: 'Jasno',
  'partly-cloudy': 'Převážně jasno',
  cloudy: 'Oblačno',
  rainy: 'Déšť',
  snowy: 'Sněžení',
  windy: 'Větrno',
  storm: 'Bouřka',
};

function tempColor(temp: number) {
  if (temp > 25) return '#E53935';
  if (temp >= 18) return '#FB8C00';
  if (temp >= 12) return '#43A047';
  if (temp >= 5) return '#1E88E5';
  return '#8E24AA';
}

function sign(t: number) {
  return t > 0 ? `+${t}` : `${t}`;
}

function formatDayLabel(dateValue: string) {
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return '';

  const label = new Intl.DateTimeFormat('cs-CZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function WeatherHeader({ weather, sourceLabel = 'Zdroj: Open-Meteo' }: Props) {

  const {
    date,
    temperatureCurrent,
    temperatureMorning,
    temperatureMin,
    temperatureMax,
    condition,
    description,
    windSpeed,
    uvIndex,
    precipitationMm,
    precipitationProbability,
    locationName,
  } = weather;

  const showRain = precipitationMm > 0 || (precipitationProbability ?? 0) > 0;
  const dayLabel = formatDayLabel(date);

  return (
    <div className="weather-header">
      {dayLabel && <div className="weather-day">{dayLabel}</div>}
      {locationName && (
        <div className="weather-location">📍 {locationName}</div>
      )}
      <div className="weather-header-top">
        <WeatherAnimation condition={condition} size={88} />
        <div className="weather-temp-block">
          <span className="weather-temp" style={{ color: tempColor(temperatureCurrent) }}>
            {sign(temperatureCurrent)}°C
          </span>
          <span className="weather-range">
            {sign(temperatureMin)}° / {sign(temperatureMax)}°
          </span>
          <span className="weather-condition-label">
            {conditionLabel[condition] ?? description}
          </span>
        </div>
      </div>
      <div className="weather-details">
        <span>🌅 Ráno: {sign(temperatureMorning)}°</span>
        <span>💨 {windSpeed} km/h</span>
        <span>☀️ UV {uvIndex}</span>
        {showRain && precipitationMm > 0 && <span>🌧️ {precipitationMm} mm</span>}
        {showRain && precipitationProbability != null && precipitationProbability > 0 && (
          <span>☔ {precipitationProbability}%</span>
        )}
        {weather.isSnowing && <span>❄️ Sněžení</span>}
      </div>
      <div className="weather-source">{sourceLabel}</div>
    </div>
  );
}
