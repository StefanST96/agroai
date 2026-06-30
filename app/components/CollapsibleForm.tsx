"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Props = {
  id?: string;
  summary: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  defaultOpen?: boolean;
};

export default function CollapsibleForm({
  id,
  summary,
  children,
  className = "",
  style,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (!id) return;

    function syncWithHash() {
      if (window.location.hash === `#${id}`) {
        setOpen(true);
        requestAnimationFrame(() => {
          detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }

    syncWithHash();
    window.addEventListener("hashchange", syncWithHash);
    return () => window.removeEventListener("hashchange", syncWithHash);
  }, [id]);

  return (
    <details
      ref={detailsRef}
      id={id}
      className={`collapsible-form ${className}`.trim()}
      style={style}
      open={open}
      onToggle={(event) => setOpen((event.currentTarget as HTMLDetailsElement).open)}
    >
      <summary>{summary}</summary>
      <div className="collapsible-form-body">{children}</div>
    </details>
  );
}
