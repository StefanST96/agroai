import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser, getPartners } from "@/lib/db";
import PartnerForm from "@/app/components/PartnerForm";
import PartnerDeleteButton from "@/app/components/PartnerDeleteButton";

async function ensureAuth() {
  const cookieStore = await cookies();
  const profile = await getCurrentUser(cookieStore);
  if (!profile) {
    redirect("/login");
  }
  return profile;
}

export default async function PartnersPage() {
  const profile = await ensureAuth();
  const partners = await getPartners();
  const isAdmin = profile.role === "ADMIN" || profile.role === "MODERATOR";

  return (
    <main className="main">
      <div className="topbar">
        <div>
          <div className="eyebrow">Prijatelji sajta</div>
          <h1>Mreza partnera AgroAI platforme</h1>
          <p className="muted">Kompanije i organizacije koje podrzavaju razvoj poljoprivredne zajednice.</p>
        </div>
        <Link className="button secondary" href="/">
          Nazad na feed
        </Link>
      </div>

      {isAdmin ? (
        <section className="panel">
          <h2>Dodaj novog partnera</h2>
          <PartnerForm />
        </section>
      ) : null}

      <section className="timeline">
        {partners.length ? partners.map((partner) => (
          <article className="panel subsidy-row" key={partner.id}>
            <div style={{ flex: 1 }}>
              {partner.logoUrl ? (
                <img src={partner.logoUrl} alt={partner.name} style={{ maxHeight: "60px", marginBottom: "8px", objectFit: "contain" }} />
              ) : null}
              <span className="badge">Partner</span>
              <h2>{partner.name}</h2>
              <p>{partner.description}</p>
              {partner.website ? (
                <a href={partner.website} target="_blank" rel="noopener noreferrer" className="muted">
                  Poseti sajt →
                </a>
              ) : null}
            </div>
            <div>
              <strong>{partner.category}</strong>
              <p className="muted">AgroAI saradnja</p>
              {isAdmin ? <PartnerDeleteButton partnerId={partner.id} /> : null}
            </div>
          </article>
        )) : (
          <p className="muted">Nema dostupnih partnera.</p>
        )}
      </section>
    </main>
  );
}
