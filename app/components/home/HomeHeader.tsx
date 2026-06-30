import Link from "next/link";
import NotificationCenter from "../NotificationCenter";
import ProfileNavMenu from "../ProfileNavMenu";
import SearchBox from "../SearchBox";
import Icon from "../Icon";
import type { CategoryFilterValue, FeedTab } from "./constants";

type Props = {
  query: string;
  tab: FeedTab;
  category: CategoryFilterValue;
  activityCity: string;
  weatherSnapshot: {
    cityLabel: string;
    currentTemp: number | null;
  };
  profile: {
    name?: string | null;
    location?: string | null;
    role?: "USER" | "MODERATOR" | "ADMIN";
  };
  userAvatar: string;
};

export default function HomeHeader({
  query,
  tab,
  category,
  activityCity,
  weatherSnapshot,
  profile,
  userAvatar,
}: Props) {
  return (
    <header className="app-header">
      <Link className="logo" href="/">
        <span className="logo-mark" aria-hidden>
          <Icon name="plants" />
        </span>
        <span className="logo-text">
          <span>AgroAI</span>
          <small className="logo-subtitle">Zavičaj</small>
        </span>
      </Link>

      <SearchBox
        defaultValue={query}
        tab={tab}
        category={category}
        activityCity={activityCity}
      />

      <div className="header-actions">
        <Link className="weather-navbar-chip" href="/vremenska-prognoza" aria-label="Vremenska prognoza za tvoj grad">
          <span>{weatherSnapshot.cityLabel}</span>
          <strong>{typeof weatherSnapshot.currentTemp === "number" ? `${weatherSnapshot.currentTemp}°C` : "--"}</strong>
        </Link>

        <Link className="icon-button" href="/ai-asistent" aria-label="AI poruke">
          <Icon name="chat" />
        </Link>

        <NotificationCenter />

        <ProfileNavMenu
          name={profile?.name || "Korisnik"}
          location={profile?.location || "Srbija"}
          avatarUrl={userAvatar}
          role={profile.role}
        />
      </div>
    </header>
  );
}
