import Link from "next/link";
import { categoryFilters, type CategoryFilterValue, type FeedTab } from "./constants";
import { buildHomeHref } from "./homeHref";

type Props = {
  category: CategoryFilterValue;
  query: string;
  tab: FeedTab;
  activityCity: string;
};

export default function CategoryFilterBar({ category, query, tab, activityCity }: Props) {
  return (
    <div className="category-filter-bar">
      {categoryFilters.map((item) => (
        <Link
          key={item.value}
          href={buildHomeHref({
            query,
            tab,
            category: item.value,
            activityCity,
            page: 1,
          })}
          className={`category-filter-chip ${category === item.value ? "active" : ""}`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
