"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type BannerItem = {
  id: number;
  title: string;
  body: string | null;
  ctaText: string | null;
  ctaHref: string | null;
  imageUrl: string | null;
  variant: "CARD" | "HERO";
  position: number;
  isActive: boolean;
  createdAt: string;
};

export type UserItem = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  location: string | null;
  createdAt: string;
  _count: {
    posts: number;
  };
};

export type ReportItem = {
  id: number;
  targetType: "POST" | "PROFILE";
  reason: string;
  details: string | null;
  status: "OPEN" | "REVIEWED" | "RESOLVED" | "REJECTED";
  createdAt: string;
  reporter: {
    id: number;
    name: string;
    username: string;
  };
  post: {
    id: number;
    title: string;
    authorId: number;
  } | null;
  reportedUser: {
    id: number;
    name: string;
    username: string;
  } | null;
};

type Props = {
  initialBanners: BannerItem[];
  initialUsers: UserItem[];
  initialReports: ReportItem[];
  canManageUsers: boolean;
  canManageReports: boolean;
};

export default function AdminDashboardClient({ initialBanners, initialUsers, initialReports, canManageUsers, canManageReports }: Props) {
  const [banners, setBanners] = useState(initialBanners);
  const [reports, setReports] = useState(initialReports);
  const [users, setUsers] = useState(initialUsers);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loadingRowId, setLoadingRowId] = useState<number | null>(null);

  const [reportStatusFilter, setReportStatusFilter] = useState<"ALL" | "OPEN" | "REVIEWED" | "RESOLVED" | "REJECTED">("ALL");
  const [reportQuery, setReportQuery] = useState("");
  const [reportPage, setReportPage] = useState(1);

  const [userRoleFilter, setUserRoleFilter] = useState<"ALL" | "USER" | "MODERATOR" | "ADMIN">("ALL");
  const [userQuery, setUserQuery] = useState("");
  const [userPage, setUserPage] = useState(1);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaHref, setCtaHref] = useState("");
  const [variant, setVariant] = useState<"CARD" | "HERO">("CARD");
  const [position, setPosition] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAssetId, setImageAssetId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<number | null>(null);

  const openReportsCount = useMemo(() => reports.filter((report) => report.status === "OPEN").length, [reports]);
  const ITEMS_PER_PAGE = 10;

  const filteredReports = useMemo(() => {
    const q = reportQuery.trim().toLowerCase();
    return reports.filter((report) => {
      if (reportStatusFilter !== "ALL" && report.status !== reportStatusFilter) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        report.reason,
        report.details || "",
        report.reporter.name,
        report.reporter.username,
        report.reportedUser?.name || "",
        report.reportedUser?.username || "",
        report.post?.title || "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [reportQuery, reportStatusFilter, reports]);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    return users.filter((user) => {
      if (userRoleFilter !== "ALL" && user.role !== userRoleFilter) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        user.name,
        user.username,
        user.email,
        user.location || "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [userQuery, userRoleFilter, users]);

  const reportTotalPages = Math.max(1, Math.ceil(filteredReports.length / ITEMS_PER_PAGE));
  const reportCurrentPage = Math.min(reportPage, reportTotalPages);
  const reportStart = (reportCurrentPage - 1) * ITEMS_PER_PAGE;
  const reportItems = filteredReports.slice(reportStart, reportStart + ITEMS_PER_PAGE);

  const userTotalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const userCurrentPage = Math.min(userPage, userTotalPages);
  const userStart = (userCurrentPage - 1) * ITEMS_PER_PAGE;
  const userItems = filteredUsers.slice(userStart, userStart + ITEMS_PER_PAGE);

  async function uploadBannerImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", "image");

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || typeof data.url !== "string" || typeof data.assetId !== "number") {
      throw new Error(data.error ?? "Upload slike bannera nije uspeo.");
    }

    setImageUrl(data.url);
    setImageAssetId(data.assetId);
  }

  function resetBannerForm() {
    setTitle("");
    setBody("");
    setCtaText("");
    setCtaHref("");
    setVariant("CARD");
    setPosition(0);
    setIsActive(true);
    setImageUrl("");
    setImageAssetId(null);
    setEditingBannerId(null);
  }

  function startBannerEdit(banner: BannerItem) {
    setEditingBannerId(banner.id);
    setTitle(banner.title);
    setBody(banner.body ?? "");
    setCtaText(banner.ctaText ?? "");
    setCtaHref(banner.ctaHref ?? "");
    setVariant(banner.variant);
    setPosition(banner.position);
    setIsActive(banner.isActive);
    setImageUrl(banner.imageUrl ?? "");
    setImageAssetId(null);
    setFeedback(`Izmena bannera #${banner.id}`);
    setError("");
  }

  async function handleBannerSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setFeedback("");
      setError("");

      const isEdit = editingBannerId !== null;
      const endpoint = isEdit ? `/api/admin/banners/${editingBannerId}` : "/api/admin/banners";

      const response = await fetch(endpoint, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          ctaText,
          ctaHref,
          variant,
          position,
          isActive,
          imageUrl: imageUrl || undefined,
          imageAssetId: imageAssetId ?? undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Banner nije sacuvan.");
        return;
      }

      if (isEdit) {
        setBanners((prev) => prev.map((banner) => (banner.id === data.id ? data : banner)));
        setFeedback("Banner je uspesno izmenjen.");
      } else {
        setBanners((prev) => [data, ...prev]);
        setFeedback("Banner je uspesno dodat.");
      }

      resetBannerForm();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateReportStatus(reportId: number, status: "OPEN" | "REVIEWED" | "RESOLVED" | "REJECTED") {
    const previous = reports;
    setReports((prev) => prev.map((report) => (report.id === reportId ? { ...report, status } : report)));

    const response = await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status }),
    });

    if (!response.ok) {
      setReports(previous);
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Status prijave nije sacuvan.");
      return;
    }

    setFeedback("Status prijave je azuriran.");
  }

  async function toggleBannerActive(bannerId: number, nextActive: boolean) {
    setLoadingRowId(bannerId);
    setError("");
    setFeedback("");

    const previous = banners;
    setBanners((prev) => prev.map((banner) => (banner.id === bannerId ? { ...banner, isActive: nextActive } : banner)));

    const response = await fetch(`/api/admin/banners/${bannerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: nextActive }),
    });

    if (!response.ok) {
      setBanners(previous);
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Status bannera nije sacuvan.");
      setLoadingRowId(null);
      return;
    }

    setFeedback("Status bannera je azuriran.");
    setLoadingRowId(null);
  }

  async function deleteBanner(bannerId: number) {
    setLoadingRowId(bannerId);
    setError("");
    setFeedback("");

    const previous = banners;
    setBanners((prev) => prev.filter((banner) => banner.id !== bannerId));

    const response = await fetch(`/api/admin/banners/${bannerId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setBanners(previous);
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Banner nije obrisan.");
      setLoadingRowId(null);
      return;
    }

    setFeedback("Banner je obrisan.");
    setLoadingRowId(null);
  }

  async function changeUserRole(userId: number, role: "USER" | "MODERATOR" | "ADMIN") {
    setLoadingRowId(userId);
    setError("");
    setFeedback("");

    const previous = users;
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)));

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      setUsers(previous);
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Uloga nije azurirana.");
      setLoadingRowId(null);
      return;
    }

    const updated = await response.json().catch(() => null);
    if (updated?.id) {
      setUsers((prev) => prev.map((user) => (user.id === updated.id ? { ...user, role: updated.role } : user)));
    }
    setFeedback("Uloga korisnika je azurirana.");
    setLoadingRowId(null);
  }

  return (
    <div className="grid admin-dashboard" style={{ gap: 16 }}>
      <section className="grid two-cols admin-kpi-grid">
        <div className="panel admin-kpi-card">
          {canManageUsers ? (
            <>
              <h3>Korisnici</h3>
              <strong>{users.length}</strong>
              <p className="muted">Ukupan broj registrovanih korisnika.</p>
            </>
          ) : (
            <>
              <h3>Aktivni bannery</h3>
              <strong>{banners.filter((banner) => banner.isActive).length}</strong>
              <p className="muted">Broj trenutno aktivnih bannera.</p>
            </>
          )}
        </div>
        <div className="panel admin-kpi-card">
          {canManageReports ? (
            <>
              <h3>Aktivne prijave</h3>
              <strong>{openReportsCount}</strong>
              <p className="muted">Prijave koje cekaju admin obradu.</p>
            </>
          ) : (
            <>
              <h3>Sadrzaj platforme</h3>
              <strong>{banners.length}</strong>
              <p className="muted">Ukupan broj bannera u sistemu.</p>
            </>
          )}
        </div>
      </section>

      <section className="panel admin-section">
        <h2>{editingBannerId ? `Izmeni banner #${editingBannerId}` : "Dodaj banner za desnu stranu"}</h2>
        <form className="form" onSubmit={handleBannerSubmit}>
          <div className="grid two-cols">
            <label className="field">
              <span>Naslov</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <label className="field">
              <span>Varijanta</span>
              <select value={variant} onChange={(event) => setVariant(event.target.value as "CARD" | "HERO")}>
                <option value="CARD">Kartica</option>
                <option value="HERO">Istaknuti</option>
              </select>
            </label>
            <label className="field">
              <span>Tekst</span>
              <input value={body} onChange={(event) => setBody(event.target.value)} />
            </label>
            <label className="field">
              <span>Pozicija (manji broj ide pre)</span>
              <input
                type="number"
                value={position}
                onChange={(event) => setPosition(Number.parseInt(event.target.value || "0", 10) || 0)}
              />
            </label>
            <label className="field">
              <span>CTA tekst</span>
              <input value={ctaText} onChange={(event) => setCtaText(event.target.value)} placeholder="Saznaj vise" />
            </label>
            <label className="field">
              <span>CTA link</span>
              <input value={ctaHref} onChange={(event) => setCtaHref(event.target.value)} placeholder="/subvencije" />
            </label>
            <label className="field">
              <span>Upload slike</span>
              <input
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  try {
                    setIsUploading(true);
                    await uploadBannerImage(file);
                    setFeedback("Slika bannera je uploadovana.");
                    setError("");
                  } catch (uploadError) {
                    setError(uploadError instanceof Error ? uploadError.message : "Upload nije uspeo.");
                  } finally {
                    setIsUploading(false);
                  }
                }}
              />
            </label>
            <label className="field" style={{ alignSelf: "end" }}>
              <span>Aktivan</span>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                style={{ width: 18, height: 18 }}
              />
            </label>
          </div>

          {imageUrl ? <img src={imageUrl} alt="Preview bannera" className="admin-banner-preview" /> : null}

          <button className="button" type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? "Cuvanje..." : editingBannerId ? "Sacuvaj izmene" : "Sacuvaj banner"}
          </button>
          {editingBannerId ? (
            <button
              type="button"
              className="button secondary"
              onClick={resetBannerForm}
              disabled={isSubmitting}
              style={{ marginLeft: 10 }}
            >
              Otkazi izmenu
            </button>
          ) : null}
        </form>
      </section>

      <section className="panel admin-section">
        <h2>Bannery u sistemu</h2>
        <div className="admin-table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Naslov</th>
                <th>Tip</th>
                <th>Pozicija</th>
                <th>Status</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner.id}>
                  <td>{banner.id}</td>
                  <td>{banner.title}</td>
                  <td>{banner.variant === "HERO" ? "Istaknuti" : "Kartica"}</td>
                  <td>{banner.position}</td>
                  <td>{banner.isActive ? "Aktivan" : "Neaktivan"}</td>
                  <td>
                    <div className="admin-inline-actions">
                      <button
                        type="button"
                        className="button secondary admin-mini-button"
                        onClick={() => startBannerEdit(banner)}
                        disabled={loadingRowId === banner.id}
                      >
                        Izmeni
                      </button>
                      <button
                        type="button"
                        className="button secondary admin-mini-button"
                        onClick={() => toggleBannerActive(banner.id, !banner.isActive)}
                        disabled={loadingRowId === banner.id}
                      >
                        {banner.isActive ? "Deaktiviraj" : "Aktiviraj"}
                      </button>
                      <button
                        type="button"
                        className="button secondary admin-mini-button danger"
                        onClick={() => deleteBanner(banner.id)}
                        disabled={loadingRowId === banner.id}
                      >
                        Obrisi
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {canManageReports ? (
      <section className="panel admin-section">
        <h2>Prijave</h2>
        <div className="admin-filters">
          <input
            placeholder="Pretraga prijava"
            value={reportQuery}
            onChange={(event) => {
              setReportQuery(event.target.value);
              setReportPage(1);
            }}
          />
          <select
            value={reportStatusFilter}
            onChange={(event) => {
              setReportStatusFilter(event.target.value as "ALL" | "OPEN" | "REVIEWED" | "RESOLVED" | "REJECTED");
              setReportPage(1);
            }}
          >
            <option value="ALL">Svi statusi</option>
            <option value="OPEN">OPEN</option>
            <option value="REVIEWED">REVIEWED</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
        <div className="admin-table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tip</th>
                <th>Razlog</th>
                <th>Prijavio</th>
                <th>Meta</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportItems.map((report) => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>{report.targetType}</td>
                  <td>
                    <strong>{report.reason}</strong>
                    {report.details ? <div className="muted">{report.details}</div> : null}
                  </td>
                  <td>
                    <Link href={`/korisnici/${report.reporter.username}`}>{report.reporter.name}</Link>
                  </td>
                  <td>
                    {report.targetType === "POST" && report.post ? (
                      <Link href={`/#post-${report.post.id}`}>Post #{report.post.id}</Link>
                    ) : null}
                    {report.targetType === "PROFILE" && report.reportedUser ? (
                      <Link href={`/korisnici/${report.reportedUser.username}`}>{report.reportedUser.name}</Link>
                    ) : null}
                  </td>
                  <td>
                    <select
                      value={report.status}
                      onChange={(event) => updateReportStatus(report.id, event.target.value as "OPEN" | "REVIEWED" | "RESOLVED" | "REJECTED")}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="REVIEWED">REVIEWED</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-table-footer">
          <small className="muted">{filteredReports.length} prijava</small>
          <div className="admin-pagination">
            <button
              type="button"
              className="button secondary admin-mini-button"
              onClick={() => setReportPage((prev) => Math.max(1, prev - 1))}
              disabled={reportCurrentPage <= 1}
            >
              Prethodna
            </button>
            <span>{reportCurrentPage}/{reportTotalPages}</span>
            <button
              type="button"
              className="button secondary admin-mini-button"
              onClick={() => setReportPage((prev) => Math.min(reportTotalPages, prev + 1))}
              disabled={reportCurrentPage >= reportTotalPages}
            >
              Sledeca
            </button>
          </div>
        </div>
      </section>
      ) : null}

      {canManageUsers ? (
        <section className="panel admin-section">
          <h2>Korisnici</h2>
          <div className="admin-filters">
            <input
              placeholder="Pretraga korisnika"
              value={userQuery}
              onChange={(event) => {
                setUserQuery(event.target.value);
                setUserPage(1);
              }}
            />
            <select
              value={userRoleFilter}
              onChange={(event) => {
                setUserRoleFilter(event.target.value as "ALL" | "USER" | "MODERATOR" | "ADMIN");
                setUserPage(1);
              }}
            >
              <option value="ALL">Sve uloge</option>
              <option value="USER">USER</option>
              <option value="MODERATOR">MODERATOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div className="admin-table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ime</th>
                  <th>Korisnicko ime</th>
                  <th>Email</th>
                  <th>Uloga</th>
                  <th>Objave</th>
                  <th>Akcija</th>
                </tr>
              </thead>
              <tbody>
                {userItems.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>
                      <Link href={`/korisnici/${user.username}`}>@{user.username}</Link>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(event) => changeUserRole(user.id, event.target.value as "USER" | "MODERATOR" | "ADMIN")}
                        disabled={loadingRowId === user.id}
                      >
                        <option value="USER">USER</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td>{user._count.posts}</td>
                    <td>
                      <Link className="button secondary admin-mini-button" href={`/korisnici/${user.username}`}>
                        Otvori profil
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="admin-table-footer">
            <small className="muted">{filteredUsers.length} korisnika</small>
            <div className="admin-pagination">
              <button
                type="button"
                className="button secondary admin-mini-button"
                onClick={() => setUserPage((prev) => Math.max(1, prev - 1))}
                disabled={userCurrentPage <= 1}
              >
                Prethodna
              </button>
              <span>{userCurrentPage}/{userTotalPages}</span>
              <button
                type="button"
                className="button secondary admin-mini-button"
                onClick={() => setUserPage((prev) => Math.min(userTotalPages, prev + 1))}
                disabled={userCurrentPage >= userTotalPages}
              >
                Sledeca
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {error ? <p className="form-feedback error">{error}</p> : null}
      {feedback ? <p className="form-feedback success">{feedback}</p> : null}
    </div>
  );
}
