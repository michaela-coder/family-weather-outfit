import type { WeatherDay } from '../types/weather';

export type TemperatureCategory = 'horko' | 'teplo' | 'chladno' | 'zima' | 'mraz';

export interface OutfitPeriod {
  boy: string[];
  girl: string[];
  temperatureCategory: TemperatureCategory;
  temperature: number;
}

export interface OutfitRecommendation {
  morning: OutfitPeriod;
  afternoon: OutfitPeriod;
  backpack: string[];
  warnings: string[];
  headline: string;
  afternoonNote: string;
}

export function getTemperatureCategory(temp: number): TemperatureCategory {
  if (temp > 25) return 'horko';
  if (temp >= 18) return 'teplo';
  if (temp >= 12) return 'chladno';
  if (temp >= 5) return 'zima';
  return 'mraz';
}

function getBaseClothes(temp: number, isMorning: boolean): { boy: string[]; girl: string[] } {
  const cat = getTemperatureCategory(temp);
  switch (cat) {
    case 'horko':
      return {
        boy: ['👕 Tričko', '🩳 Kraťasy'],
        girl: ['👗 Šaty nebo sukně s tričkem'],
      };
    case 'teplo':
      return {
        boy: ['👕 Tričko', '👖 Kalhoty', ...(isMorning ? ['🧥 Lehká mikina'] : [])],
        girl: ['👕 Tričko', '🩱 Legíny se sukní', ...(isMorning ? ['🧥 Lehká mikina'] : [])],
      };
    case 'chladno':
      return {
        boy: ['👕 Tričko', '👖 Dlouhé kalhoty', '🧥 Mikina nebo bunda'],
        girl: ['👕 Tričko', '👖 Legíny nebo kalhoty', '🧥 Mikina nebo bunda'],
      };
    case 'zima':
      return {
        boy: ['👕 Tričko', '👖 Kalhoty', '🧥 Softshellová bunda', '🎽 Čelenka'],
        girl: ['👕 Tričko', '👖 Legíny nebo kalhoty', '🧥 Softshellová bunda', '🎽 Čelenka'],
      };
    case 'mraz':
      return {
        boy: ['👕 Tričko (pod)', '👖 Teplé kalhoty', '🧥 Teplá bunda', '🧤 Rukavice', '🧢 Čepice', '🧣 Šála'],
        girl: ['👕 Tričko (pod)', '👖 Teplé legíny nebo kalhoty', '🧥 Teplá bunda', '🧤 Rukavice', '🧢 Čepice', '🧣 Šála'],
      };
  }
}

function buildHeadline(
  cat: TemperatureCategory,
  isRainy: boolean,
  isSnowing: boolean,
  isHighUV: boolean,
  isWindy: boolean,
): string {
  const catLabel: Record<TemperatureCategory, string> = {
    horko: 'Vedro',
    teplo: 'Teplo',
    chladno: 'Chladno',
    zima: 'Zima',
    mraz: 'Mráz',
  };
  const catAction: Record<TemperatureCategory, string> = {
    horko: 'tričko a kraťasy/šaty',
    teplo: 'tričko s kalhotami, ráno mikinu',
    chladno: 'bundu nebo mikinu',
    zima: 'softshell a čelenku',
    mraz: 'teplou bundu, čepici, šálu a rukavice',
  };

  const conditions: string[] = [];
  if (isSnowing) conditions.push('sněžení');
  else if (isRainy) conditions.push('déšť');
  if (isWindy) conditions.push('vítr');
  if (isHighUV) conditions.push('UV');

  const condLabel = conditions.length > 0
    ? `${catLabel[cat]} a ${conditions.join(' + ')}`
    : catLabel[cat];

  const extras: string[] = [];
  // softshell/heavy jackets already cover rain — don't duplicate
  if (isRainy && cat !== 'zima' && cat !== 'mraz') extras.push('přibal pláštěnku');
  if (isSnowing && cat !== 'mraz') extras.push('zimní boty a rukavice');
  if (isHighUV) extras.push('kšiltovku a krém');

  const extrasStr = extras.length > 0 ? ` + ${extras.join(', ')}` : '';
  return `${condLabel}. Dej ${catAction[cat]}${extrasStr}.`;
}

