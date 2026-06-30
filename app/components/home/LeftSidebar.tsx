import Link from "next/link";
import Icon from "../Icon";
import { navGroups } from "./constants";

export default function LeftSidebar() {
  return (
    <aside className="social-sidebar">
      <nav className="social-nav">
        {navGroups.map((group, gi) => (
          <div className="nav-group" key={gi}>
            {group.label ? <span className="nav-group-label">{group.label}</span> : null}
            {group.items.map((item) => (
              <Link
                className={`social-nav-item ${item.href === "/" && gi === 0 ? "active" : ""}`}
                href={item.href}
                key={item.label}
              >
                <span aria-hidden><Icon name={item.icon} /></span>
                {item.label}
                {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <section className="premium-card">
        <div className="premium-icon">👑</div>
        <h3>Premium članstvo</h3>
        <p>Otključaj napredne AI savete, detaljne analize i još mnogo toga.</p>
        <Link className="premium-button" href="/ai-asistent">Nadogradi sada</Link>
      </section>

      <section className="version-card">
        <strong>AgroAI v2.0</strong>
        <span>AI saveti i analiza biljaka</span>
      </section>
    </aside>
  );
}
