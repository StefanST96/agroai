import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser, getLatestAiConversationByUser } from "@/lib/db";
import AiChatPanel from "../components/AiChatPanel";

const aiSuggestions = [
  "Kako da zastitim malinu posle kise?",
  "Koje djubrivo ide za psenicu u ovoj fazi?",
  "Da li je vreme za tretman protiv plamenjace?",
  "Koji konkursi su otvoreni za vocare?",
];

const plantAnalyses = [
  {
    crop: "Malina",
    suspectedIssue: "Rani simptomi plamenjace lista",
    confidence: 82,
    severity: "Srednji rizik",
    recommendation:
      "Ukloni zarazene listove, popravi provetravanje i uradi preventivni tretman registrovanim preparatom kada nema direktnog sunca.",
    image:
      "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&w=760&q=80",
  },
];

async function getAiData() {
  const cookieStore = await cookies();
  const profile = await getCurrentUser(cookieStore);
  if (!profile) {
    redirect("/login");
  }
  const conversation = await getLatestAiConversationByUser(profile.id);

  return { profile, conversation };
}

export default async function AiAssistantPage() {
  const { profile, conversation } = await getAiData();
  const messages = conversation?.messages ?? [];

  return (
    <main className="main v2-page">
      <div className="topbar">
        <div>
          <div className="eyebrow">V2 AI asistent</div>
          <h1>Poljoprivredni AI savetnik</h1>
          <p className="muted">
            Pitaj za zastitu biljaka, prihranu, subvencije, pijacne cene ili analizu simptoma.
          </p>
        </div>
        <Link className="button secondary" href="/">
          Nazad na pocetnu
        </Link>
      </div>

      <section className="ai-layout">
        <div className="ai-chat panel">
          <div className="ai-chat-header">
            <div className="ai-avatar">AI</div>
            <div>
              <h2>AgroAI asistent</h2>
              <p className="muted">Online · odgovor za nekoliko sekundi</p>
            </div>
          </div>
          <AiChatPanel initialMessages={messages} suggestions={aiSuggestions} />
        </div>

        <aside className="ai-side grid">
          <section className="panel">
            <h2>Analiza slika</h2>
            <p className="muted">
              Upload slike lista ili ploda je dostupan na ekranu za bolesti biljaka.
            </p>
            <Link className="button" href="/bolesti-biljaka">
              Otvori analizu
            </Link>
          </section>

          <section className="panel">
            <h2>Poslednja analiza</h2>
            <img className="analysis-thumb" src={plantAnalyses[0].image} alt={plantAnalyses[0].crop} />
            <h3>{plantAnalyses[0].suspectedIssue}</h3>
            <p className="muted">
              {plantAnalyses[0].crop} · pouzdanost {plantAnalyses[0].confidence}%
            </p>
          </section>
        </aside>
      </section>

      <section className="panel v2-note">
        <h2>Profil konteksta</h2>
        <p>
          Asistent koristi profil korisnika ({profile?.location}, {profile?.farmName}) da predlozi
          prakticne korake za lokalne uslove. U produkciji se ovaj ekran povezuje na OpenAI API i cuva razgovore
          u `AiConversation` i `AiMessage` tabelama.
        </p>
      </section>
    </main>
  );
}
