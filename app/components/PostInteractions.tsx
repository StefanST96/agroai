"use client";

import { useMemo, useState } from "react";

type CommentItem = {
  id: number;
  content: string;
  createdAt?: string;
  author?: {
    id: number;
    name: string;
    avatarUrl?: string | null;
  };
  likesCount?: number;
  likedByMe?: boolean;
  replies?: Array<{
    id: number;
    content: string;
    createdAt?: string;
    author?: {
      id: number;
      name: string;
      avatarUrl?: string | null;
    };
  }>;
};

type Props = {
  postId: number;
  initialLikes: number;
  initialComments: CommentItem[];
};

export default function PostInteractions({ postId, initialLikes, initialComments }: Props) {
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("Neprimeren sadrzaj");
  const [reportDetails, setReportDetails] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const commentsCount = useMemo(() => comments.length, [comments]);

  async function loadComments() {
    try {
      setIsLoadingComments(true);
      const response = await fetch(`/api/posts/${postId}/comments`);
      const data = await response.json().catch(() => []);
      if (!response.ok || !Array.isArray(data)) {
        return;
      }
      setComments(data as CommentItem[]);
    } finally {
      setIsLoadingComments(false);
    }
  }

  async function handleLike() {
    if (isLiking) return;

    try {
      setIsLiking(true);
      setFeedback("");

      const response = await fetch(`/api/posts/${postId}/likes`, {
        method: "POST",
      });

      if (response.status === 409) {
        setFeedback("Vec ste lajkovali ovu objavu.");
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setFeedback(data.error ?? "Like nije sacuvan.");
        return;
      }

      setLikesCount((prev) => prev + 1);
    } finally {
      setIsLiking(false);
    }
  }

  async function handleCommentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = commentText.trim();
    if (!text || isSendingComment) return;

    try {
      setIsSendingComment(true);
      setFeedback("");

      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: text }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setFeedback(data.error ?? "Komentar nije sacuvan.");
        return;
      }

      await loadComments();
      setCommentText("");
      setShowComments(true);
    } finally {
      setIsSendingComment(false);
    }
  }

  async function handleCommentLike(commentId: number) {
    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "likeComment", commentId }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setFeedback(data.error ?? "Lajk komentara nije sacuvan.");
      return;
    }

    await loadComments();
  }

  async function handleReplySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!replyTargetId) return;
    const text = replyText.trim();
    if (!text) return;

    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "reply", commentId: replyTargetId, content: text }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setFeedback(data.error ?? "Odgovor nije sacuvan.");
      return;
    }

    setReplyText("");
    setReplyTargetId(null);
    await loadComments();
  }

  async function handleShare() {
    const shareUrl = `${window.location.origin}/#post-${postId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "AgroAI objava",
          text: "Pogledaj ovu objavu na AgroAI platformi.",
          url: shareUrl,
        });
        return;
      } catch {
        // Ignore cancel and continue to clipboard fallback.
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setFeedback("Link objave je kopiran.");
    } catch {
      setFeedback("Deljenje nije uspelo. Pokusajte ponovo.");
    }
  }

  async function handleReportSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isReporting) return;

    try {
      setIsReporting(true);
      setFeedback("");

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetType: "POST",
          postId,
          reason: reportReason,
          details: reportDetails.trim() || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setFeedback(data.error ?? "Prijava nije poslata.");
        return;
      }

      setShowReportForm(false);
      setReportDetails("");
      setFeedback("Prijava je poslata administratoru.");
    } finally {
      setIsReporting(false);
    }
  }

  return (
    <>
      <div className="post-actions">
        <button type="button" onClick={handleLike} disabled={isLiking}>
          <span className="action-icon" aria-hidden>
            <svg viewBox="0 0 24 24">
              <path d="M8 11v9H5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 20h8a2 2 0 0 0 2-1.6l1-5a2 2 0 0 0-2-2.4h-5l.6-3a2.5 2.5 0 0 0-5-.5L7.6 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>{likesCount}</span>
        </button>
        <button
          type="button"
          onClick={async () => {
            const next = !showComments;
            setShowComments(next);
            if (next) {
              await loadComments();
            }
          }}
        >
          <span className="action-icon" aria-hidden>
            <svg viewBox="0 0 24 24">
              <path d="M4 5h16v10H9l-5 4V5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>{commentsCount}</span>
        </button>
        <button type="button" onClick={handleShare}>
          <span className="action-icon" aria-hidden>
            <svg viewBox="0 0 24 24">
              <path d="M7 12V6h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="m10 9 7-7 7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 13v7h14v-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>Podeli</span>
        </button>
        <button type="button" onClick={() => setShowReportForm((prev) => !prev)}>
          <span>Prijavi post</span>
        </button>
      </div>

      {showReportForm ? (
        <form className="post-report-form" onSubmit={handleReportSubmit}>
          <label>
            <span>Razlog</span>
            <select value={reportReason} onChange={(event) => setReportReason(event.target.value)}>
              <option value="Neprimeren sadrzaj">Neprimeren sadrzaj</option>
              <option value="Spam">Spam</option>
              <option value="Lazne informacije">Lazne informacije</option>
              <option value="Uznemiravanje">Uznemiravanje</option>
            </select>
          </label>
          <label>
            <span>Detalji (opciono)</span>
            <input
              value={reportDetails}
              onChange={(event) => setReportDetails(event.target.value)}
              placeholder="Dodajte kratak opis prijave"
            />
          </label>
          <button type="submit" disabled={isReporting}>
            {isReporting ? "Slanje..." : "Posalji prijavu"}
          </button>
        </form>
      ) : null}

      {showComments ? (
        <div className="post-comments-box">
          {isLoadingComments ? <p className="muted">Ucitavanje komentara...</p> : null}
          {comments.length ? (
            <ul className="post-comments-list rich-comments">
              {comments.map((comment) => (
                <li key={comment.id} className="post-comment-item">
                  <div className="post-comment-head">
                    <strong>{comment.author?.name || "Korisnik"}</strong>
                    {comment.createdAt ? <small>{new Date(comment.createdAt).toLocaleString("sr-RS")}</small> : null}
                  </div>
                  <p>{comment.content}</p>
                  <div className="post-comment-actions">
                    <button type="button" onClick={() => handleCommentLike(comment.id)}>
                      Lajk ({comment.likesCount ?? 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyTargetId(comment.id);
                        setReplyText("");
                      }}
                    >
                      Odgovori
                    </button>
                  </div>

                  {replyTargetId === comment.id ? (
                    <form className="post-comment-form" onSubmit={handleReplySubmit}>
                      <input
                        value={replyText}
                        onChange={(event) => setReplyText(event.target.value)}
                        placeholder="Napiši odgovor..."
                      />
                      <button type="submit" disabled={!replyText.trim()}>Pošalji</button>
                    </form>
                  ) : null}

                  {comment.replies?.length ? (
                    <ul className="post-comments-list post-replies-list">
                      {comment.replies.map((reply) => (
                        <li key={reply.id} className="post-comment-reply">
                          <div className="post-comment-head">
                            <strong>{reply.author?.name || "Korisnik"}</strong>
                            {reply.createdAt ? <small>{new Date(reply.createdAt).toLocaleString("sr-RS")}</small> : null}
                          </div>
                          <p>{reply.content}</p>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Nema komentara. Budite prvi.</p>
          )}

          <form className="post-comment-form" onSubmit={handleCommentSubmit}>
            <input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Dodaj komentar..."
            />
            <button type="submit" disabled={isSendingComment || !commentText.trim()}>
              {isSendingComment ? "Slanje..." : "Posalji"}
            </button>
          </form>
        </div>
      ) : null}

      {feedback ? <p className="form-feedback">{feedback}</p> : null}
    </>
  );
}
