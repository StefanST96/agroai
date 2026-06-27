"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

type Props = {
  defaultValue?: string;
  tab?: string;
};

export default function SearchBox({ defaultValue = "", tab = "all" }: Props) {
  const [query, setQuery] = useState(defaultValue);
  const [history, setHistory] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("search-history") || "[]");
    setHistory(saved);
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

  return (
    <div ref={wrapperRef} className="search-wrapper">
      <form
        className="search-box"
        action="/"
        method="get"
        onSubmit={() => saveSearch(query)}
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
          onFocus={() => setOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
        />

        {tab !== "all" && (
          <input type="hidden" name="tab" value={tab} />
        )}
      </form>

      {open && history.length > 0 && (
  <div className="search-history">
    {history.map((item) => (
      <button
        key={item}
        type="button"
        className="search-history-item"
        onClick={() => {
          setQuery(item);
          setOpen(false);
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
        setOpen(false);
      }}
    >
      🗑 Obriši istoriju
    </button>
  </div>
)}
    </div>
  );
}