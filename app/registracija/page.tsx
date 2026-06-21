"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RegistrationPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [farmName, setFarmName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function checkAuth() {
      const response = await fetch("/api/profile");
      if (response.ok) {
        router.replace("/");
      }
    }

    checkAuth();
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        name,
        username,
        email,
        phone,
        password,
        location,
        farmName,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Registration failed.");
      return;
    }

    setSuccess("Uspesno kreiran nalog. Automatski ste prijavljeni.");
    router.push("/");
  }

  return (
    <main className="main">
      <div className="topbar">
        <div>
          <div className="eyebrow">Registracija</div>
          <h1>Napravi AgroAI nalog</h1>
          <p className="muted">Podaci su uskladjeni sa V1 bazom: korisnik, profil i gazdinstvo.</p>
        </div>
        <Link className="button secondary" href="/">
          Nazad na feed
        </Link>
      </div>

      <section className="panel">
        <form className="form" onSubmit={handleSubmit}>
          <div className="grid two-cols">
            <label className="field">
              <span>Ime i prezime</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Milan Jovanovic"
              />
            </label>
            <label className="field">
              <span>Korisnicko ime</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="milan_farmer"
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="milan@agroai.rs"
                type="email"
              />
            </label>
            <label className="field">
              <span>Telefon</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+381 64 000 000"
              />
            </label>
            <label className="field">
              <span>Lozinka</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
              />
            </label>
            <label className="field">
              <span>Lokacija</span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Arilje"
              />
            </label>
          </div>
          <label className="field">
            <span>Naziv gazdinstva</span>
            <input
              value={farmName}
              onChange={(event) => setFarmName(event.target.value)}
              placeholder="Domacinstvo Jovanovic"
            />
          </label>
          <button className="button" type="submit">
            Registruj nalog
          </button>
          {error ? <p className="error-text">{error}</p> : null}
          {success ? <p className="success-text">{success}</p> : null}
        </form>
      </section>
    </main>
  );
}
