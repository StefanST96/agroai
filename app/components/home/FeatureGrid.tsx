import Link from "next/link";
import Icon from "../Icon";
import { featureCards } from "./constants";

export default function FeatureGrid() {
  return (
    <section className="feature-grid">
      {featureCards.map((card) => (
        <article className={`feature-card ${card.tone}`} key={card.title}>
          <div className="feature-icon" aria-hidden>
            <Icon name={card.icon} />
          </div>
          <div>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
            <Link href={card.href}>{card.action} -&gt;</Link>
          </div>
        </article>
      ))}
    </section>
  );
}
