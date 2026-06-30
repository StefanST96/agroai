"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

type Props = {
  defaultValue?: string;
  tab?: string;
  category?: string;
  activityCity?: string;
};

export default function SearchBox({ defaultValue = "", tab = "all", category = "all", activityCity = "" }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [history, setHistory] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  function loadHistory() {
    try {
      const saved = JSON.parse(localStorage.getItem("search-history") || "[]");
      setHistory(Array.isArray(saved) ? saved : []);
    } catch {
      setHistory([]);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function saveSearch(value: string) {
    const q = value.trim();
    if (!q) return;

    const newHistory = [q, ...history.filter((x) => x !== q)].slice(0, 8);

    localStorage.setItem("search-history", JSON.stringify(newHistory));
    setHistory(newHistory);
  }

  function buildSearchHref(value: string) {
    const params = new URLSearchParams();
    const trimmed = value.trim();
    if (trimmed) params.set("q", trimmed);
    if (tab !== "all") params.set("tab", tab);
    if (category !== "all") params.set("cat", category);
    if (activityCity) params.set("activityCity", activityCity);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveSearch(query);
    setOpen(false);
    router.push(buildSearchHref(query));
  }

  return (
    <div ref={wrapperRef} className="search-wrapper" onClick={() => setOpen(true)}>
      <form
        className="search-box"
        action="/"
        method="get"
        onSubmit={handleSubmit}
      >
        <button className="search-submit" type="submit" aria-label="Pokreni pretragu">
            <span className="search-mark" aria-hidden>
              <Icon name="search" />
            </span>
          </button>

        <input
          name="q"
          value={query}
          autoComplete="off"
          placeholder="Pretraži savete, članke, ljude..."
          onFocus={() => {
            loadHistory();
            setOpen(true);
          }}
          onChange={(e) => setQuery(e.target.value)}
        />

        {tab !== "all" && (
          <input type="hidden" name="tab" value={tab} />
        )}

        {category !== "all" ? <input type="hidden" name="cat" value={category} /> : null}
        {activityCity ? <input type="hidden" name="activityCity" value={activityCity} /> : null}
      </form>

      {open ? (
        <div className="search-history">
          {history.length > 0 ? (
            <>
              {history.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="search-history-item"
                  onClick={() => {
                    saveSearch(item);
                    setQuery(item);
                    setOpen(false);
                    router.push(buildSearchHref(item));
                  }}
                >
                  <span>{item}</span>
                </button>
              ))}

              <button
                type="button"
                className="search-history-clear"
                onClick={() => {
                  localStorage.removeItem("search-history");
                  setHistory([]);
                }}
              >
                🗑 Obriši istoriju
              </button>
            </>
          ) : (
            <div className="search-history-empty">
              <strong>Nema istorije pretrage</strong>
              <small>Prva pretraga koju uradiš pojaviće se ovde.</small>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}