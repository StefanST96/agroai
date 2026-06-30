import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="main" style={{ maxWidth: 760, margin: "0 auto", paddingTop: 24 }}>
      <section className="panel" style={{ textAlign: "center" }}>
        <div className="eyebrow">404</div>
        <h1>Stranica nije pronadjena</h1>
        <p className="muted" style={{ marginTop: 8 }}>
          Link je neispravan ili je stranica uklonjena.
        </p>
        <div className="actions" style={{ justifyContent: "center", marginTop: 14 }}>
          <Link className="button" href="/">
            Nazad na pocetnu
          </Link>
          <Link className="button secondary" href="/iskustva-i-saveti">
            Iskustva i saveti
          </Link>
        </div>
      </section>
    </main>
  );
}