function buildAfternoonNote(morningCat: TemperatureCategory, afternoonCat: TemperatureCategory): string {
  const order: TemperatureCategory[] = ['horko', 'teplo', 'chladno', 'zima', 'mraz'];
  const mIdx = order.indexOf(morningCat);
  const aIdx = order.indexOf(afternoonCat);
  if (mIdx === aIdx) return '';
  if (aIdx < mIdx) {
    const notes: Partial<Record<TemperatureCategory, string>> = {
      teplo: 'Odpoledne bude tepleji – mikina pravděpodobně nebude potřeba.',
      chladno: 'Odpoledne bude tepleji – bunda/mikina pravděpodobně nebude potřeba.',
      zima: 'Odpoledne se oteplí – softshell a čelenka pak nejsou nutné.',
      mraz: 'Odpoledne bude o trochu tepleji.',
    };
    return notes[morningCat] ?? '';
  }
  const notes: Partial<Record<TemperatureCategory, string>> = {
    chladno: 'Odpoledne přidej bundu nebo mikinu.',
    zima: 'Odpoledne přidej softshell.',
    mraz: 'Odpoledne přidej teplou bundu.',
  };
  return notes[afternoonCat] ?? '';
}

export function getOutfitRecommendation(weather: WeatherDay): OutfitRecommendation {
  const morningTemp = weather.temperatureMorning;
  const afternoonTemp = weather.temperatureMax;

  const isRainy =
    weather.precipitationMm > 0 ||
    (weather.precipitationProbability ?? 0) > 50 ||
    weather.condition === 'rainy' ||
    weather.condition === 'storm';
  const isWindy = weather.windSpeed > 35;
  const isSnowing = weather.isSnowing || weather.condition === 'snowy';
  const isHighUV = weather.uvIndex >= 6;

  const morningClothes = getBaseClothes(morningTemp, true);
  const afternoonClothes = getBaseClothes(afternoonTemp, false);

  // If softshell or heavy jacket already present, it covers rain — don't add another jacket
  const hasBulkyJacket = morningClothes.boy.some(
    i => i.includes('Softshell') || i.includes('Teplá bunda'),
  );

  if (isRainy && !hasBulkyJacket) {
    morningClothes.boy.push('🌧️ Pláštěnka nebo nepromokavá bunda');
    morningClothes.girl.push('🌧️ Pláštěnka nebo nepromokavá bunda');
  }
  if (isWindy && morningTemp < 20) {
    morningClothes.boy.push('🌬️ Větrovka');
    morningClothes.girl.push('🌬️ Větrovka');
  }
  if (isSnowing) {
    if (!morningClothes.boy.some(i => i.includes('Rukavice'))) morningClothes.boy.push('🧤 Rukavice');
    if (!morningClothes.girl.some(i => i.includes('Rukavice'))) morningClothes.girl.push('🧤 Rukavice');
    morningClothes.boy.push('🥾 Zimní boty');
    morningClothes.girl.push('🥾 Zimní boty');
  }

  if (isHighUV) {
    afternoonClothes.boy.push('🧢 Kšiltovka');
    afternoonClothes.girl.push('🧢 Kšiltovka');
  }

  const backpack: string[] = [];
  const warnings: string[] = [];

  if (isRainy) backpack.push('☂️ Deštník nebo pláštěnka');
  if (isHighUV) backpack.push('🧴 Opalovací krém');

  // Rain omitted from warnings — already covered by backpack and morning clothes
  if (isWindy) warnings.push('💨 Silný vítr – přidejte větrovku!');
  if (isHighUV) warnings.push('☀️ Vysoké UV – kšiltovka a opalovací krém!');
  if (isSnowing) warnings.push('❄️ Sněží – zimní boty a rukavice!');

  const morningCat = getTemperatureCategory(morningTemp);
  const afternoonCat = getTemperatureCategory(afternoonTemp);

  return {
    morning: {
      ...morningClothes,
      temperatureCategory: morningCat,
      temperature: morningTemp,
    },
    afternoon: {
      ...afternoonClothes,
      temperatureCategory: afternoonCat,
      temperature: afternoonTemp,
    },
    backpack,
    warnings,
    headline: buildHeadline(morningCat, isRainy, isSnowing, isHighUV, isWindy),
    afternoonNote: buildAfternoonNote(morningCat, afternoonCat),
  };
}
