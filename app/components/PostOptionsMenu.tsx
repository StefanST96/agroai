"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import DeletePostButton from "./DeletePostButton";

type Props = {
  postId: number;
  postTitle: string;
  authorHref: string;
  canManage: boolean;
};

export default function PostOptionsMenu({ postId, postTitle, authorHref, canManage }: Props) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  async function copyPostLink() {
    const postUrl = `${window.location.origin}/#post-${postId}`;

    try {
      await navigator.clipboard.writeText(postUrl);
      setFeedback("Link objave je kopiran.");
    } catch {
      setFeedback("Kopiranje linka nije uspelo.");
    }
  }

  return (
    <div className="post-options" ref={wrapperRef}>
      <button
        type="button"
        className="post-options-trigger"
        aria-label="Post opcije"
        onClick={() => {
          setOpen((prev) => !prev);
          setFeedback("");
        }}
      >
        ...
      </button>

      {open ? (
        <div className="post-options-menu">
          <strong>{postTitle}</strong>
          <Link href={authorHref} onClick={() => setOpen(false)}>
            Profil autora
          </Link>
          <button type="button" onClick={copyPostLink}>Kopiraj link objave</button>
          {canManage ? <DeletePostButton postId={postId} /> : null}
          {feedback ? <p className="form-feedback">{feedback}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
