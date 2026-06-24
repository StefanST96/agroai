"use client";

import { useEffect, useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  preventDefault?: boolean;
  stopPropagation?: boolean;
};

export default function ZoomableProfileImage({
  src,
  alt,
  className,
  preventDefault = false,
  stopPropagation = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`zoomable-profile-image${className ? ` ${className}` : ""}`}
        onClick={(event) => {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          setIsOpen(true);
        }}
      />

      {isOpen ? (
        <div className="profile-image-lightbox" role="dialog" aria-modal="true" aria-label="Uvecana profilna slika" onClick={() => setIsOpen(false)}>
          <button
            type="button"
            className="profile-image-lightbox-close"
            onClick={(event) => {
              event.stopPropagation();
              setIsOpen(false);
            }}
            aria-label="Zatvori uvecani prikaz"
          >
            ×
          </button>
          <img
            src={src}
            alt={alt}
            className="profile-image-lightbox-img"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
