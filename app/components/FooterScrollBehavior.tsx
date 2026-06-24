"use client";

import { useEffect } from "react";

type Props = {
  targetId: string;
};

export default function FooterScrollBehavior({ targetId }: Props) {
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const updateVisibility = () => {
      const target = document.getElementById(targetId);
      if (!target) return;

      const currentY = window.scrollY;
      const delta = currentY - lastY;
      const threshold = 6;

      if (currentY <= 8) {
        target.classList.remove("is-hidden");
      } else if (delta > threshold) {
        target.classList.add("is-hidden");
      } else if (delta < -threshold) {
        target.classList.remove("is-hidden");
      }

      lastY = currentY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [targetId]);

  return null;
}
