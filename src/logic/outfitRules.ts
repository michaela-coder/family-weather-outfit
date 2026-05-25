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
        boy: ['🩱 Podvlékací tričko', '👕 Tričko s dlouhým rukávem', '👖 Dlouhé kalhoty', '🧥 Mikina nebo bunda'],
        girl: ['🩱 Podvlékací tričko', '👕 Tričko s dlouhým rukávem', '👖 Legíny nebo kalhoty', '🧥 Mikina nebo bunda'],
      };
    case 'zima':
      return {
        boy: ['🩱 Podvlékací tričko', '👕 Tričko s dlouhým rukávem', '👖 Kalhoty', '🧶 Mikina nebo svetr', '🧥 Softshellová bunda', '🎽 Čelenka'],
        girl: ['🩱 Podvlékací tričko', '👕 Tričko s dlouhým rukávem', '👖 Legíny nebo kalhoty', '🧶 Mikina nebo svetr', '🧥 Softshellová bunda', '🎽 Čelenka'],
      };
    case 'mraz':
      return {
        boy: ['🩱 Podvlékací tričko', '👕 Tričko s dlouhým rukávem', '👖 Teplé kalhoty', '🧶 Mikina nebo svetr', '🧥 Teplá bunda', '🧤 Rukavice', '🧢 Čepice', '🧣 Šála'],
        girl: ['🩱 Podvlékací tričko', '👕 Tričko s dlouhým rukávem', '👖 Teplé legíny nebo kalhoty', '🧶 Mikina nebo svetr', '🧥 Teplá bunda', '🧤 Rukavice', '🧢 Čepice', '🧣 Šála'],
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
  const sentences: string[] = [];

  if (isSnowing) {
    sentences.push('Dnes může sněžit.');
  } else if (isRainy) {
    sentences.push('Dnes bude pršet.');
  } else {
    const base: Record<TemperatureCategory, string> = {
      horko: 'Dnes bude velké teplo.',
      teplo: 'Dnes bude teplo.',
      chladno: 'Dnes je chladněji, hodí se vrstvy.',
      zima: 'Dnes bude opravdu zima.',
      mraz: 'Dnes bude opravdu zima.',
    };
    sentences.push(base[cat]);
  }

  if (isRainy) {
    sentences.push(cat === 'zima' || cat === 'mraz'
      ? 'Hodí se nepromokavá vrstva.'
      : 'Nezapomeňte na pláštěnku.');
  }
  if (isWindy) sentences.push('Venku bude větrno.');
  if (isSnowing) sentences.push('Hodí se teplá bunda a rukavice.');
  if (isHighUV) sentences.push(cat === 'horko'
    ? 'Nezapomeňte na pití, kšiltovku a krém.'
    : 'Hodí se kšiltovka a krém.');
  if (!isRainy && !isSnowing && cat === 'teplo') sentences.push('Odpoledne může být tepleji.');
  if (!isRainy && !isSnowing && cat === 'chladno') sentences.push('Dnes se hodí mikina.');
  if (!isRainy && !isSnowing && (cat === 'zima' || cat === 'mraz')) sentences.push('Nezapomeňte na teplé vrstvy.');

  return sentences.join(' ');
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
  const isHighUV = weather.uvIndex >= 6;
  // UV doporučení dává smysl jen při teplu, bez deště a bez silné oblačnosti
  const isUVRelevant =
    isHighUV &&
    !isRainy &&
    !isSnowing &&
    weather.condition !== 'cloudy' &&
    afternoonTemp >= 18;

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
  if (isWindy && morningTemp < 20 && !hasBulkyJacket) {
    morningClothes.boy.push('🌬️ Větrovka');
    morningClothes.girl.push('🌬️ Větrovka');
  }
  if (isSnowing) {
    if (!morningClothes.boy.some(i => i.includes('Rukavice'))) morningClothes.boy.push('🧤 Rukavice');
    if (!morningClothes.girl.some(i => i.includes('Rukavice'))) morningClothes.girl.push('🧤 Rukavice');
    morningClothes.boy.push('🥾 Zimní boty');
    morningClothes.girl.push('🥾 Zimní boty');
  }

  if (isUVRelevant) {
    afternoonClothes.boy.push('🧢 Kšiltovka');
    afternoonClothes.girl.push('🧢 Kšiltovka');
  }

  const backpack: string[] = [];
  const warnings: string[] = [];

  if (isRainy) backpack.push('☂️ Deštník nebo pláštěnka');
  if (isUVRelevant) backpack.push('🧴 Opalovací krém');

  // Rain omitted from warnings — already covered by backpack and morning clothes
  if (isWindy) warnings.push('💨 Silný vítr – přidejte větrovku!');
  if (isUVRelevant) warnings.push('☀️ Vysoké UV – kšiltovka a opalovací krém!');
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
    headline: buildHeadline(morningCat, isRainy, isSnowing, isUVRelevant, isWindy),
    afternoonNote: buildAfternoonNote(morningCat, afternoonCat),
  };
}
