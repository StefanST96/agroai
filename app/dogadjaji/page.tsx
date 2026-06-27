import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ActivityComposer from "@/app/components/ActivityComposer";
import ActivityOwnerActions from "@/app/components/ActivityOwnerActions";
import { getActivityCities, getCurrentUser, getPastActivities, getWeekendActivities } from "@/lib/db";

async function getEventsData(city?: string) {
  const cookieStore = await cookies();
  const profile = await getCurrentUser(cookieStore);
  if (!profile) {
    redirect("/login");
  }

  const [events, pastEvents, cities] = await Promise.all([
    getWeekendActivities(30, city),
    getPastActivities(30, city),
    getActivityCities(),
  ]);

  return { profile, events, pastEvents, cities };
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string | string[] }>;
}) {
  const params = await searchParams;
  const cityParam = params?.city;
  const city = (Array.isArray(cityParam) ? cityParam[0] : cityParam || "").trim();
  const { profile, events, pastEvents, cities } = await getEventsData(city || undefined);

  return (
    <main className="main">
      <div className="topbar">
        <div>
          <div className="eyebrow">Dogadjaji</div>
          <h1>Kalendar rokova i aktivnosti</h1>
          <p className="muted">Aktivnosti koje dodaju korisnici, sortirane po terminu ovog vikenda.</p>
        </div>
        <Link className="button secondary" href="/">
          Nazad na feed
        </Link>
      </div>

      <ActivityComposer />

      <section className="panel activity-filter-panel">
        <form className="activity-filter-form" method="get" action="/dogadjaji">
          <label className="field">
            <span>Filtriraj po gradu</span>
            <select name="city" defaultValue={city}>
              <option value="">Svi gradovi</option>
              {cities.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <button className="button secondary" type="submit">Primeni</button>
        </form>
      </section>
      <h2>Aktivne aktivnosti</h2>
      <section className="timeline">
        
        {events.length ? (
          events.map((event) => (
            <article className="panel subsidy-row" key={event.id}>
              <div>
                <span className="badge">Aktivnost</span>
                <h2>{event.title}</h2>
                <p className="muted">{event.category || "Lokalni dogadjaj"} · {event.city}</p>
                {event.description ? <p>{event.description}</p> : null}
                {event.imageUrl ? <img className="activity-card-image" src={event.imageUrl} alt={event.title} /> : null}
                <ActivityOwnerActions
                  currentUserId={profile.id}
                  activity={{
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    city: event.city,
                    location: event.location,
                    category: event.category,
                    startAt: event.startAt.toISOString(),
                    endAt: event.endAt ? event.endAt.toISOString() : null,
                    imageUrl: event.imageUrl,
                    createdById: event.createdById,
                  }}
                />
              </div>
              <div>
                <strong>{new Date(event.startAt).toLocaleString("sr-RS")}</strong>
                <p>{event.location || event.city}</p>
                <small className="muted">Dodao: {event.createdBy.name}</small>
              </div>
            </article>
          ))
        ) : (
          <section className="panel">
            <p>Nema zakazanih dogadjaja za prikaz.</p>
          </section>
        )}
      </section>
      <h2>Prosle aktivnosti</h2>
      <section className="timeline past-activities-section">
       
        {pastEvents.length ? (
          pastEvents.map((event) => (
            <article className="panel subsidy-row past-activity" key={`past-${event.id}`}>
              <div>
                <span className="badge subsidy-status-closed">Zavrseno</span>
                <h2>{event.title}</h2>
                <p className="muted">{event.category || "Lokalni dogadjaj"} · {event.city}</p>
                {event.description ? <p>{event.description}</p> : null}
                {event.imageUrl ? <img className="activity-card-image" src={event.imageUrl} alt={event.title} /> : null}
              </div>
              <div>
                <strong>{new Date(event.startAt).toLocaleString("sr-RS")}</strong>
                <p>{event.location || event.city}</p>
                <small className="muted">Dodao: {event.createdBy.name}</small>
              </div>
            </article>
          ))
        ) : (
          <section className="panel">
            <p>Nema proslih aktivnosti za prikaz.</p>
          </section>
        )}
      </section>
    </main>
  );
}
