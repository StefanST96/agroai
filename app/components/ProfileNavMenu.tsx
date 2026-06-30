"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  name: string;
  location: string;
  avatarUrl: string;
  role?: "USER" | "MODERATOR" | "ADMIN";
};

export default function ProfileNavMenu({ name, location, avatarUrl, role }: Props) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="profile-menu" ref={wrapperRef}>
      <button className="mini-profile profile-toggle" type="button" onClick={() => setOpen((prev) => !prev)}>
        <span>
          <strong>{name}</strong>
          <small>{location}</small>
        </span>
        <img src={avatarUrl} alt={name || "Korisnik"}/>
      </button>

      <div className={`profile-dropdown ${open ? "open" : ""}`} aria-hidden={!open}>
        <Link href="/profil" onClick={() => setOpen(false)}>Moj profil</Link>
        {role === "ADMIN" || role === "MODERATOR" ? <Link href="/admin" onClick={() => setOpen(false)}>Dashboard</Link> : null}
        <button type="button" onClick={handleLogout}>Odjavi se</button>
      </div>
    </div>
  );
}
