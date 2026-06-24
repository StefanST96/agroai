import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboardClient from "../components/AdminDashboardClient";
import type { BannerItem, ReportItem, UserItem } from "../components/AdminDashboardClient";
import { getCurrentUser, getReportsForAdmin, getSidebarBanners, getUsersForAdmin } from "@/lib/db";

async function getAdminData() {
  const cookieStore = await cookies();
  const user = await getCurrentUser(cookieStore);

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
    redirect("/");
  }

  const canManageUsers = user.role === "ADMIN";
  const canManageReports = user.role === "ADMIN";

  const [initialBanners, initialUsers, initialReports] = await Promise.all([
    getSidebarBanners(false),
    canManageUsers ? getUsersForAdmin() : Promise.resolve([]),
    canManageReports ? getReportsForAdmin() : Promise.resolve([]),
  ]);

  return { user, initialBanners, initialUsers, initialReports, canManageUsers, canManageReports };
}

export default async function AdminPage() {
  const { user, initialBanners, initialUsers, initialReports, canManageUsers, canManageReports } = await getAdminData();

  return (
    <main className="main admin-page">
      <section className="panel admin-hero">
        <div>
          <div className="eyebrow">Kontrolna tabla</div>
          <h1>{user.role === "ADMIN" ? "Admin Dashboard" : "Moderator Dashboard"}</h1>
          <p className="muted">Ulogovan: {user.name} ({user.role})</p>
          <p>
            {canManageUsers
              ? "Upravljanje korisnicima, prijavama i desnim bannerima na platformi."
              : "Upravljanje subvencijama i desnim bannerima na platformi."}
          </p>
        </div>
        <div className="actions">
          <Link className="button secondary" href="/">
            Nazad na feed
          </Link>
          <Link className="button" href="/profil">
            Moj profil
          </Link>
        </div>
      </section>

      <AdminDashboardClient
        initialBanners={initialBanners as unknown as BannerItem[]}
        initialUsers={initialUsers as unknown as UserItem[]}
        initialReports={initialReports as unknown as ReportItem[]}
        canManageUsers={canManageUsers}
        canManageReports={canManageReports}
      />
    </main>
  );
}
