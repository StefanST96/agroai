import Link from "next/link";
import Icon from "../Icon";
import { exploreMoreCards } from "./constants";

export default function ExploreMoreSection() {
  return (
    <section className="explore-more-section">
      <h3>Istraži više</h3>
      <div className="explore-more-grid">
        {exploreMoreCards.map((item) => (
          <Link className="explore-more-card" href={item.href} key={item.label}>
            <span className="explore-more-icon"><Icon name={item.icon} /></span>
            <strong>{item.label}</strong>
            <small>{item.sub}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}
