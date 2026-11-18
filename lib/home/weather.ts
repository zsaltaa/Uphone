import type { WeatherData } from './types';

export interface WeatherServiceAdapter {
  fetchCurrentWeather(): Promise<WeatherData>;
}

/**
 * Reserved weather data contract.
 * Returns an explicit unconfigured state until a real weather API is connected.
 */
export function getReservedWeatherState(): WeatherData {
  return {
    configured: false,
  };
}

export const weatherService: WeatherServiceAdapter = {
  async fetchCurrentWeather(): Promise<WeatherData> {
    return getReservedWeatherState();
  },
};
