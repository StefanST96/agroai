import React from "react";

export type IconName =
  | "home"
  | "bot"
  | "tips"
  | "market"
  | "funds"
  | "weather"
  | "plants"
  | "ads"
  | "events"
  | "users"
  | "partners"
  | "chat"
  | "bell"
  | "search"
  | "image"
  | "video"
  | "poll"
  | "tag"
  | "like"
  | "comment"
  | "share"
  | "stats-users"
  | "stats-posts"
  | "stats-price"
  | "stats-chat"
  | "stats-ai";

type Props = {
  name: IconName;
};

export default function Icon({ name }: Props) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "home":
      return (
        <svg viewBox="0 0 24 24">
          <path {...common} d="M3 10.5 12 3l9 7.5" />
          <path {...common} d="M5.5 9.5V20h13V9.5" />
        </svg>
      );

    case "bot":
      return (
        <svg viewBox="0 0 24 24">
          <rect {...common} x="4" y="7" width="16" height="12" rx="3" />
          <path {...common} d="M12 3v4" />
          <circle cx="9" cy="13" r="1" />
          <circle cx="15" cy="13" r="1" />
        </svg>
      );

    case "tips":
      return (
        <svg viewBox="0 0 24 24">
          <path
            {...common}
            d="M12 3a7 7 0 0 0-4 12.7V18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 3Z"
          />
          <path {...common} d="M9 21h6" />
        </svg>
      );

    case "market":
      return (
        <svg viewBox="0 0 24 24">
          <path {...common} d="M4 8h16l-1 12H5L4 8Z" />
          <path {...common} d="M9 8V6a3 3 0 1 1 6 0v2" />
        </svg>
      );

    case "funds":
      return (
        <svg viewBox="0 0 24 24">
          <rect {...common} x="4" y="3" width="16" height="18" rx="2" />
          <path {...common} d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );

    case "weather":
      return (
        <svg viewBox="0 0 24 24">
          <circle {...common} cx="9" cy="9" r="3" />
          <path
            {...common}
            d="M14.5 18a4 4 0 1 0-.8-7.9A5 5 0 1 0 6 16h8.5Z"
          />
        </svg>
      );

    case "plants":
      return (
        <svg viewBox="0 0 24 24">
          <path {...common} d="M12 21V10" />
          <path {...common} d="M12 11c0-4 3-7 7-7 0 4-3 7-7 7Z" />
          <path {...common} d="M12 14c0-3-2.5-5.5-5.5-5.5 0 3 2.5 5.5 5.5 5.5Z" />
        </svg>
      );

    case "ads":
      return (
        <svg viewBox="0 0 24 24">
          <path {...common} d="M4 14h5l8 4V6l-8 4H4v4Z" />
          <path {...common} d="M6 14v4" />
        </svg>
      );

    case "events":
      return (
        <svg viewBox="0 0 24 24">
          <rect {...common} x="4" y="5" width="16" height="15" rx="2" />
          <path {...common} d="M8 3v4M16 3v4M4 10h16" />
        </svg>
      );

    case "users":
      return (
        <svg viewBox="0 0 24 24">
          <circle {...common} cx="9" cy="8" r="3" />
          <path {...common} d="M3.5 19a5.5 5.5 0 0 1 11 0" />
          <circle {...common} cx="17" cy="10" r="2" />
        </svg>
      );

    case "partners":
      return (
        <svg viewBox="0 0 24 24">
          <path {...common} d="m12 20-6-3.5V7.5L12 4l6 3.5v9L12 20Z" />
          <path {...common} d="M8.5 12.5 11 15l4.5-5" />
        </svg>
      );

    case "chat":
      return (
        <svg viewBox="0 0 24 24">
          <path {...common} d="M4 5h16v11H8l-4 3V5Z" />
        </svg>
      );

    case "bell":
      return (
        <svg viewBox="0 0 24 24">
          <path
            {...common}
            d="M6 10a6 6 0 1 1 12 0v5l2 2H4l2-2v-5"
          />
          <path {...common} d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      );

    case "search":
      return (
        <svg viewBox="0 0 24 24">
          <circle {...common} cx="11" cy="11" r="6" />
          <path {...common} d="m20 20-4.2-4.2" />
        </svg>
      );

    case "image":
      return (
        <svg viewBox="0 0 24 24">
          <rect {...common} x="4" y="5" width="16" height="14" rx="2" />
          <path {...common} d="m8 14 3-3 5 5" />
        </svg>
      );

    case "video":
      return (
        <svg viewBox="0 0 24 24">
          <rect {...common} x="4" y="7" width="11" height="10" rx="2" />
          <path {...common} d="m15 10 5-2v8l-5-2" />
        </svg>
      );

    case "poll":
      return (
        <svg viewBox="0 0 24 24">
          <path {...common} d="M5 19V9M12 19V5M19 19v-7" />
        </svg>
      );

    case "tag":
      return (
        <svg viewBox="0 0 24 24">
          <path {...common} d="m20 10-8.5 8.5L4 11V4h7l9 6Z" />
          <circle {...common} cx="8" cy="8" r="1" />
        </svg>
      );

    case "like":
      return (
        <svg viewBox="0 0 24 24">
          <path {...common} d="M8 11v9H5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Z" />
          <path
            {...common}
            d="M8 20h8a2 2 0 0 0 2-1.6l1-5a2 2 0 0 0-2-2.4h-5l.6-3a2.5 2.5 0 0 0-5-.5L7.6 11"
          />
        </svg>
      );

    case "comment":
      return (
        <svg viewBox="0 0 24 24">
          <path {...common} d="M4 5h16v10H9l-5 4V5Z" />
        </svg>
      );

    case "share":
      return (
        <svg viewBox="0 0 24 24">
          <path {...common} d="M7 12V6h10" />
          <path {...common} d="m10 9 7-7 7 7" />
          <path {...common} d="M5 13v7h14v-7" />
        </svg>
      );

    case "stats-users":
      return (
        <svg viewBox="0 0 24 24">
          <circle {...common} cx="12" cy="8" r="3" />
          <path {...common} d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      );

    case "stats-posts":
      return (
        <svg viewBox="0 0 24 24">
          <path {...common} d="M6 12h12M6 7h12M6 17h8" />
        </svg>
      );

    case "stats-price":
      return (
        <svg viewBox="0 0 24 24">
          <path {...common} d="M5 18 11 12l3 3 5-6" />
          <path {...common} d="M19 9v4h-4" />
        </svg>
      );

    case "stats-chat":
      return (
        <svg viewBox="0 0 24 24">
          <path {...common} d="M4 5h16v11H8l-4 3V5Z" />
        </svg>
      );

    case "stats-ai":
      return (
        <svg viewBox="0 0 24 24">
          <rect {...common} x="5" y="7" width="14" height="11" rx="3" />
          <circle cx="10" cy="12.5" r="1" />
          <circle cx="14" cy="12.5" r="1" />
        </svg>
      );

    default:
      return null;
  }
}