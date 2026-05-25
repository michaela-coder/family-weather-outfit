import { describe, expect, it } from 'vitest';
import { getOutfitRecommendation } from './outfitRules';
import type { WeatherDay } from '../types/weather';

function weather(overrides: Partial<WeatherDay>): WeatherDay {
  return {
    date: '2026-05-25',
    temperatureMorning: 14,
    temperatureMin: 10,
    temperatureMax: 18,
    temperatureCurrent: 14,
    condition: 'cloudy',
    windSpeed: 10,
    uvIndex: 2,
    precipitationMm: 0,
    precipitationProbability: 0,
    isSnowing: false,
    description: 'Test',
    ...overrides,
  };
}

describe('getOutfitRecommendation', () => {
  it('adds rain protection for chilly rain', () => {
    const outfit = getOutfitRecommendation(weather({
      condition: 'rainy',
      precipitationMm: 6,
      precipitationProbability: 90,
    }));

    expect(outfit.morning.boy).toContain('🌧️ Pláštěnka nebo nepromokavá bunda');
    expect(outfit.morning.girl).toContain('🌧️ Pláštěnka nebo nepromokavá bunda');
    expect(outfit.backpack).toContain('☂️ Deštník nebo pláštěnka');
    expect(outfit.headline).toContain('Dnes bude pršet.');
  });

  it('does not add umbrella or raincoat for snow', () => {
    const outfit = getOutfitRecommendation(weather({
      temperatureMorning: -2,
      temperatureMin: -4,
      temperatureMax: 1,
      temperatureCurrent: -1,
      condition: 'snowy',
      precipitationMm: 3,
      precipitationProbability: 90,
      isSnowing: true,
    }));

    expect(outfit.backpack.join(' ')).not.toContain('Deštník');
    expect(outfit.morning.boy.join(' ')).not.toContain('Pláštěnka');
    expect(outfit.morning.boy).toContain('🥾 Zimní boty');
    expect(outfit.warnings.join(' ')).toContain('Sněží');
  });

  it('keeps freezing wind and snow practical without duplicating windbreaker', () => {
    const outfit = getOutfitRecommendation(weather({
      temperatureMorning: -6,
      temperatureMin: -8,
      temperatureMax: -2,
      temperatureCurrent: -5,
      condition: 'snowy',
      windSpeed: 48,
      precipitationMm: 2,
      precipitationProbability: 85,
      isSnowing: true,
    }));

    expect(outfit.morning.boy).toContain('🧥 Teplá bunda');
    expect(outfit.morning.boy).toContain('🧤 Rukavice');
    expect(outfit.morning.boy).toContain('🥾 Zimní boty');
    expect(outfit.morning.boy.join(' ')).not.toContain('Větrovka');
    expect(outfit.warnings.join(' ')).toContain('Silný vítr');
    expect(outfit.warnings.join(' ')).toContain('Sněží');
  });

  it('prioritizes rain protection even during hot weather', () => {
    const outfit = getOutfitRecommendation(weather({
      temperatureMorning: 27,
      temperatureMin: 22,
      temperatureMax: 31,
      temperatureCurrent: 29,
      condition: 'rainy',
      precipitationMm: 8,
      precipitationProbability: 95,
      uvIndex: 8,
    }));

    expect(outfit.morning.boy).toContain('👕 Tričko');
    expect(outfit.morning.boy).toContain('🩳 Kraťasy');
    expect(outfit.morning.boy).toContain('🌧️ Pláštěnka nebo nepromokavá bunda');
    expect(outfit.backpack).toContain('☂️ Deštník nebo pláštěnka');
    expect(outfit.backpack.join(' ')).not.toContain('Opalovací krém');
    expect(outfit.warnings.join(' ')).not.toContain('UV');
  });
});
