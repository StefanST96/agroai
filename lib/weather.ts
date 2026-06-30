type GeocodingResult = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
};

type ForecastResponse = {
  current?: {
    temperature_2m?: number;
    wind_speed_10m?: number;
  };
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: number[];
  };
};

export type WeatherSnapshot = {
  cityLabel: string;
  source: string;
  currentTemp: number | null;
  currentWind: number | null;
  forecast: Array<{
    day: string;
    min: number | null;
    max: number | null;
    rain: number | null;
  }>;
};

function extractCity(location?: string | null) {
  if (!location) return "";
  return location.split(",")[0]?.trim() || "";
}

async function geocodeCity(city: string): Promise<GeocodingResult | null> {
  if (!city) return null;

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=sr&format=json`;
    const response = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
    if (!response.ok) return null;

    const payload = (await response.json()) as { results?: GeocodingResult[] };
    const first = payload.results?.[0];
    return first || null;
  } catch {
    return null;
  }
}

function fallbackForecast() {
  return [
    { day: "Danas", max: 29, min: 17, rain: 20 },
    { day: "Sutra", max: 31, min: 18, rain: 15 },
    { day: "Prekosutra", max: 28, min: 16, rain: 35 },
  ];
}

export async function getWeatherSnapshotForLocation(location?: string | null): Promise<WeatherSnapshot> {
  const preferredCity = extractCity(location) || "Beograd";
  const geo = await geocodeCity(preferredCity);

  if (!geo) {
    return {
      cityLabel: preferredCity,
      source: "Lokalni fallback",
      currentTemp: null,
      currentWind: null,
      forecast: fallbackForecast().map((item) => ({
        day: item.day,
        min: item.min,
        max: item.max,
        rain: item.rain,
      })),
    };
  }

  try {
    const query = new URLSearchParams({
      latitude: String(geo.latitude),
      longitude: String(geo.longitude),
      current: "temperature_2m,wind_speed_10m",
      daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
      timezone: "Europe/Belgrade",
      forecast_days: "3",
    });

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query.toString()}`, {
      next: { revalidate: 60 * 10 },
    });

    if (!response.ok) {
      throw new Error("Weather provider unavailable");
    }

    const weather = (await response.json()) as ForecastResponse;
    const times = weather.daily?.time || [];
    const forecast = times.slice(0, 3).map((day, index) => ({
      day: new Date(day).toLocaleDateString("sr-RS", { weekday: "long", day: "2-digit", month: "2-digit" }),
      min: typeof weather.daily?.temperature_2m_min?.[index] === "number" ? weather.daily.temperature_2m_min[index] : null,
      max: typeof weather.daily?.temperature_2m_max?.[index] === "number" ? weather.daily.temperature_2m_max[index] : null,
      rain: typeof weather.daily?.precipitation_probability_max?.[index] === "number" ? weather.daily.precipitation_probability_max[index] : null,
    }));

    const cityLabel = geo.admin1 ? `${geo.name}, ${geo.admin1}` : geo.name;

    return {
      cityLabel,
      source: "Open-Meteo",
      currentTemp: typeof weather.current?.temperature_2m === "number" ? weather.current.temperature_2m : null,
      currentWind: typeof weather.current?.wind_speed_10m === "number" ? weather.current.wind_speed_10m : null,
      forecast: forecast.length
        ? forecast
        : fallbackForecast().map((item) => ({
            day: item.day,
            min: item.min,
            max: item.max,
            rain: item.rain,
          })),
    };
  } catch {
    return {
      cityLabel: preferredCity,
      source: "Lokalni fallback",
      currentTemp: null,
      currentWind: null,
      forecast: fallbackForecast().map((item) => ({
        day: item.day,
        min: item.min,
        max: item.max,
        rain: item.rain,
      })),
    };
  }
}
