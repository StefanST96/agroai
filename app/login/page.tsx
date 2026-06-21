"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Login failed.");
      return;
    }

    setSuccess("Uspesno ste prijavljeni.");
    router.push("/");
  }

  return (
    <main className="main">
      <div className="topbar">
        <div>
          <div className="eyebrow">Login</div>
          <h1>Prijava na AgroAI</h1>
          <p className="muted">Forma za ulazak korisnika u zajednicu.</p>
        </div>
        <Link className="button secondary" href="/">
          Nazad na feed
        </Link>
      </div>

      <section className="panel">
        <form className="form" onSubmit={handleSubmit}>
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
            <span>Lozinka</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
            />
          </label>
          <button className="button" type="submit">
            Prijavi se
          </button>
          {error ? <p className="error-text">{error}</p> : null}
          {success ? <p className="success-text">{success}</p> : null}
          <p className="muted">
            Nemas nalog? <Link href="/registracija">Registruj se</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
