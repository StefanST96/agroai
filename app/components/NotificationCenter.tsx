"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  isRead?: boolean;
};

export default function NotificationCenter() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  async function loadNotifications() {
    try {
      setLoading(true);
      const response = await fetch("/api/notifications");
      const data = await response.json().catch(() => ({ items: [], unread: 0 }));
      setItems(Array.isArray(data.items) ? data.items : []);
      setUnread(typeof data.unread === "number" ? data.unread : 0);
    } finally {
      setLoading(false);
    }
  }

  async function markNotificationRead(notificationId: string) {
    const previous = items;
    setItems((current) => current.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)));
    setUnread((current) => Math.max(0, current - 1));

    const response = await fetch(`/api/notifications/${encodeURIComponent(notificationId)}`, {
      method: "PATCH",
    });

    if (!response.ok) {
      setItems(previous);
      setUnread(previous.filter((item) => !item.isRead).length);
    }
  }

  async function handleOpenNotification(item: NotificationItem, event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (!item.isRead) {
      await markNotificationRead(item.id);
    }
    setOpen(false);
    router.push(item.href);
  }

  async function markAllRead() {
    const previous = items;
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnread(0);

    const response = await fetch("/api/notifications/read-all", {
      method: "POST",
    });

    if (!response.ok) {
      setItems(previous);
      setUnread(previous.filter((item) => !item.isRead).length);
      return;
    }

    router.refresh();
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="notification-center" ref={wrapperRef}>
      <button
        className="icon-button notification"
        type="button"
        aria-label="Obavestenja"
        onClick={async () => {
          const next = !open;
          setOpen(next);
          if (next) await loadNotifications();
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden>
          <path
            d="M6 10a6 6 0 1 1 12 0v5l2 2H4l2-2v-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 19a2 2 0 0 0 4 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unread > 0 ? <span>{unread}</span> : null}
      </button>

      {open ? (
        <div className="notification-menu">
          <div className="notification-header">
            <div className="notification-title">Obavestenja</div>
            {items.length ? (
              <button type="button" className="notification-mark-all" onClick={markAllRead}>
                Oznaci sve procitano
              </button>
            ) : null}
          </div>
          {loading ? <p className="muted">Ucitavanje...</p> : null}
          {!loading && !items.length ? <p className="muted">Nema novih obavestenja.</p> : null}
          {!loading
            ? items.map((item) => (
                <div className={`notification-item ${item.isRead ? "read" : "unread"}`} key={item.id}>
                  <Link href={item.href} onClick={(event) => handleOpenNotification(item, event)}>
                    <strong>{item.title}</strong>
                    <small>{item.body}</small>
                  </Link>
                  {!item.isRead ? (
                    <button type="button" className="notification-dismiss" onClick={() => markNotificationRead(item.id)}>
                      Oznaci procitano
                    </button>
                  ) : (
                    <small className="notification-read-label">Procitano</small>
                  )}
                </div>
              ))
            : null}
        </div>
      ) : null}
    </div>
  );
}
