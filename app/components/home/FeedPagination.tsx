import Link from "next/link";
import type { CategoryFilterValue, FeedTab } from "./constants";
import { buildHomeHref } from "./homeHref";

type Props = {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  query: string;
  tab: FeedTab;
  category: CategoryFilterValue;
  activityCity: string;
};

export default function FeedPagination({
  currentPage,
  totalPages,
  totalPosts,
  query,
  tab,
  category,
  activityCity,
}: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav className="feed-pagination" aria-label="Paginacija postova">
      <p className="muted">
        Strana {currentPage} od {totalPages} · Ukupno {totalPosts} postova
      </p>
      <div className="feed-pagination-actions">
        <Link
          className={`button secondary ${currentPage <= 1 ? "disabled" : ""}`}
          href={buildHomeHref({
            query,
            tab,
            category,
            activityCity,
            page: Math.max(1, currentPage - 1),
          })}
          aria-disabled={currentPage <= 1}
          tabIndex={currentPage <= 1 ? -1 : undefined}
        >
          Prethodna
        </Link>

        <span className="pagination-page">{currentPage}</span>

        <Link
          className={`button secondary ${currentPage >= totalPages ? "disabled" : ""}`}
          href={buildHomeHref({
            query,
            tab,
            category,
            activityCity,
            page: Math.min(totalPages, currentPage + 1),
          })}
          aria-disabled={currentPage >= totalPages}
          tabIndex={currentPage >= totalPages ? -1 : undefined}
        >
          Sledeca
        </Link>
      </div>
    </nav>
  );
}
