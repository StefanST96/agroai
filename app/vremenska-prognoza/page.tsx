import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/db";

type WeatherResponse = {
  current?: {
    time: string;
    temperature_2m: number;
    wind_speed_10m: number;
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
};

async function getWeatherData() {
  const cookieStore = await cookies();
  const profile = await getCurrentUser(cookieStore);
  if (!profile) {
    redirect("/login");
  }

  let weather: WeatherResponse | null = null;
  let source = "Open-Meteo";

  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=43.8558&longitude=19.8467&current=temperature_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FBelgrade",
      { next: { revalidate: 1800 } }
    );
    if (response.ok) {
      weather = (await response.json()) as WeatherResponse;
    } else {
      source = "Lokalni fallback";
    }
  } catch {
    source = "Lokalni fallback";
  }

  const fallbackDaily = [
    { day: "Danas", max: 29, min: 17, rain: 20 },
    { day: "Sutra", max: 31, min: 18, rain: 15 },
    { day: "Prekosutra", max: 28, min: 16, rain: 35 },
  ];

  return { profile, weather, source, fallbackDaily };
}

export default async function WeatherPage() {
  const { profile, weather, source, fallbackDaily } = await getWeatherData();

  const currentTemp = weather?.current?.temperature_2m;
  const currentWind = weather?.current?.wind_speed_10m;
  const daily = weather?.daily;

  const forecastItems = daily?.time?.length
    ? daily.time.slice(0, 3).map((day, index) => ({
        day: new Date(day).toLocaleDateString("sr-RS", { weekday: "long", day: "2-digit", month: "2-digit" }),
        min: daily.temperature_2m_min?.[index],
        max: daily.temperature_2m_max?.[index],
        rain: daily.precipitation_probability_max?.[index],
      }))
    : fallbackDaily.map((item) => ({
        day: item.day,
        min: item.min,
        max: item.max,
        rain: item.rain,
      }));

  function rainNote(rain?: number) {
    if (typeof rain !== "number") return "Bez podataka";
    if (rain >= 60) return "Visok rizik od padavina";
    if (rain >= 30) return "Moguca kisa";
    return "Nizak rizik od padavina";
  }

  return (
    <main className="main weather-page v2-page">
      <div className="topbar">
        <div>
          <div className="eyebrow">Vremenska prognoza</div>
          <h1>Prognoza za region korisnika ({profile.location || "Srbija"})</h1>
          <p className="muted">Izvor podataka: {source}</p>
        </div>
        <Link className="button secondary" href="/">
          Nazad na feed
        </Link>
      </div>

      <section className="weather-hero panel">
        <article className="weather-kpi-card">
          <h2>Trenutni uslovi</h2>
          <div className="weather-kpi-value">{typeof currentTemp === "number" ? `${currentTemp}°C` : "N/A"}</div>
          <p className="muted">Temperatura vazduha</p>
          <p>
            <strong>Vetar:</strong> {typeof currentWind === "number" ? `${currentWind} km/h` : "N/A"}
          </p>
        </article>

        <article className="weather-kpi-card accent">
          <h2>Agro preporuka</h2>
          <p className="muted">
            Planirajte tretmane i zalivanje u delu dana sa nizim temperaturama i slabijim vetrom.
          </p>
          <ul className="weather-tips">
            <li>Prskanje obavljajte rano ujutru ili predvece.</li>
            <li>Izbegavajte radove kada je vetar pojacan.</li>
            <li>Proverite padavine pre planiranja navodnjavanja.</li>
          </ul>
        </article>
      </section>

      <section className="panel weather-forecast-panel">
        <h2>3-dnevni pregled</h2>
        <div className="weather-forecast-grid">
          {forecastItems.map((item) => (
            <article className="weather-day-card" key={item.day}>
              <h3>{item.day}</h3>
              <p className="weather-temp-range">
                <strong>{item.min ?? "N/A"}°</strong> / <strong>{item.max ?? "N/A"}°</strong>
              </p>
              <p className="muted">Padavine: {typeof item.rain === "number" ? `${item.rain}%` : "N/A"}</p>
              <p className="weather-rain-note">{rainNote(item.rain)}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
