import { useState } from 'react';
import type { WeatherDay } from '../types/weather';
import type { OutfitRecommendation, TemperatureCategory } from '../logic/outfitRules';

interface Props {
  gender: 'boy' | 'girl';
  name: string;
  outfit: OutfitRecommendation;
  weather: WeatherDay;
}

type ImageCategory = 'hot' | 'warm' | 'cool' | 'cold' | 'rain' | 'windy';

function getImageCategory(category: TemperatureCategory, weather: WeatherDay): ImageCategory {
  const isSnowing = weather.isSnowing || weather.condition === 'snowy';
  const isRainy =
    !isSnowing &&
    (
      weather.precipitationMm > 0 ||
      (weather.precipitationProbability ?? 0) > 50 ||
      weather.condition === 'rainy' ||
      weather.condition === 'storm'
    );
  const isWindy = weather.condition === 'windy' || weather.windSpeed > 35;

  if (isRainy) return 'rain';
  if (isWindy) return 'windy';

  const imageTemperature = weather.temperatureCurrent;

  if (imageTemperature >= 25 || category === 'horko') return 'hot';
  if (imageTemperature >= 10 && imageTemperature < 25) return 'warm';
  if (imageTemperature > 0 && imageTemperature < 10) return 'cool';
  if (imageTemperature <= 0 || category === 'mraz') return 'cold';

  return category === 'teplo' ? 'warm' : 'cool';
}

function getCharacterImage(gender: 'boy' | 'girl', category: TemperatureCategory, weather: WeatherDay): string {
  const imgCat = getImageCategory(category, weather);
  return `/characters/${gender === 'boy' ? 'boy' : 'girl'}-${imgCat}.webp`;
}

const categoryLabel: Record<TemperatureCategory, string> = {
  horko: '☀️ Horko',
  teplo: '🌤️ Teplo',
  chladno: '🌧️ Chladno',
  zima: '🧊 Zima',
  mraz: '❄️ Mráz',
};

export default function ChildOutfitCard({ gender, name, outfit, weather }: Props) {
  const [imgError, setImgError] = useState(false);
  const category = outfit.morning.temperatureCategory;
  const src = getCharacterImage(gender, category, weather);

  return (
    <div className={`child-outfit-card ${gender}`}>
      <div className="card-title">
        {gender === 'boy' ? '👦' : '👧'} {name}
      </div>
      <div className="figure-container">
        {imgError ? (
          <div className="figure-fallback">Obrázek není dostupný</div>
        ) : (
          <img
            src={src}
            alt={gender === 'boy' ? 'Chlapec v oblečení podle počasí' : 'Holka v oblečení podle počasí'}
            className="character-img"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className="temp-badge">{categoryLabel[category]}</div>
    </div>
  );
}
