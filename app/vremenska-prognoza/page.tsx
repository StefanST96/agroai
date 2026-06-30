import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/db";
import { getWeatherSnapshotForLocation } from "@/lib/weather";

async function getWeatherData() {
  const cookieStore = await cookies();
  const profile = await getCurrentUser(cookieStore);
  if (!profile) {
    redirect("/login");
  }

  const snapshot = await getWeatherSnapshotForLocation(profile.location || "");
  return { profile, snapshot };
}

export default async function WeatherPage() {
  const { profile, snapshot } = await getWeatherData();

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
          <h1>Prognoza za {snapshot.cityLabel || profile.location || "Srbija"}</h1>
          <p className="muted">Izvor podataka: {snapshot.source}</p>
        </div>
        <Link className="button secondary" href="/">
          Nazad na feed
        </Link>
      </div>

      <section className="weather-hero panel">
        <article className="weather-kpi-card">
          <h2>Trenutni uslovi</h2>
          <div className="weather-kpi-value">{typeof snapshot.currentTemp === "number" ? `${snapshot.currentTemp}°C` : "N/A"}</div>
          <p className="muted">Temperatura vazduha</p>
          <p>
            <strong>Vetar:</strong> {typeof snapshot.currentWind === "number" ? `${snapshot.currentWind} km/h` : "N/A"}
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
          {snapshot.forecast.map((item) => (
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
