export type WeatherCondition =
  | 'sunny'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rainy'
  | 'snowy'
  | 'windy'
  | 'storm';

export interface WeatherDay {
  date: string;
  temperatureMorning: number;   // ~7:00
  temperatureMin: number;
  temperatureMax: number;
  temperatureCurrent: number;   // aktuální (pro zobrazení v headeru)
  condition: WeatherCondition;
  windSpeed: number;            // km/h – denní maximum
  uvIndex: number;              // denní maximum
  precipitationMm: number;
  precipitationProbability?: number; // 0–100 %
  isSnowing: boolean;
  description: string;
  locationName?: string;
}
