import Icon from "../Icon";

type Props = {
  stats: {
    usersCount: number;
    postsCount: number;
    pricesUpdatedToday: number;
    activeDiscussions: number;
  };
};

export default function BottomStatsFooter({ stats }: Props) {
  return (
    <footer className="bottom-stats" id="feed-bottom-stats">
      <div>
        <span>
          <Icon name="stats-users" />
        </span>
        <strong>{stats.usersCount.toLocaleString("sr-RS")}</strong>
        <small>Aktivnih korisnika</small>
      </div>
      <div>
        <span>
          <Icon name="stats-posts" />
        </span>
        <strong>{stats.postsCount.toLocaleString("sr-RS")}</strong>
        <small>Podeljenih iskustava</small>
      </div>
      <div>
        <span>
          <Icon name="stats-price" />
        </span>
        <strong>{stats.pricesUpdatedToday.toLocaleString("sr-RS")}</strong>
        <small>Cena azurirano danas</small>
      </div>
      <div>
        <span>
          <Icon name="stats-chat" />
        </span>
        <strong>{stats.activeDiscussions.toLocaleString("sr-RS")}</strong>
        <small>Aktivnih diskusija</small>
      </div>
      <div>
        <span>
          <Icon name="stats-ai" />
        </span>
        <strong>AI Asistent</strong>
        <small>Dostupan 24/7</small>
      </div>
    </footer>
  );
}
